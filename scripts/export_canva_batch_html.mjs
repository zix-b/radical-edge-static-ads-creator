import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const outFile = resolve("tmp/radical-edge-proof-ads-canva.html");
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];
const hiddenPublicNames = [
  ...proofDatabase.clients.filter((client) => client.name !== "Custom proof").map((client) => client.name),
  "Kev",
  "Kevin",
];

const testimonialSources = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    client: client.name,
    proof: client.proofSummary,
    sourceType: "Transcript",
  }));

const conversionSources = proofDatabase.conversionFiles.map((file) => ({
  client: file.title,
  proof: file.summary ?? `${file.title} (${file.type})`,
  extractedText: file.extractedText,
  proofMeaning: file.proofMeaning,
  adHeader: file.adHeader,
  fileId: file.fileId,
  fileType: file.type,
  sourceType: "Conversion",
}));

const proofSources = [...testimonialSources, ...conversionSources].filter(hasUsablePublicProof);

function hasUsablePublicProof(source) {
  if (source.sourceType === "Conversion" && source.fileId && /proof screenshot/i.test(source.fileType ?? "")) return true;
  return !/Read image\/OCR|Conversion screenshot from Drive|Analytics proof from Drive|Transcript pending|Paste the exact/i.test(source.proof);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function anonymiseProofText(text) {
  return hiddenPublicNames.reduce((current, name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return current.replace(new RegExp(`\\b${escaped}\\b`, "gi"), name === "Kev" || name === "Kevin" ? "the team" : "the client");
  }, text);
}

function publicProofCopy(text, maxLength = 120) {
  const cleaned = anonymiseProofText(text)
    .replace(/\s*Verify\b.*$/i, "")
    .replace(/\s*Read image\/OCR\b.*$/i, "")
    .replace(/\s*before publishing\.?$/i, "")
    .replace(/^Client says\b/i, "A client said")
    .replace(/^Conversion screenshot from Drive\.?/i, "")
    .replace(/^Analytics proof from Drive\.?/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const usable = cleaned || "Approved proof goes here after the source is verified.";
  if (usable.length <= maxLength) return usable;

  const sliced = usable.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 60 ? lastSpace : maxLength - 1).trimEnd()}...`;
}

function proofSnippet(proof) {
  return publicProofCopy(proof, 118)
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^Proof:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .slice(0, 118);
}

function conversionHeadlineLabel(source) {
  return (source.adHeader || source.proofMeaning || source.client).toUpperCase();
}

function buildHeadline(source) {
  const proof = proofSnippet(source.proof);

  if (source.sourceType === "Conversion") {
    return {
      highlight: conversionHeadlineLabel(source),
      lineOne: "",
      lineTwo: "",
    };
  }

  if (/\$30k|\$10k|closed/i.test(proof)) {
    return {
      highlight: "$30K+ FROM ORGANIC LEADS",
      lineOne: "including a fast $10K sales window",
      lineTwo: "from demand built before the call",
    };
  }

  if (/1M views|1,000 followers|9 videos|5 hours/i.test(proof)) {
    return {
      highlight: "1M VIEWS FROM 9 VIDEOS",
      lineOne: "and 1,000 followers from focused content",
      lineTwo: "not endless posting",
    };
  }

  if (/Chosen over more established competitors/i.test(proof)) {
    return {
      highlight: "CHOSEN OVER BIGGER COMPETITORS",
      lineOne: "before the sales call started",
      lineTwo: "because trust was built upfront",
    };
  }

  if (/\$50k|bootcamp/i.test(proof)) {
    return {
      highlight: "$50K+ BOOTCAMP REVENUE",
      lineOne: "from stronger authority positioning",
      lineTwo: "not louder promotion",
    };
  }

  if (/attractive character|content topics|video editing|attention|leads/i.test(proof)) {
    return {
      highlight: "CLEARER CHARACTER",
      lineOne: "clearer content, stronger attention",
      lineTwo: "so the right leads know why you matter",
    };
  }

  if (/1M\+ monthly views|parent\/student trust/i.test(proof)) {
    return {
      highlight: "1M+ MONTHLY VIEWS",
      lineOne: "with stronger trust before enquiry",
      lineTwo: "from authority content",
    };
  }

  if (/combined TikTok\/Instagram|2,500 followers|enquiries/i.test(proof)) {
    return {
      highlight: "NEARLY 1M COMBINED VIEWS",
      lineOne: "plus stronger recognition and enquiries",
      lineTwo: "from consistent authority",
    };
  }

  return {
    highlight: "PROOF FROM AUTHORITY CONTENT",
    lineOne: "when the market understands why you matter",
    lineTwo: "not cold chasing",
  };
}

function bottomClaim(proof) {
  if (/\$|closed|revenue/i.test(proof)) return "Turn proof into demand";
  if (/views|followers/i.test(proof)) return "Make attention convert";
  return "Get prospects that come to you";
}

function driveThumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w900`;
}

