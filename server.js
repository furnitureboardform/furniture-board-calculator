// ╔════════════════════════════════════════════════════════════════════════╗
// ║                  INTERACTIVE PARAMETERS SERVER                          ║
// ║         Run: node server.js  →  open http://localhost:3000              ║
// ╚════════════════════════════════════════════════════════════════════════╝

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TEMPLATE_FILE = path.join(__dirname, "template.html");
const PORT = 3000;

function readParameters() {
  const content = fs.readFileSync(PARAMETERS_FILE, "utf8");
  const extract = (name) => {
    const match = content.match(new RegExp(`const ${name}\\s*=\\s*([^;]+);`));
    if (!match) return null;
    const val = match[1].trim();
    if (val === "true") return true;
    if (val === "false") return false;
    return isNaN(Number(val)) ? val : Number(val);
  };
  const extractArray = (name) => {
    const match = content.match(
      new RegExp(`const ${name}\\s*=\\s*\\[([^\\]]*)\\]`),
    );
    if (!match) return [];
    return match[1]
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v));
  };

  return {
    numberOfDrawers: extract("numberOfDrawers"),
    numberOfBoxes: extract("numberOfBoxes"),
    boxWidths: extractArray("boxWidths"),
    boxShelves: extractArray("boxShelves"),
    boxRods: extractArray("boxRods"),
    boxDrawers: extractArray("boxDrawers"),
    boxWidthMm: extract("boxWidthMm"),
    cabinetDepthMm: extract("cabinetDepthMm"),
    nicheWidthMm: extract("nicheWidthMm"),
    nicheHeightMm: extract("nicheHeightMm"),
    hasNiches: extract("hasNiches"),
    leftBlendMm: extract("leftBlendMm"),
    rightBlendMm: extract("rightBlendMm"),
    topBlendMm: extract("topBlendMm"),
    bottomBlendMm: extract("bottomBlendMm"),
    leftNicheHeightMm: extract("leftNicheHeightMm"),
    rightNicheHeightMm: extract("rightNicheHeightMm"),
    topNicheWidthMm: extract("topNicheWidthMm"),
    bottomNicheWidthMm: extract("bottomNicheWidthMm"),
    numberOfLeftDoors: extract("numberOfLeftDoors"),
    numberOfRightDoors: extract("numberOfRightDoors"),
    isLeftSideFullyCovered: extract("isLeftSideFullyCovered"),
    isRightSideFullyCovered: extract("isRightSideFullyCovered"),
  };
}

function updateParameter(name, value) {
  let content = fs.readFileSync(PARAMETERS_FILE, "utf8");
  content = content.replace(
    new RegExp(`(const ${name}\\s*=\\s*)[^;]+(;)`),
    `$1${value}$2`,
  );
  fs.writeFileSync(PARAMETERS_FILE, content, "utf8");
}

function updateArrayParameter(name, values) {
  let content = fs.readFileSync(PARAMETERS_FILE, "utf8");
  const arrayStr = `[${values.join(", ")}]`;
  content = content.replace(
    new RegExp(`(const ${name}\\s*=\\s*)\\[[^\\]]*\\](.*)`),
    `$1${arrayStr}$2`,
  );
  fs.writeFileSync(PARAMETERS_FILE, content, "utf8");
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const result = {};
      for (const [key, val] of params.entries()) {
        result[key] = val;
      }
      resolve(result);
    });
  });
}

function generateReport() {
  try {
    const output = execSync("node index.js", {
      cwd: __dirname,
      encoding: "utf8",
    });
    return output;
  } catch (e) {
    return `Błąd podczas generowania raportu:\n${e.message}`;
  }
}

const PARAMETERS_FILE = path.join(__dirname, "parameters.js");

