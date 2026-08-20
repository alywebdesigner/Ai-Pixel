/* Dummy catalog used by the static quotation demo. */
window.AiPixelData = {
  company: {
    name: "AI Pixel Building Systems",
    studio: "Quotation Studio",
    email: "quotes@aipixel.demo",
    phone: "+1 (800) 555-0148",
    web: "www.aipixel.demo",
    estimator: "Alex Rivera",
    estimatorTitle: "Senior Estimator",
    taxRate: 0.05,
    validityDays: 30
  },

  shutterTypes: [
    {
      id: "steel-std",
      name: "Standard Steel Roller Shutter",
      material: "Galvanized steel 0.8 mm",
      pricePerM2: 165,
      densityKgM2: 11.5,
      blurb: "Everyday commercial curtain for shops and service bays."
    },
    {
      id: "insulated",
      name: "Insulated Sandwich Shutter",
      material: "PU foam + steel skins",
      pricePerM2: 245,
      densityKgM2: 14.8,
      blurb: "Thermal break for loading docks and conditioned interiors."
    },
    {
      id: "perforated",
      name: "Perforated Vision Shutter",
      material: "Punched galvanized steel",
      pricePerM2: 198,
      densityKgM2: 9.2,
      blurb: "Night-time visibility and ventilation with security."
    },
    {
      id: "polycarb",
      name: "Polycarbonate Transparent Shutter",
      material: "UV polycarbonate slats",
      pricePerM2: 320,
      densityKgM2: 7.5,
      blurb: "Showroom frontage that stays bright after hours."
    },
    {
      id: "aluminium",
      name: "Aluminium Roller Shutter",
      material: "Extruded aluminium 1.2 mm",
      pricePerM2: 210,
      densityKgM2: 6.8,
      blurb: "Light, corrosion-resistant curtain for coastal sites."
    },
    {
      id: "industrial",
      name: "Heavy-Duty Industrial Steel",
      material: "Steel 1.2 mm, wind-locked",
      pricePerM2: 275,
      densityKgM2: 18.5,
      blurb: "High-cycle warehouse and factory openings."
    },
    {
      id: "grille",
      name: "Security Grille Shutter",
      material: "Brick-bond steel grille",
      pricePerM2: 230,
      densityKgM2: 13.2,
      blurb: "Open-grille protection for malls and arcades."
    },
    {
      id: "fire",
      name: "Fire-Rated Steel Shutter (EI60)",
      material: "Fire-rated steel assembly",
      pricePerM2: 410,
      densityKgM2: 22.0,
      blurb: "Compartmentation shutter with 60-minute integrity."
    }
  ],

  motors: [
    {
      id: "manual",
      name: "Manual chain hoist",
      kind: "manual",
      torqueNm: 0,
      powerKw: 0,
      maxWeightKg: 40,
      voltage: "—",
      price: 0,
      blurb: "Spring-balanced curtain with interior chain."
    },
    {
      id: "tub-40",
      name: "Compact tubular 40 Nm",
      kind: "tubular",
      torqueNm: 40,
      powerKw: 0.18,
      maxWeightKg: 25,
      voltage: "230 V",
      price: 189,
      blurb: "Quiet tube motor for compact aluminium curtains."
    },
    {
      id: "tub-60",
      name: "Tubular motor 60 Nm",
      kind: "tubular",
      torqueNm: 60,
      powerKw: 0.24,
      maxWeightKg: 40,
      voltage: "230 V",
      price: 245,
      blurb: "Standard shopfront tube motor with obstacle stop."
    },
    {
      id: "tub-120",
      name: "Tubular motor 120 Nm",
      kind: "tubular",
      torqueNm: 120,
      powerKw: 0.38,
      maxWeightKg: 70,
      voltage: "230 V",
      price: 365,
      blurb: "High-torque tube motor for wider insulated curtains."
    },
    {
      id: "side-037",
      name: "Side motor 0.37 kW",
      kind: "industrial",
      torqueNm: 180,
      powerKw: 0.37,
      maxWeightKg: 110,
      voltage: "230 V",
      price: 520,
      blurb: "Offset gearbox for mid-weight commercial doors."
    },
    {
      id: "side-055",
      name: "Side motor 0.55 kW",
      kind: "industrial",
      torqueNm: 260,
      powerKw: 0.55,
      maxWeightKg: 160,
      voltage: "230 V",
      price: 680,
      blurb: "Workhorse 230 V operator with emergency chain."
    },
    {
      id: "ind-075",
      name: "Industrial 0.75 kW",
      kind: "industrial",
      torqueNm: 380,
      powerKw: 0.75,
      maxWeightKg: 220,
      voltage: "400 V 3~",
      price: 890,
      blurb: "Three-phase operator for logistics openings."
    },
    {
      id: "ind-150",
      name: "Industrial 1.5 kW",
      kind: "industrial",
      torqueNm: 620,
      powerKw: 1.5,
      maxWeightKg: 350,
      voltage: "400 V 3~",
      price: 1240,
      blurb: "High-inertia industrial drive with brake."
    },
    {
      id: "ind-220",
      name: "Heavy-duty 2.2 kW",
      kind: "industrial",
      torqueNm: 900,
      powerKw: 2.2,
      maxWeightKg: 520,
      voltage: "400 V 3~",
      price: 1680,
      blurb: "Maximum catalog capacity for fire and industrial curtains."
    }
  ],

  controllers: [
    { id: "none", name: "No controller", price: 0, needsMotor: false, blurb: "Motor-only or manual operation." },
    { id: "wall", name: "Surface wall switch", price: 45, needsMotor: true, blurb: "Open / stop / close station." },
    { id: "key", name: "Key-switch station", price: 78, needsMotor: true, blurb: "Restricted access at the jamb." },
    { id: "remote1", name: "1-channel remote kit", price: 95, needsMotor: true, blurb: "Handheld transmitter + receiver." },
    { id: "remote4", name: "4-channel remote kit", price: 145, needsMotor: true, blurb: "One handset for multiple openings." },
    { id: "photo", name: "Photocell safety set", price: 120, needsMotor: true, blurb: "Through-beam closing protection." },
    { id: "wifi", name: "Smart Wi-Fi controller", price: 210, needsMotor: true, blurb: "App control and status alerts." },
    { id: "gsm", name: "GSM / 4G controller", price: 265, needsMotor: true, blurb: "Open by call or SMS, no LAN needed." },
    { id: "combo", name: "Remote + photocell + timer", price: 340, needsMotor: true, blurb: "Premium safety and scheduling pack." }
  ],

  demo: {
    client: {
      name: "Marina El-Sayed",
      email: "marina.elsayed@ateliernorth.com",
      phone: "+971 50 123 4567",
      lat: 25.1874,
      lng: 55.2697,
      address: "Building 6, Dubai Design District, Dubai, United Arab Emirates"
    },
    openings: [
      { name: "Showroom entrance", shutterTypeId: "polycarb", widthCm: 420, heightCm: 340, motorId: "side-037", controllerId: "combo" },
      { name: "Service bay", shutterTypeId: "industrial", widthCm: 480, heightCm: 420, motorId: "ind-075", controllerId: "photo" }
    ],
    notes: "RAL 9006 powder coat to match existing shopfront. Installation after 18:00. Scaffolding by client."
  }
};