function proofBlock(source, id) {
  if (source.sourceType === "Conversion" && /proof screenshot/i.test(source.fileType ?? "")) {
    const image = source.fileId ? `<img src="${escapeHtml(driveThumbnailUrl(source.fileId))}" alt="${escapeHtml(`${id} conversion proof screenshot`)}">` : "";
    return `<div class="proof conversion-shot">${image}</div>`;
  }

  return `<div class="proof transcript-signal"><strong>${escapeHtml(source.client)}</strong></div>`;
}

function headlineSizeClass(headline) {
  const length = `${headline.highlight} ${headline.lineOne} ${headline.lineTwo}`.length;
  if (length > 105) return "headline compact";
  if (length > 82) return "headline tight";
  return "headline";
}

const styles = `*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Arial,Helvetica,sans-serif}.wrap{display:grid;gap:30px;padding:30px;justify-content:center}.card{width:1080px;height:1350px;position:relative;overflow:hidden;background:#111;color:white;page-break-after:always;break-after:page}.top{position:absolute;left:86px;right:86px;top:74px;display:flex;justify-content:space-between;color:#d8d4ca;font-size:22px;text-transform:uppercase;letter-spacing:.16em;font-weight:1000}.top b{color:#e7ff43;text-align:right}.headline{position:absolute;left:118px;right:118px;top:185px;height:395px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;text-transform:uppercase;font-weight:1000;overflow:hidden}.headline span,.headline b,.headline em{display:block;font-style:normal;letter-spacing:0;line-height:.92}.headline span{color:#b8ff62;font-size:72px}.headline b{color:#fff;font-size:62px}.headline em{color:#b8ff62;font-size:58px}.headline.tight span{font-size:64px}.headline.tight b{font-size:54px}.headline.tight em{font-size:50px}.headline.compact span{font-size:56px}.headline.compact b{font-size:47px}.headline.compact em{font-size:43px}.proof{position:absolute;left:206px;right:206px;top:620px;height:245px;border:5px solid rgba(255,255,255,.92);border-radius:26px;background:#202020;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:28px 34px;box-shadow:0 34px 68px rgba(0,0,0,.38);overflow:hidden}.proof img{position:absolute;left:18px;right:18px;top:18px;bottom:18px;width:calc(100% - 36px);height:calc(100% - 36px);object-fit:contain;border-radius:18px;background:#080808}.proof strong{display:block;color:#b8ff62;font-size:33px;line-height:1.05;font-weight:1000;text-align:center;text-transform:uppercase}.bottom{position:absolute;left:86px;right:86px;top:925px;height:210px;padding-left:8px}.bottom p{font-size:54px;line-height:.98;font-weight:1000;margin:0 0 24px;max-width:720px}.bottom p span{display:block;color:#b8ff62}.bottom i{display:block;width:230px;height:5px;background:white;margin:0 0 24px}.bottom strong{display:block;font-size:28px;line-height:1.08;font-weight:1000;max-width:660px}footer{position:absolute;left:86px;right:86px;bottom:68px;display:flex;align-items:end;justify-content:space-between;gap:28px}footer b{font-size:30px;font-weight:1000}footer span{background:#e7ff43;color:#111;padding:24px 34px;font-size:26px;font-weight:1000}`;

const cards = Array.from({ length: 20 }, (_, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const source = proofSources[index % proofSources.length];
  const proof = publicProofCopy(source?.proof ?? "");
  const headline = buildHeadline(source);
  const claim = bottomClaim(proof);
  const layout = proofLayouts[index % proofLayouts.length];

  return `<article class="card" data-document-role="page" data-label="${id}"><div class="top"><span>${id}</span><b>${escapeHtml(layout)}</b></div><div class="${headlineSizeClass(headline)}"><span>${escapeHtml(headline.highlight)}</span><b>${escapeHtml(headline.lineOne)}</b><em>${escapeHtml(headline.lineTwo)}</em></div>${proofBlock(source, id)}<div class="bottom"><p>${escapeHtml(claim)} <span>already convinced</span></p><i></i><strong>Build a personal brand that attracts high-ticket clients without outsourcing your voice.</strong></div><footer><b>RADICAL EDGE</b><span>Join the masterclass &gt;</span></footer></article>`;
});

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `<!doctype html><html><head><meta charset="utf-8"><title>Radical Edge Proof Ads</title><style>${styles}</style></head><body><main class="wrap">${cards.join("\n")}</main></body></html>`);

console.log(outFile);