function renderHtml(params, report = null) {
  const savedWidths = JSON.stringify(
    params.boxWidths && params.boxWidths.length ? params.boxWidths : [964],
  );
  const savedShelves = JSON.stringify(
    params.boxShelves && params.boxShelves.length ? params.boxShelves : [2],
  );
  const savedRods = JSON.stringify(
    params.boxRods && params.boxRods.length ? params.boxRods : [0],
  );
  const savedDrawers = JSON.stringify(
    params.boxDrawers && params.boxDrawers.length ? params.boxDrawers : [2],
  );

  const reportSection = report
    ? `<div class="report"><h2>Lista zakupów</h2><pre>${report.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></div>\n    <button class="btn btn-outline" onclick="showForm()">← Wróć do konfiguracji</button>`
    : "";

  return fs
    .readFileSync(TEMPLATE_FILE, "utf8")
    .replace("{{SAVED_WIDTHS}}", savedWidths)
    .replace("{{REPORT_SECTION}}", reportSection)
    .replace("{{FORM_HIDDEN}}", report ? ' style="display:none"' : "")
    .replace("{{NICHE_WIDTH}}", String(params.nicheWidthMm || 3070))
    .replace("{{NICHE_HEIGHT}}", String(params.nicheHeightMm || 2700))
    .replace("{{HAS_NICHES_CHECKED}}", params.hasNiches ? "checked" : "")
    .replace("{{LEFT_BLEND}}", String(params.leftBlendMm || 0))
    .replace("{{RIGHT_BLEND}}", String(params.rightBlendMm || 0))
    .replace("{{TOP_BLEND}}", String(params.topBlendMm || 0))
    .replace("{{BOTTOM_BLEND}}", String(params.bottomBlendMm || 0))
    .replace("{{LEFT_NICHE_HEIGHT}}", String(params.leftNicheHeightMm || 0))
    .replace("{{RIGHT_NICHE_HEIGHT}}", String(params.rightNicheHeightMm || 0))
    .replace("{{TOP_NICHE_WIDTH}}", String(params.topNicheWidthMm || 0))
    .replace("{{BOTTOM_NICHE_WIDTH}}", String(params.bottomNicheWidthMm || 0))
    .replace("{{CABINET_DEPTH}}", String(params.cabinetDepthMm || 600))
    .replace("{{NUMBER_OF_BOXES}}", String(params.numberOfBoxes || 1))
    .replace("{{SAVED_SHELVES}}", savedShelves)
    .replace("{{SAVED_RODS}}", savedRods)
    .replace("{{SAVED_DRAWERS}}", savedDrawers);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const params = readParameters();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHtml(params));
    return;
  }

  if (req.method === "POST" && req.url === "/") {
    const body = await parseBody(req);

    const boxWidths = [],
      boxShelves = [],
      boxRods = [],
      boxDrawers = [],
      boxDoorTypes = [];
    let i = 0;
    while (body[`boxWidth_${i}`] !== undefined) {
      boxWidths.push(parseInt(body[`boxWidth_${i}`], 10));
      boxShelves.push(parseInt(body[`boxShelves_${i}`] || 0, 10));
      boxRods.push(parseInt(body[`boxRods_${i}`] || 0, 10));
      boxDrawers.push(parseInt(body[`boxDrawers_${i}`] || 0, 10));
      boxDoorTypes.push(
        body[`boxDoorType_${i}`] === "right" ? "right" : "left",
      );
      i++;
    }

    const sidePanelThicknessMm = 18;
    const nicheWidthMm = parseInt(body.nicheWidthMm, 10);
    const hasNiches = body.hasNiches === "true";
    const leftBlendMm = hasNiches ? parseInt(body.leftBlendMm || 0, 10) : 0;
    const rightBlendMm = hasNiches ? parseInt(body.rightBlendMm || 0, 10) : 0;
    const effectiveWardrobeWidthMm = nicheWidthMm - leftBlendMm - rightBlendMm;
    const deductionPerBoxMm = 2 * sidePanelThicknessMm;
    const outerMaskingSideMm = 18;
    const outerMaskingDeductionMm = 2 * outerMaskingSideMm;
    const availableInteriorWidth =
      effectiveWardrobeWidthMm -
      boxWidths.length * deductionPerBoxMm -
      outerMaskingDeductionMm;
    const totalInteriorWidth = boxWidths.reduce((sum, width) => sum + width, 0);

    if (
      boxWidths.length > 0 &&
      (!Number.isFinite(nicheWidthMm) ||
        totalInteriorWidth !== availableInteriorWidth)
    ) {
      const diff = availableInteriorWidth - totalInteriorWidth;
      const message = Number.isFinite(nicheWidthMm)
        ? diff > 0
          ? `Walidacja nie przeszła: zostało ${diff} mm do rozdzielenia.`
          : `Walidacja nie przeszła: przekroczono miejsce o ${Math.abs(diff)} mm.`
        : "Walidacja nie przeszła: nieprawidłowa szerokość wnęki.";

      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(message);
      return;
    }

    const numericFields = [
      "numberOfDrawers",
      "numberOfBoxes",
      "boxWidthMm",
      "cabinetDepthMm",
      "nicheWidthMm",
      "nicheHeightMm",
      "hasNiches",
      "leftBlendMm",
      "rightBlendMm",
      "topBlendMm",
      "bottomBlendMm",
      "leftNicheHeightMm",
      "rightNicheHeightMm",
      "topNicheWidthMm",
      "bottomNicheWidthMm",
      "numberOfLeftDoors",
      "numberOfRightDoors",
    ];
    const boolFields = ["isLeftSideFullyCovered", "isRightSideFullyCovered"];

    for (const field of numericFields) {
      if (body[field] !== undefined) {
        if (
          !hasNiches &&
          [
            "leftBlendMm",
            "rightBlendMm",
            "topBlendMm",
            "bottomBlendMm",
            "leftNicheHeightMm",
            "rightNicheHeightMm",
            "topNicheWidthMm",
            "bottomNicheWidthMm",
          ].includes(field)
        ) {
          updateParameter(field, 0);
        } else {
          updateParameter(field, parseInt(body[field], 10));
        }
      }
    }
    updateParameter("hasNiches", hasNiches ? "true" : "false");
    for (const field of boolFields) {
      updateParameter(field, body[field] === "true" ? "true" : "false");
    }

    if (boxWidths.length > 0) {
      updateArrayParameter("boxWidths", boxWidths);
      updateArrayParameter("boxShelves", boxShelves);
      updateArrayParameter("boxRods", boxRods);
      updateArrayParameter("boxDrawers", boxDrawers);
      updateParameter("numberOfBoxes", boxWidths.length);

      const leftDoors = boxDoorTypes.filter(
        (doorType) => doorType === "left",
      ).length;
      const rightDoors = boxDoorTypes.filter(
        (doorType) => doorType === "right",
      ).length;
      updateParameter("numberOfLeftDoors", leftDoors);
      updateParameter("numberOfRightDoors", rightDoors);
    }

    const collectedData = {
      nicheWidthMm:
        body.nicheWidthMm !== undefined
          ? parseInt(body.nicheWidthMm, 10)
          : null,
      nicheHeightMm:
        body.nicheHeightMm !== undefined
          ? parseInt(body.nicheHeightMm, 10)
          : null,
      hasNiches,
      leftBlendMm: hasNiches ? parseInt(body.leftBlendMm || 0, 10) : 0,
      rightBlendMm: hasNiches ? parseInt(body.rightBlendMm || 0, 10) : 0,
      topBlendMm: hasNiches ? parseInt(body.topBlendMm || 0, 10) : 0,
      bottomBlendMm: hasNiches ? parseInt(body.bottomBlendMm || 0, 10) : 0,
      leftNicheHeightMm: hasNiches
        ? parseInt(body.leftNicheHeightMm || 0, 10)
        : 0,
      rightNicheHeightMm: hasNiches
        ? parseInt(body.rightNicheHeightMm || 0, 10)
        : 0,
      topNicheWidthMm: hasNiches ? parseInt(body.topNicheWidthMm || 0, 10) : 0,
      bottomNicheWidthMm: hasNiches
        ? parseInt(body.bottomNicheWidthMm || 0, 10)
        : 0,
      cabinetDepthMm:
        body.cabinetDepthMm !== undefined
          ? parseInt(body.cabinetDepthMm, 10)
          : null,
      numberOfLeftDoors: boxDoorTypes.filter((doorType) => doorType === "left")
        .length,
      numberOfRightDoors: boxDoorTypes.filter(
        (doorType) => doorType === "right",
      ).length,
      numberOfBoxes:
        body.numberOfBoxes !== undefined
          ? parseInt(body.numberOfBoxes, 10)
          : boxWidths.length,
      boxes: boxWidths.map((width, index) => ({
        boxNumber: index + 1,
        boxInteriorWidthMm: width,
        doorType: boxDoorTypes[index] || "left",
        drawers: boxDrawers[index] || 0,
        shelves: boxShelves[index] || 0,
        rods: boxRods[index] || 0,
      })),
    };

    const params = readParameters();
    const report = generateReport();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHtml(params, report));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n  Serwer uruchomiony: http://localhost:${PORT}\n`);
});
