<%@ Page Title="Create Quotation" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="AiPixel.Default" %>

<asp:Content ID="HeadContent" ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <section class="wizard" id="wizard">
        <header class="step-heading">
            <div>
                <p class="eyebrow" id="stepEyebrow">Step 1 of 5</p>
                <h2 id="stepTitle">Client information</h2>
                <p class="lede" id="stepLede">Capture the buyer’s details and drop a pin on the installation site.</p>
            </div>
            <button type="button" class="btn btn-ghost" id="btnDemoData">
                <i class="bi bi-magic"></i> Load demo data
            </button>
        </header>

        <!-- STEP 1 · CLIENT -->
        <article class="wizard-step is-visible" data-step="1" id="step-1">
            <div class="row g-4">
                <div class="col-lg-5">
                    <div class="panel">
                        <h3 class="panel-title">Contact</h3>
                        <div class="mb-3">
                            <label class="form-label" for="clientName">Client name</label>
                            <input type="text" class="form-control" id="clientName" name="clientName" autocomplete="name" placeholder="e.g. Marina El-Sayed" />
                            <div class="invalid-hint" data-for="clientName"></div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="clientEmail">Email</label>
                            <input type="email" class="form-control" id="clientEmail" name="clientEmail" autocomplete="email" placeholder="marina@studio.co" />
                            <div class="invalid-hint" data-for="clientEmail"></div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="clientPhone">Phone</label>
                            <input type="tel" class="form-control" id="clientPhone" name="clientPhone" autocomplete="tel" placeholder="+971 50 000 0000" />
                            <div class="invalid-hint" data-for="clientPhone"></div>
                        </div>
                        <div class="mb-0">
                            <label class="form-label" for="clientAddress">Site address</label>
                            <textarea class="form-control" id="clientAddress" name="clientAddress" rows="2" placeholder="Filled from the map pin — you can edit it"></textarea>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="panel map-panel">
                        <div class="map-toolbar">
                            <h3 class="panel-title mb-0">Installation location</h3>
                            <button type="button" class="btn btn-gold btn-sm" id="btnCurrentLocation">
                                <i class="bi bi-geo-alt-fill"></i> Select current location
                            </button>
                        </div>
                        <div class="map-search">
                            <i class="bi bi-search"></i>
                            <input type="search" id="mapSearch" class="form-control" placeholder="Search a place, then drop a pin…" autocomplete="off" />
                            <ul class="search-results" id="searchResults" hidden></ul>
                        </div>
                        <div id="map" class="map-canvas" role="application" aria-label="Interactive map to drop a client location pin"></div>
                        <div class="map-footer">
                            <div>
                                <span class="muted">Click the map to drop a pin. Lat / lng update automatically.</span>
                                <div class="coords" id="coordReadout">No pin yet</div>
                            </div>
                            <div class="invalid-hint" data-for="location"></div>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <!-- STEP 2 · SHUTTERS -->
        <article class="wizard-step" data-step="2" id="step-2" hidden>
            <div class="split-head">
                <p class="muted mb-0">Add every opening on the job. Area, weight, and shutter price calculate as you type.</p>
                <button type="button" class="btn btn-navy" id="btnAddOpening">
                    <i class="bi bi-plus-lg"></i> Add opening
                </button>
            </div>
            <div class="invalid-hint mb-3" data-for="openings"></div>
            <div id="openingsList" class="stack"></div>
            <div class="subtotal-bar">
                <span>Shutter openings subtotal</span>
                <strong id="shutterSubtotal">$0.00</strong>
            </div>
        </article>

        <!-- STEP 3 · MOTORS -->
        <article class="wizard-step" data-step="3" id="step-3" hidden>
            <p class="muted">Each opening lists the calculated curtain weight and the motor power it needs. Only motors that can lift that weight are offered.</p>
            <div class="invalid-hint mb-3" data-for="motors"></div>
            <div id="motorsList" class="stack"></div>
        </article>

        <!-- STEP 4 · CONTROLLERS -->
        <article class="wizard-step" data-step="4" id="step-4" hidden>
            <p class="muted">Controllers are optional. Openings without a motor cannot take a controller.</p>
            <div id="controllersList" class="stack"></div>
        </article>

        <!-- STEP 5 · SUMMARY -->
        <article class="wizard-step" data-step="5" id="step-5" hidden>
            <div class="row g-4">
                <div class="col-xl-8">
                    <div class="panel" id="summaryPanel"></div>

                    <div class="panel mt-4">
                        <h3 class="panel-title">Notes for the quotation</h3>
                        <textarea class="form-control" id="quoteNotes" rows="3" placeholder="Lead time, site access, colour, installation window…"></textarea>
                    </div>

                    <div class="gemini-card" id="geminiCard">
                        <div class="gemini-head">
                            <div>
                                <p class="eyebrow gold">Gemini</p>
                                <h3>Generate with Gemini AI</h3>
                                <p class="muted mb-0">Draft a client-ready letter plus technical suggestions, then open the quotation as a PDF.</p>
                            </div>
                            <button type="button" class="btn btn-gold btn-lg" id="btnGemini">
                                <i class="bi bi-stars"></i> Generate with Gemini AI
                            </button>
                        </div>
                        <div class="gemini-status" id="geminiStatus" hidden>
                            <div class="gemini-pulse"></div>
                            <div>
                                <strong>Gemini is composing the quotation…</strong>
                                <div class="muted">Sending openings, motors, controllers, and site data.</div>
                            </div>
                        </div>
                        <div class="gemini-output" id="geminiOutput" hidden></div>
                    </div>
                </div>
                <div class="col-xl-4">
                    <aside class="totals-card" id="totalsCard"></aside>
                </div>
            </div>
        </article>

        <footer class="wizard-nav">
            <button type="button" class="btn btn-ghost" id="btnBack" hidden>
                <i class="bi bi-arrow-left"></i> Back
            </button>
            <div class="flex-grow-1"></div>
            <button type="button" class="btn btn-gold btn-lg" id="btnNext">
                Continue <i class="bi bi-arrow-right"></i>
            </button>
        </footer>
    </section>
</asp:Content>
