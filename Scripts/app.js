(function () {
  const D = window.AiPixelData;
  const C = window.AiPixelCalc;

  const STEP_META = [
    { n: 1, title: "Client information", lede: "Capture the buyer’s details and drop a pin on the installation site." },
    { n: 2, title: "Shutter details", lede: "Specify every opening. Area, weight, and shutter price update as you type." },
    { n: 3, title: "Motor selection", lede: "Choose a motor that can lift each curtain. Unsuitable units are hidden." },
    { n: 4, title: "Controller selection", lede: "Add an optional controller to any opening that already has a motor." },
    { n: 5, title: "Summary", lede: "Review the estimate, add notes, then generate the client quotation with Gemini." }
  ];

  const state = {
    step: 1,
    maxStep: 1,
    quoteId: makeQuoteId(),
    client: { name: "", email: "", phone: "", lat: null, lng: null, address: "" },
    openings: [],
    notes: "",
    ai: null,
    map: null,
    marker: null
  };

  function makeQuoteId() {
    const n = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PIX-2026-0820-" + n;
  }

  function uid() {
    return "op-" + Math.random().toString(36).slice(2, 9);
  }

  function blankOpening(index) {
    return {
      id: uid(),
      name: "Opening " + index,
      shutterTypeId: D.shutterTypes[0].id,
      widthCm: "",
      heightCm: "",
      motorId: "",
      controllerId: "none"
    };
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function toast(message, isError) {
    const host = $("#toastHost");
    const el = document.createElement("div");
    el.className = "toast-msg" + (isError ? " is-error" : "");
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function setHint(field, msg) {
    $all('.invalid-hint[data-for="' + field + '"]').forEach((el) => {
      el.textContent = msg || "";
    });
  }

  /* ---------- map ---------- */

  function pinIcon() {
    return L.divIcon({
      className: "",
      html: '<div class="pin-icon"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
  }

  function initMap() {
    const map = L.map("map", { scrollWheelZoom: true }).setView([25.2048, 55.2708], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    map.on("click", (e) => dropPin(e.latlng.lat, e.latlng.lng, true));
    state.map = map;

    setTimeout(() => map.invalidateSize(), 200);
  }

  function dropPin(lat, lng, reverse) {
    state.client.lat = Number(lat.toFixed(6));
    state.client.lng = Number(lng.toFixed(6));
    if (!state.marker) {
      state.marker = L.marker([lat, lng], { icon: pinIcon(), draggable: true }).addTo(state.map);
      state.marker.on("dragend", () => {
        const p = state.marker.getLatLng();
        dropPin(p.lat, p.lng, true);
      });
    } else {
      state.marker.setLatLng([lat, lng]);
    }
    state.map.flyTo([lat, lng], Math.max(state.map.getZoom(), 15), { duration: 0.6 });
    renderCoords();
    setHint("location", "");
    if (reverse) reverseGeocode(lat, lng);
  }

  function renderCoords() {
    const el = $("#coordReadout");
    if (state.client.lat == null) {
      el.textContent = "No pin yet";
      return;
    }
    el.textContent = state.client.lat.toFixed(6) + ", " + state.client.lng.toFixed(6);
  }

  async function reverseGeocode(lat, lng) {
    try {
      const url =
        "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
        lat +
        "&longitude=" +
        lng +
        "&localityLanguage=en";
      const res = await fetch(url);
      const data = await res.json();
      const parts = [
        data.locality || data.city,
        data.principalSubdivision,
        data.countryName
      ].filter(Boolean);
      const line = (data.formattedAddress || parts.join(", ")).trim();
      if (line) {
        state.client.address = line;
        $("#clientAddress").value = line;
      }
    } catch (e) {
      /* address remains editable */
    }
  }

  async function searchPlaces(q) {
    const box = $("#searchResults");
    if (!q || q.length < 2) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    try {
      const res = await fetch("https://photon.komoot.io/api/?q=" + encodeURIComponent(q) + "&limit=5");
      const data = await res.json();
      const features = data.features || [];
      if (!features.length) {
        box.hidden = true;
        return;
      }
      box.hidden = false;
      box.innerHTML = features
        .map((f) => {
          const p = f.properties || {};
          const label = [p.name, p.street, p.city, p.country].filter(Boolean).join(", ");
          const [lng, lat] = f.geometry.coordinates;
          return '<li><button type="button" data-lat="' + lat + '" data-lng="' + lng + '">' + escapeHtml(label) + "</button></li>";
        })
        .join("");
    } catch (e) {
      box.hidden = true;
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast("Geolocation is not available in this browser.", true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => dropPin(pos.coords.latitude, pos.coords.longitude, true),
      () => toast("Could not read current location. Drop a pin on the map instead.", true),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /* ---------- openings ---------- */

  function addOpening() {
    state.openings.push(blankOpening(state.openings.length + 1));
    renderOpenings();
    updateTotals();
  }

  function removeOpening(id) {
    if (state.openings.length === 1) {
      toast("A quotation needs at least one opening.", true);
      return;
    }
    state.openings = state.openings.filter((o) => o.id !== id);
    renderOpenings();
    updateTotals();
  }

  function typeOptions(selected) {
    return D.shutterTypes
      .map(
        (t) =>
          '<option value="' +
          t.id +
          '"' +
          (t.id === selected ? " selected" : "") +
          ">" +
          t.name +
          "</option>"
      )
      .join("");
  }

  function renderOpenings() {
    const host = $("#openingsList");
    host.innerHTML = state.openings
      .map((o) => {
        const calc = C.computeOpening(o);
        return (
          '<div class="opening-card" data-id="' +
          o.id +
          '">' +
          '<div class="opening-head">' +
          '<input class="form-control" style="max-width:280px" data-field="name" value="' +
          escapeAttr(o.name) +
          '" />' +
          '<button type="button" class="btn btn-ghost btn-sm" data-remove="' +
          o.id +
          '"><i class="bi bi-trash"></i> Remove</button>' +
          "</div>" +
          '<div class="row g-3">' +
          '<div class="col-md-6"><label class="form-label">Shutter type</label>' +
          '<select class="form-select" data-field="shutterTypeId">' +
          typeOptions(o.shutterTypeId) +
          "</select>" +
          (calc.type ? '<small class="muted">' + escapeHtml(calc.type.material) + " · " + C.money(calc.type.pricePerM2) + "/m²</small>" : "") +
          "</div>" +
          '<div class="col-md-3"><label class="form-label">Width (cm)</label>' +
          '<input type="number" min="60" max="800" step="1" class="form-control" data-field="widthCm" value="' +
          escapeAttr(o.widthCm) +
          '" placeholder="e.g. 320" /></div>' +
          '<div class="col-md-3"><label class="form-label">Height (cm)</label>' +
          '<input type="number" min="60" max="700" step="1" class="form-control" data-field="heightCm" value="' +
          escapeAttr(o.heightCm) +
          '" placeholder="e.g. 280" /></div>' +
          "</div>" +
          '<div class="metrics">' +
          '<div class="metric"><span>Area</span><b>' +
          (calc.area ? calc.area.toFixed(2) + " m²" : "—") +
          "</b></div>" +
          '<div class="metric"><span>Weight</span><b>' +
          (calc.weight ? calc.weight.toFixed(1) + " kg" : "—") +
          "</b></div>" +
          '<div class="metric"><span>Shutter price</span><b>' +
          (calc.shutterPrice ? C.money(calc.shutterPrice) : "—") +
          "</b></div>" +
          "</div></div>"
        );
      })
      .join("");

    $("#shutterSubtotal").textContent = C.money(C.totals(state.openings).shutters);
  }

  function bindOpeningEvents() {
    function onOpeningField(e) {
      const card = e.target.closest(".opening-card");
      if (!card) return;
      const opening = state.openings.find((o) => o.id === card.getAttribute("data-id"));
      const field = e.target.getAttribute("data-field");
      if (!opening || !field) return;
      opening[field] = e.target.value;
      if (field === "motorId") return;
      /* live metrics without stealing focus */
      const calc = C.computeOpening(opening);
      const metrics = card.querySelector(".metrics");
      if (metrics) {
        metrics.innerHTML =
          '<div class="metric"><span>Area</span><b>' +
          (calc.area ? calc.area.toFixed(2) + " m²" : "—") +
          "</b></div>" +
          '<div class="metric"><span>Weight</span><b>' +
          (calc.weight ? calc.weight.toFixed(1) + " kg" : "—") +
          "</b></div>" +
          '<div class="metric"><span>Shutter price</span><b>' +
          (calc.shutterPrice ? C.money(calc.shutterPrice) : "—") +
          "</b></div>";
      }
      if (field === "shutterTypeId") {
        const small = card.querySelector("small.muted");
        if (small && calc.type) small.textContent = calc.type.material + " · " + C.money(calc.type.pricePerM2) + "/m²";
      }
      $("#shutterSubtotal").textContent = C.money(C.totals(state.openings).shutters);
      updateTotals();
    }
    $("#openingsList").addEventListener("input", onOpeningField);
    $("#openingsList").addEventListener("change", onOpeningField);

    $("#openingsList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      removeOpening(btn.getAttribute("data-remove"));
    });
  }

  /* ---------- motors / controllers ---------- */

  function renderMotors() {
    const host = $("#motorsList");
    host.innerHTML = state.openings
      .map((o) => {
        const calc = C.computeOpening(o);
        const suitable = C.suitableMotors(calc.weight);
        if (o.motorId && !suitable.some((m) => m.id === o.motorId)) o.motorId = "";
        const cards = suitable
          .map((m) => {
            const selected = o.motorId === m.id;
            const near = calc.weight && calc.weight / m.maxWeightKg > 0.9;
            return (
              '<button type="button" class="choice' +
              (selected ? " is-selected" : "") +
              '" data-opening="' +
              o.id +
              '" data-motor="' +
              m.id +
              '">' +
              "<strong>" +
              escapeHtml(m.name) +
              "</strong>" +
              "<small>" +
              escapeHtml(m.voltage) +
              (m.powerKw ? " · " + m.powerKw + " kW" : "") +
              (m.torqueNm ? " · " + m.torqueNm + " Nm" : "") +
              " · up to " +
              m.maxWeightKg +
              " kg</small>" +
              (near && selected ? '<small class="text-danger">Close to capacity</small>' : "") +
              '<div class="price">' +
              (m.price ? C.money(m.price) : "Included") +
              "</div></button>"
            );
          })
          .join("");
        return (
          '<div class="choice-block">' +
          '<div class="opening-head"><div><div class="opening-name">' +
          escapeHtml(o.name) +
          '</div><div class="muted">' +
          (calc.type ? escapeHtml(calc.type.name) : "") +
          " · " +
          (calc.weight ? calc.weight.toFixed(1) + " kg" : "enter size first") +
          "</div></div>" +
          '<span class="req-pill"><i class="bi bi-lightning-charge-fill"></i> Required: ' +
          escapeHtml(calc.required.label) +
          "</span></div>" +
          '<div class="choice-grid">' +
          cards +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderControllers() {
    const host = $("#controllersList");
    host.innerHTML = state.openings
      .map((o) => {
        const calc = C.computeOpening(o);
        if (!calc.hasMotor) {
          return (
            '<div class="choice-block"><div class="opening-name">' +
            escapeHtml(o.name) +
            '</div><p class="muted mb-0">No powered motor on this opening — controllers are unavailable.</p></div>'
          );
        }
        const cards = D.controllers
          .map((c) => {
            const selected = (o.controllerId || "none") === c.id;
            return (
              '<button type="button" class="choice' +
              (selected ? " is-selected" : "") +
              '" data-opening="' +
              o.id +
              '" data-controller="' +
              c.id +
              '"><strong>' +
              escapeHtml(c.name) +
              "</strong><small>" +
              escapeHtml(c.blurb) +
              '</small><div class="price">' +
              (c.price ? C.money(c.price) : "No charge") +
              "</div></button>"
            );
          })
          .join("");
        return (
          '<div class="choice-block"><div class="opening-head"><div><div class="opening-name">' +
          escapeHtml(o.name) +
          "</div><div class=\"muted\">" +
          escapeHtml(calc.motor.name) +
          "</div></div></div><div class=\"choice-grid\">" +
          cards +
          "</div></div>"
        );
      })
      .join("");
  }

  /* ---------- summary ---------- */

  function renderSummary() {
    const t = C.totals(state.openings);
    const c = state.client;
    const rows = state.openings
      .map((o, i) => {
        const calc = t.rows[i];
        return (
          "<tr><td><strong>" +
          escapeHtml(o.name) +
          "</strong><div class='muted'>" +
          (calc.type ? escapeHtml(calc.type.name) : "") +
          " · " +
          o.widthCm +
          " × " +
          o.heightCm +
          " cm</div></td>" +
          "<td class='num'>" +
          (calc.area ? calc.area.toFixed(2) + " m²" : "—") +
          "<div class='muted'>" +
          (calc.weight ? calc.weight.toFixed(1) + " kg" : "") +
          "</div></td>" +
          "<td>" +
          (calc.motor ? escapeHtml(calc.motor.name) : "—") +
          "</td>" +
          "<td>" +
          (calc.hasMotor && calc.controller && calc.controller.id !== "none" ? escapeHtml(calc.controller.name) : "—") +
          "</td>" +
          "<td class='num'><strong>" +
          C.money(calc.lineTotal) +
          "</strong></td></tr>"
        );
      })
      .join("");

    $("#summaryPanel").innerHTML =
      '<h3 class="panel-title">Review</h3>' +
      '<div class="client-mini">' +
      "<div><span>Client</span><strong>" +
      escapeHtml(c.name) +
      "</strong></div>" +
      "<div><span>Email</span>" +
      escapeHtml(c.email) +
      "</div>" +
      "<div><span>Phone</span>" +
      escapeHtml(c.phone) +
      "</div>" +
      "<div><span>Location</span>" +
      escapeHtml(c.address || (c.lat + ", " + c.lng)) +
      "<div class='muted'>" +
      (c.lat != null ? c.lat.toFixed(6) + ", " + c.lng.toFixed(6) : "") +
      "</div></div></div>" +
      '<div class="table-responsive"><table class="summary-table"><thead><tr>' +
      "<th>Opening</th><th class='num'>Area / weight</th><th>Motor</th><th>Controller</th><th class='num'>Line</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>";

    $("#totalsCard").innerHTML =
      "<h3>Grand total</h3>" +
      '<div class="tot-row"><span>Shutters</span><b>' +
      C.money(t.shutters) +
      "</b></div>" +
      '<div class="tot-row"><span>Motors</span><b>' +
      C.money(t.motors) +
      "</b></div>" +
      '<div class="tot-row"><span>Controllers</span><b>' +
      C.money(t.controllers) +
      "</b></div>" +
      '<div class="tot-row"><span>Subtotal</span><b>' +
      C.money(t.subtotal) +
      "</b></div>" +
      '<div class="tot-row"><span>Tax (5%)</span><b>' +
      C.money(t.tax) +
      "</b></div>" +
      '<div class="tot-row grand"><span>Total</span><b>' +
      C.money(t.grand) +
      "</b></div>" +
      '<p class="muted mt-3 mb-0">Quote ' +
      state.quoteId +
      " · valid until 19 Sep 2026</p>";
  }

  function updateTotals() {
    const t = C.totals(state.openings);
    $("#railGrandTotal").textContent = C.money(t.grand);
    const hdrTotal = $("#hdrTotal");
    if (hdrTotal) hdrTotal.textContent = C.money(t.grand);
    $("#railShutters").textContent = C.money(t.shutters);
    $("#railMotors").textContent = C.money(t.motors);
    $("#railControllers").textContent = C.money(t.controllers);
    const count = state.openings.filter((o) => o.widthCm && o.heightCm).length;
    $("#railTotalMeta").textContent = count ? count + " opening" + (count === 1 ? "" : "s") + " · incl. 5% tax" : "No line items yet";
    $("#railBars").hidden = !t.subtotal;
  }

  /* ---------- gemini (static demo) ---------- */

  function buildGeminiPayload() {
    const t = C.totals(state.openings);
    return {
      model: "gemini-1.5-flash (demo)",
      quoteId: state.quoteId,
      client: state.client,
      openings: state.openings.map((o, i) => ({
        name: o.name,
        shutter: t.rows[i].type ? t.rows[i].type.name : "",
        widthCm: o.widthCm,
        heightCm: o.heightCm,
        areaM2: t.rows[i].area,
        weightKg: t.rows[i].weight,
        shutterPrice: t.rows[i].shutterPrice,
        motor: t.rows[i].motor ? t.rows[i].motor.name : "",
        controller: t.rows[i].controller ? t.rows[i].controller.name : "",
        lineTotal: t.rows[i].lineTotal
      })),
      totals: t,
      notes: state.notes
    };
  }

  function composeGemini(payload) {
    const first = payload.client.name.split(" ")[0] || "there";
    const n = payload.openings.length;
    const site = payload.client.address || "the recorded site coordinates";
    const lines = payload.openings
      .map(
        (o) =>
          "• " +
          o.name +
          " — " +
          o.shutter +
          " at " +
          o.widthCm +
          " × " +
          o.heightCm +
          " cm (" +
          o.areaM2.toFixed(2) +
          " m², " +
          o.weightKg.toFixed(1) +
          " kg), driven by " +
          o.motor +
          (o.controller && o.controller !== "No controller" ? " with " + o.controller : "") +
          " — " +
          C.money(o.lineTotal)
      )
      .join("\n");

    const letter =
      "Dear " +
      first +
      ",\n\n" +
      "Thank you for inviting AI Pixel to price " +
      n +
      " shutter opening" +
      (n === 1 ? "" : "s") +
      " at " +
      site +
      ". We have sized each curtain from the widths and heights you supplied, converted those into area and estimated curtain weight, and then matched a motor with enough torque to lift that weight comfortably.\n\n" +
      "Recommended specification\n" +
      lines +
      "\n\n" +
      "Commercial offer: " +
      C.money(payload.totals.subtotal) +
      " plus 5% tax (" +
      C.money(payload.totals.tax) +
      "), for a total of " +
      C.money(payload.totals.grand) +
      ". This quotation (" +
      payload.quoteId +
      ") is valid until 19 September 2026 and excludes civil works, lifting equipment, and out-of-hours labour unless noted below.\n\n" +
      (payload.notes ? "Your notes have been carried onto the face of the PDF: " + payload.notes + "\n\n" : "") +
      "If you would like us to proceed, reply with a preferred installation window and we will lock colours, lead time (typically 10–14 working days), and a site survey.\n\n" +
      "Kind regards,\n" +
      D.company.estimator +
      "\n" +
      D.company.estimatorTitle +
      " · " +
      D.company.name;

    const suggestions = [];
    const hasFire = payload.openings.some((o) => /Fire-Rated/i.test(o.shutter));
    const missingCtrl = payload.openings.some((o) => !o.controller || o.controller === "No controller");
    const heavy = payload.openings.some((o) => o.weightKg > 150);
    const multi = payload.openings.length > 1;
    const poly = payload.openings.some((o) => /Polycarbonate/i.test(o.shutter));
    const insulated = payload.openings.some((o) => /Insulated/i.test(o.shutter));

    if (missingCtrl) suggestions.push("Add a photocell safety set on any powered opening that currently has no controller — it is the lowest-cost way to meet closing-safety expectations on a public frontage.");
    if (multi) suggestions.push("A 4-channel remote would let the client operate every opening from one handset; we can swap the single-channel kits without changing the motor selection.");
    if (heavy) suggestions.push("The heavier industrial curtains should be commissioned with a two-person crew and a scissor lift. Confirm three-phase supply at the head before we ship the 400 V operators.");
    if (hasFire) suggestions.push("The EI60 shutter will need the fire-alarm interface and a drop-test certificate at handover. We can include that pack as a variation.");
    if (poly) suggestions.push("Specify UV-stabilised polycarbonate and a 5-year yellowing warranty — showroom fronts in the Gulf see intense solar load.");
    if (!insulated && Math.abs(payload.client.lat) < 35) suggestions.push("Given the site climate, an insulated sandwich curtain on the largest opening would cut heat gain and motor duty-cycle. Happy to re-price that swap.");
    suggestions.push("Motors carry a 24-month parts warranty; curtains carry 12 months. Offer an annual service visit if the doors will cycle more than 20 times a day.");
    suggestions.push("Share the PDF with the client today and hold the steel allocation until 19 September 2026.");

    return { letter, suggestions: suggestions.slice(0, 5) };
  }

  async function generateWithGemini() {
    const btn = $("#btnGemini");
    const status = $("#geminiStatus");
    const out = $("#geminiOutput");
    btn.disabled = true;
    status.hidden = false;
    out.hidden = true;

    const payload = buildGeminiPayload();
    /* Static demo: emulate a Gemini round-trip, then compose from the same payload. */
    await new Promise((r) => setTimeout(r, 1600));
    const ai = composeGemini(payload);
    state.ai = ai;

    out.hidden = false;
    status.hidden = true;
    out.innerHTML =
      "<h4>Quotation letter</h4>" +
      '<div class="letter">' +
      escapeHtml(ai.letter) +
      "</div>" +
      "<h4 class='mt-4'>Suggestions for the client</h4>" +
      '<ul class="suggest-list">' +
      ai.suggestions.map((s) => "<li>" + escapeHtml(s) + "</li>").join("") +
      "</ul>" +
      '<div class="mt-3 d-flex gap-2 flex-wrap">' +
      '<button type="button" class="btn btn-navy" id="btnOpenPdf"><i class="bi bi-file-earmark-pdf"></i> Open PDF</button>' +
      '<button type="button" class="btn btn-ghost" id="btnDownloadPdf"><i class="bi bi-download"></i> Download PDF</button>' +
      "</div>";

    btn.disabled = false;
    toast("Gemini returned the quotation. Opening the PDF…");
    await openPdf(false);
  }

  function pdfHtml() {
    const t = C.totals(state.openings);
    const c = state.client;
    const ai = state.ai || composeGemini(buildGeminiPayload());
    const rows = state.openings
      .map((o, i) => {
        const r = t.rows[i];
        return (
          "<tr><td>" +
          escapeHtml(o.name) +
          "<br><span style='color:#6d645b;font-size:11px'>" +
          (r.type ? escapeHtml(r.type.name) : "") +
          "</span></td><td>" +
          o.widthCm +
          " × " +
          o.heightCm +
          " cm</td><td>" +
          r.area.toFixed(2) +
          " m²<br>" +
          r.weight.toFixed(1) +
          " kg</td><td>" +
          (r.motor ? escapeHtml(r.motor.name) : "—") +
          "</td><td>" +
          (r.hasMotor && r.controller && r.controller.id !== "none" ? escapeHtml(r.controller.name) : "—") +
          "</td><td style='text-align:right'>" +
          C.money(r.lineTotal) +
          "</td></tr>"
        );
      })
      .join("");

    return (
      '<div style="font-family:Manrope,Segoe UI,sans-serif;color:#161310;width:210mm;padding:16mm 16mm 12mm;box-sizing:border-box;background:#fff;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #12233b;padding-bottom:12px;">' +
      '<div><div style="font-family:Georgia,serif;font-size:26px;color:#12233b;">AI Pixel</div>' +
      '<div style="letter-spacing:3px;text-transform:uppercase;font-size:10px;color:#c8962e;">Building Systems · Quotation Studio</div>' +
      '<div style="font-size:11px;color:#6d645b;margin-top:6px;">' +
      D.company.email +
      " · " +
      D.company.phone +
      "</div></div>" +
      '<div style="text-align:right;font-size:12px;"><strong>' +
      state.quoteId +
      "</strong><br>20 August 2026<br>Valid until 19 September 2026</div></div>" +
      '<h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:18px 0 8px;">Quotation</h1>' +
      '<div style="display:flex;gap:24px;font-size:12px;margin-bottom:14px;">' +
      "<div><div style='color:#6d645b;text-transform:uppercase;font-size:10px;'>Prepared for</div><strong>" +
      escapeHtml(c.name) +
      "</strong><br>" +
      escapeHtml(c.email) +
      "<br>" +
      escapeHtml(c.phone) +
      "</div>" +
      "<div><div style='color:#6d645b;text-transform:uppercase;font-size:10px;'>Site</div>" +
      escapeHtml(c.address || "") +
      "<br>Lat " +
      c.lat.toFixed(6) +
      " · Lng " +
      c.lng.toFixed(6) +
      "</div></div>" +
      '<table style="width:100%;border-collapse:collapse;font-size:11px;">' +
      "<thead><tr style='background:#12233b;color:#f7f1e6;'>" +
      "<th style='text-align:left;padding:8px;'>Opening</th><th style='text-align:left;padding:8px;'>Size</th>" +
      "<th style='text-align:left;padding:8px;'>Area / wt</th><th style='text-align:left;padding:8px;'>Motor</th>" +
      "<th style='text-align:left;padding:8px;'>Controller</th><th style='text-align:right;padding:8px;'>Amount</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table>" +
      '<div style="margin-top:12px;margin-left:auto;width:240px;font-size:12px;">' +
      '<div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Shutters</span><span>' +
      C.money(t.shutters) +
      "</span></div>" +
      '<div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Motors</span><span>' +
      C.money(t.motors) +
      "</span></div>" +
      '<div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Controllers</span><span>' +
      C.money(t.controllers) +
      "</span></div>" +
      '<div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Tax 5%</span><span>' +
      C.money(t.tax) +
      "</span></div>" +
      '<div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:2px solid #12233b;font-size:16px;font-family:Georgia,serif;"><span>Total</span><strong>' +
      C.money(t.grand) +
      "</strong></div></div>" +
      (state.notes
        ? '<div style="margin-top:16px;font-size:11px;"><strong>Notes</strong><br>' + escapeHtml(state.notes) + "</div>"
        : "") +
      '<div style="margin-top:18px;padding:12px;background:#f3efe8;border-radius:8px;font-size:11px;white-space:pre-wrap;line-height:1.45;">' +
      escapeHtml(ai.letter) +
      "</div>" +
      '<div style="margin-top:12px;font-size:11px;"><strong>Suggestions</strong><ul style="margin:6px 0 0;padding-left:16px;">' +
      ai.suggestions.map((s) => "<li>" + escapeHtml(s) + "</li>").join("") +
      "</ul></div>" +
      '<div style="margin-top:22px;display:flex;justify-content:space-between;font-size:11px;color:#6d645b;">' +
      "<div>Prepared by " +
      D.company.estimator +
      "<br>Signature ______________________</div>" +
      "<div>Dummy demonstration quotation · not a live offer.</div></div></div>"
    );
  }

  async function makePdfBlob() {
    const wrap = document.createElement("div");
    wrap.innerHTML = pdfHtml();
    wrap.style.position = "fixed";
    wrap.style.left = "-12000px";
    wrap.style.top = "0";
    document.body.appendChild(wrap);
    const opt = {
      margin: 0,
      filename: state.quoteId + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    const worker = html2pdf().set(opt).from(wrap.firstChild);
    const blob = await worker.outputPdf("blob");
    wrap.remove();
    return blob;
  }

  async function openPdf(downloadOnly) {
    try {
      const blob = await makePdfBlob();
      const url = URL.createObjectURL(blob);
      if (downloadOnly) {
        const a = document.createElement("a");
        a.href = url;
        a.download = state.quoteId + ".pdf";
        a.click();
      } else {
        const w = window.open(url, "_blank");
        if (!w) {
          toast("Pop-up blocked — downloading the PDF instead.");
          const a = document.createElement("a");
          a.href = url;
          a.download = state.quoteId + ".pdf";
          a.click();
        }
      }
    } catch (e) {
      toast("Could not convert the quotation to PDF.", true);
    }
  }

  /* ---------- wizard ---------- */

  function collectClient() {
    state.client.name = $("#clientName").value.trim();
    state.client.email = $("#clientEmail").value.trim();
    state.client.phone = $("#clientPhone").value.trim();
    state.client.address = $("#clientAddress").value.trim();
  }

  function validate(step) {
    $all(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    $all(".invalid-hint").forEach((el) => (el.textContent = ""));

    if (step === 1) {
      collectClient();
      let ok = true;
      if (state.client.name.length < 2) {
        $("#clientName").classList.add("is-invalid");
        setHint("clientName", "Enter the client’s name.");
        ok = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.client.email)) {
        $("#clientEmail").classList.add("is-invalid");
        setHint("clientEmail", "Enter a valid email.");
        ok = false;
      }
      if (state.client.phone.replace(/\D/g, "").length < 7) {
        $("#clientPhone").classList.add("is-invalid");
        setHint("clientPhone", "Enter a phone number.");
        ok = false;
      }
      if (state.client.lat == null || state.client.lng == null) {
        setHint("location", "Drop a pin on the map or use current location.");
        ok = false;
      }
      return ok;
    }

    if (step === 2) {
      if (!state.openings.length) {
        setHint("openings", "Add at least one shutter opening.");
        return false;
      }
      let ok = true;
      state.openings.forEach((o) => {
        const w = Number(o.widthCm);
        const h = Number(o.heightCm);
        if (!o.shutterTypeId || !w || !h || w < 60 || h < 60) ok = false;
      });
      if (!ok) setHint("openings", "Each opening needs a type, width (cm), and height (cm).");
      return ok;
    }

    if (step === 3) {
      const missing = state.openings.some((o) => !o.motorId);
      if (missing) {
        setHint("motors", "Select a motor for every opening.");
        return false;
      }
      return true;
    }

    return true;
  }

  function go(step) {
    state.step = step;
    if (step > state.maxStep) state.maxStep = step;

    $all(".wizard-step").forEach((el) => {
      const n = Number(el.getAttribute("data-step"));
      const on = n === step;
      el.classList.toggle("is-visible", on);
      el.hidden = !on;
    });

    const meta = STEP_META[step - 1];
    $("#stepEyebrow").textContent = "Step " + step + " of 5";
    $("#stepTitle").textContent = meta.title;
    $("#stepLede").textContent = meta.lede;
    $("#progressFill").style.width = step * 20 + "%";

    $all(".step-link").forEach((btn) => {
      const n = Number(btn.getAttribute("data-goto"));
      btn.classList.toggle("is-active", n === step);
      btn.classList.toggle("is-done", n < step);
      btn.disabled = n > state.maxStep;
      const idx = btn.querySelector(".step-index");
      if (n < step) idx.innerHTML = '<i class="bi bi-check-lg"></i>';
      else idx.textContent = String(n);
    });

    $("#btnBack").hidden = step === 1;
    $("#btnNext").hidden = step === 5;
    $("#btnDemoData").hidden = step === 5;

    if (step === 1 && state.map) setTimeout(() => state.map.invalidateSize(), 50);
    if (step === 2) renderOpenings();
    if (step === 3) renderMotors();
    if (step === 4) renderControllers();
    if (step === 5) {
      state.notes = $("#quoteNotes").value;
      renderSummary();
    }
    updateTotals();
  }

  function loadDemo() {
    const d = D.demo;
    state.client = Object.assign({}, d.client);
    $("#clientName").value = d.client.name;
    $("#clientEmail").value = d.client.email;
    $("#clientPhone").value = d.client.phone;
    $("#clientAddress").value = d.client.address;
    dropPin(d.client.lat, d.client.lng, false);
    state.openings = d.openings.map((o, i) => Object.assign(blankOpening(i + 1), o, { id: uid() }));
    state.notes = d.notes;
    $("#quoteNotes").value = d.notes;
    state.maxStep = 5;
    renderOpenings();
    go(state.step);
    toast("Demo client, two openings, motors, and controllers loaded.");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function bind() {
    $("#hdrQuoteId").textContent = state.quoteId;

    $("#clientName").addEventListener("input", collectClient);
    $("#clientEmail").addEventListener("input", collectClient);
    $("#clientPhone").addEventListener("input", collectClient);
    $("#clientAddress").addEventListener("input", () => {
      state.client.address = $("#clientAddress").value;
    });
    $("#quoteNotes").addEventListener("input", () => {
      state.notes = $("#quoteNotes").value;
    });

    $("#btnCurrentLocation").addEventListener("click", useCurrentLocation);

    let searchTimer = null;
    $("#mapSearch").addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => searchPlaces(e.target.value), 280);
    });
    $("#searchResults").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      dropPin(Number(btn.getAttribute("data-lat")), Number(btn.getAttribute("data-lng")), true);
      $("#searchResults").hidden = true;
      $("#mapSearch").value = btn.textContent;
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".map-search")) $("#searchResults").hidden = true;
    });

    $("#btnAddOpening").addEventListener("click", addOpening);
    bindOpeningEvents();

    $("#motorsList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-motor]");
      if (!btn) return;
      const opening = state.openings.find((o) => o.id === btn.getAttribute("data-opening"));
      if (!opening) return;
      opening.motorId = btn.getAttribute("data-motor");
      if (C.findMotor(opening.motorId).kind === "manual") opening.controllerId = "none";
      renderMotors();
      updateTotals();
    });

    $("#controllersList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-controller]");
      if (!btn) return;
      const opening = state.openings.find((o) => o.id === btn.getAttribute("data-opening"));
      if (!opening) return;
      opening.controllerId = btn.getAttribute("data-controller");
      renderControllers();
      updateTotals();
    });

    $("#btnNext").addEventListener("click", () => {
      if (!validate(state.step)) return;
      go(state.step + 1);
    });
    $("#btnBack").addEventListener("click", () => go(Math.max(1, state.step - 1)));
    $all(".step-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.getAttribute("data-goto"));
        if (n < state.step || (n > state.step && validate(state.step))) go(n);
        else if (n < state.maxStep) go(n);
      });
    });

    $("#btnDemoData").addEventListener("click", loadDemo);
    $("#btnGemini").addEventListener("click", generateWithGemini);

    $("#geminiOutput").addEventListener("click", (e) => {
      if (e.target.closest("#btnOpenPdf")) openPdf(false);
      if (e.target.closest("#btnDownloadPdf")) openPdf(true);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    state.openings = [blankOpening(1)];
    bind();
    initMap();
    renderOpenings();
    updateTotals();
    go(1);
  });
})();