window.AiPixelCalc = {
  money(n) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
  },

  round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  },

  findShutter(id) {
    return window.AiPixelData.shutterTypes.find((s) => s.id === id) || null;
  },

  findMotor(id) {
    return window.AiPixelData.motors.find((m) => m.id === id) || null;
  },

  findController(id) {
    return window.AiPixelData.controllers.find((c) => c.id === id) || null;
  },

  areaM2(widthCm, heightCm) {
    if (!widthCm || !heightCm) return 0;
    return this.round2((Number(widthCm) / 100) * (Number(heightCm) / 100));
  },

  weightKg(type, area) {
    if (!type || !area) return 0;
    return this.round2(area * type.densityKgM2);
  },

  shutterPrice(type, widthCm, heightCm) {
    const area = this.areaM2(widthCm, heightCm);
    if (!type || !area) return 0;
    const oversize = Number(widthCm) > 400 || Number(heightCm) > 350 ? 1.12 : 1;
    return this.round2(area * type.pricePerM2 * oversize);
  },

  requiredPower(weightKg) {
    const w = weightKg || 0;
    if (w <= 25) return { label: "40 Nm tubular", minKw: 0.18, minNm: 40, maxWeight: 25 };
    if (w <= 40) return { label: "60 Nm tubular", minKw: 0.24, minNm: 60, maxWeight: 40 };
    if (w <= 70) return { label: "120 Nm tubular", minKw: 0.38, minNm: 120, maxWeight: 70 };
    if (w <= 110) return { label: "0.37 kW side motor", minKw: 0.37, minNm: 180, maxWeight: 110 };
    if (w <= 160) return { label: "0.55 kW side motor", minKw: 0.55, minNm: 260, maxWeight: 160 };
    if (w <= 220) return { label: "0.75 kW industrial", minKw: 0.75, minNm: 380, maxWeight: 220 };
    if (w <= 350) return { label: "1.5 kW industrial", minKw: 1.5, minNm: 620, maxWeight: 350 };
    return { label: "2.2 kW heavy-duty", minKw: 2.2, minNm: 900, maxWeight: 520 };
  },

  suitableMotors(weightKg) {
    const w = weightKg || 0;
    let list = window.AiPixelData.motors.filter((m) => m.maxWeightKg >= w);
    if (!list.length) {
      list = window.AiPixelData.motors.slice(-1);
    }
    return list;
  },

  computeOpening(opening) {
    const type = this.findShutter(opening.shutterTypeId);
    const area = this.areaM2(opening.widthCm, opening.heightCm);
    const weight = this.weightKg(type, area);
    const shutterPrice = this.shutterPrice(type, opening.widthCm, opening.heightCm);
    const motor = this.findMotor(opening.motorId);
    const controller = this.findController(opening.controllerId);
    const motorPrice = motor ? motor.price : 0;
    const hasMotor = motor && motor.kind !== "manual";
    const controllerPrice = hasMotor && controller ? controller.price : 0;
    const required = this.requiredPower(weight);
    return {
      type,
      area,
      weight,
      shutterPrice,
      motor,
      controller,
      motorPrice,
      controllerPrice,
      hasMotor,
      required,
      lineTotal: this.round2(shutterPrice + motorPrice + controllerPrice)
    };
  },

  totals(openings) {
    const rows = openings.map((o) => this.computeOpening(o));
    const shutters = this.round2(rows.reduce((s, r) => s + r.shutterPrice, 0));
    const motors = this.round2(rows.reduce((s, r) => s + r.motorPrice, 0));
    const controllers = this.round2(rows.reduce((s, r) => s + r.controllerPrice, 0));
    const subtotal = this.round2(shutters + motors + controllers);
    const tax = this.round2(subtotal * window.AiPixelData.company.taxRate);
    const grand = this.round2(subtotal + tax);
    return { rows, shutters, motors, controllers, subtotal, tax, grand };
  }
};
