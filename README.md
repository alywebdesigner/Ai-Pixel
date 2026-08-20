# AI Pixel — Quotation Studio

Static ASP.NET Web Forms demo of a salesperson’s **Create Quotation** wizard.

The UI is a **single page** (`Default.aspx`) hosted in a **master page** (`Site.Master`) with a five-step form. Bootstrap 5.3 provides the grid, forms, and buttons. All catalogs, pricing, Gemini copy, and PDF output run in the browser with dummy data.

## Run the demo

There is no IIS / .NET runtime in this environment. A small Node host combines the master page and content page the same way Web Forms would:

```bash
node server.js
```

Then open `http://localhost:8080` (or `/Default.aspx`).

In Visual Studio you can still open `AiPixel.sln` and run under IIS Express; the wizard itself is client-side.

## Wizard steps

1. **Client** — name, email, phone, interactive map (drop pin, search, current location). Latitude and longitude are stored with the quote.
2. **Shutters** — one or more openings (type, width cm, height cm). Area (m²), weight (kg), and shutter price calculate live.
3. **Motors** — each opening shows curtain weight and required power. Only motors that can lift that weight are listed.
4. **Controllers** — optional extras on openings that have a powered motor.
5. **Summary** — review, notes, **Generate with Gemini AI**, then open the quotation as a PDF.

Use **Load demo data** on step 1 to fill a sample client, two openings, motors, and controllers.

## Stack

| Piece | Implementation |
| --- | --- |
| ASP.NET | Web Forms project (`Site.Master` + `Default.aspx`) |
| UI | Bootstrap 5.3.3 + Bootstrap Icons + custom `Content/Site.css` |
| Map | Leaflet + OpenStreetMap (free, no API key). Pin drop, drag, search (Photon), reverse geocode, HTML5 geolocation |
| Gemini | Static simulation of a Gemini round-trip using the quotation payload (no API key) |
| PDF | `html2pdf.js` (html2canvas + jsPDF) |

Google Maps JavaScript and the live Gemini API both require billed keys, so this demo uses free equivalents with the same salesperson workflow.

## Dummy catalog

Shutters, motors, and controllers live in `Scripts/data.js`. Pricing:

- Area = `(width_cm / 100) × (height_cm / 100)`
- Weight = area × material density (kg/m²)
- Shutter price = area × unit rate (12% oversize if width > 400 cm or height > 350 cm)
- Motors filtered by `maxWeightKg`
- 5% tax on the grand total
