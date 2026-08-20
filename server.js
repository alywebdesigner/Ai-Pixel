/**
 * Lightweight host for the static ASP.NET Web Forms demo.
 * Combines Site.Master + Default.aspx the same way a master page would,
 * then serves the result as a single-page application.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".aspx": "text/html; charset=utf-8",
  ".master": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".config": "text/xml; charset=utf-8",
};

function extractContents(aspx) {
  const contents = {};
  const re = /<asp:Content\b([^>]*)>([\s\S]*?)<\/asp:Content>/gi;
  let match;
  while ((match = re.exec(aspx))) {
    const idMatch = /ContentPlaceHolderID\s*=\s*"([^"]+)"/i.exec(match[1]);
    if (idMatch) contents[idMatch[1]] = match[2];
  }
  return contents;
}

function renderMasterPage(pageFile) {
  const master = fs.readFileSync(path.join(ROOT, "Site.Master"), "utf8");
  const page = fs.readFileSync(path.join(ROOT, pageFile), "utf8");
  const contents = extractContents(page);

  const titleMatch = /Title\s*=\s*"([^"]+)"/i.exec(page);
  const pageTitle = titleMatch ? titleMatch[1] : "AI Pixel";

  let html = master.replace(/<%@[\s\S]*?%>/g, "");
  html = html.replace(/<%=\s*Page\.Title\s*%>/g, pageTitle);
  html = html.replace(/<%:\s*Page\.Title\s*%>/g, pageTitle);

  html = html.replace(
    /<asp:ContentPlaceHolder\b([^>]*)>([\s\S]*?)<\/asp:ContentPlaceHolder>/gi,
    (full, attrs) => {
      const idMatch = /\bID\s*=\s*"([^"]+)"/i.exec(attrs);
      if (!idMatch) return "";
      return contents[idMatch[1]] != null ? contents[idMatch[1]] : "";
    }
  );

  html = html.replace(/\srunat="server"/gi, "");
  html = html.replace(/<form[^>]*\sid="aspnetForm"[^>]*>/i, '<form id="aspnetForm">');
  return html;
}

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const isAppPage =
    pathname === "/" ||
    pathname === "/Default.aspx" ||
    pathname === "/default.aspx" ||
    pathname === "/index.html" ||
    pathname === "/Default" ||
    pathname === "/CreateQuotation";

  if (isAppPage) {
    try {
      const html = renderMasterPage("Default.aspx");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Failed to render master page: " + err.message);
    }
    return;
  }

  const filePath = safeJoin(pathname);
  if (!filePath) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`AI Pixel quotation studio running on http://${HOST}:${PORT}`);
});
