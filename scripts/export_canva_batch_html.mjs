import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const outFile = resolve("tmp/radical-edge-proof-ads-canva.html");
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];
const backgroundUrl = "https://zix-b.github.io/radical-edge-static-ads-creator/radical-edge-ad-background.png";
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

  const usable = cleaned || "Use the verified proof source here.";
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

function buildProofHeadline(source) {
  const proofText = proofSnippet(source.proof);

  if (source.sourceType === "Conversion") {
    return {
      highlight: conversionHeadlineLabel(source),
      lineOne: "",
      lineTwo: "",
    };
  }

  if (/\$30k|\$10k|closed/i.test(proofText)) {
    return {
      highlight: "$30K+ FROM ORGANIC LEADS",
      lineOne: "$10K came in fast",
      lineTwo: "after the trust was built",
    };
  }

  if (/1M views|1,000 followers|9 videos|5 hours/i.test(proofText)) {
    return {
      highlight: "1M VIEWS FROM 9 VIDEOS",
      lineOne: "1,000 followers followed",
      lineTwo: "from a focused shoot",
    };
  }

  if (/Chosen over more established competitors/i.test(proofText)) {
    return {
      highlight: "CHOSEN OVER BIGGER COMPETITORS",
      lineOne: "because the content did the trust work",
      lineTwo: "",
    };
  }

  if (/\$50k|bootcamp/i.test(proofText)) {
    return {
      highlight: "$50K+ BOOTCAMP REVENUE",
      lineOne: "from clearer authority",
      lineTwo: "not louder posting",
    };
  }

  if (/attractive character|content topics|video editing|attention|leads/i.test(proofText)) {
    return {
      highlight: "CLEARER CHARACTER",
      lineOne: "clearer topics",
      lineTwo: "better lead quality",
    };
  }

  if (/1M\+ monthly views|parent\/student trust/i.test(proofText)) {
    return {
      highlight: "1M+ MONTHLY VIEWS",
      lineOne: "with more trust before enquiry",
      lineTwo: "",
    };
  }

  if (/combined TikTok\/Instagram|2,500 followers|enquiries/i.test(proofText)) {
    return {
      highlight: "NEARLY 1M COMBINED VIEWS",
      lineOne: "and more enquiries",
      lineTwo: "from clearer positioning",
    };
  }

  return {
    highlight: "CONTENT THAT CREATES CONTEXT",
    lineOne: "before the sales call",
    lineTwo: "",
  };
}

function bottomClaim(middleText) {
  if (/\$|closed|revenue/i.test(middleText)) return "Revenue is easier when trust exists first.";
  if (/views|followers/i.test(middleText)) return "Views only matter when they move buyers.";
  if (/viewing|referral|enquiry|lead|call/i.test(middleText)) return "The sales conversation started before the call.";
  return "Good content gives buyers a reason to come closer.";
}

function proofBlock(source) {
  if (source.sourceType === "Conversion" && /screenshot/i.test(source.fileType ?? "")) {
    return `<div class="proof-slot conversion-shot"><span class="proof-line">${escapeHtml(source.client)}</span></div>`;
  }

  return `<div class="proof-slot transcript-signal"><span class="proof-line">${escapeHtml(source.client)}</span></div>`;
}

const styles = `*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Arial,Helvetica,sans-serif}.wrap{display:grid;gap:30px;padding:30px;justify-content:center}.design-card{width:1080px;height:1350px;border:0;background:#171513;padding:0;display:grid;page-break-after:always;break-after:page;overflow:hidden}.mock-static-ad{width:100%;height:100%;background:#151515;color:white;padding:85px 58px 58px;display:grid;grid-template-rows:minmax(355px,auto) minmax(430px,1fr) auto;border:1px solid #34312d;position:relative;overflow:hidden;isolation:isolate}.sample-noise-img{position:absolute;inset:0;z-index:-3;width:100%;height:100%;object-fit:cover}.sample-noise{position:absolute;inset:0;z-index:-2;background:rgba(0,0,0,.04)}.mock-static-ad h3{position:relative;z-index:2;max-width:100%;font-size:88px;line-height:.98;margin:0 0 31px;letter-spacing:0;font-weight:1000;text-transform:uppercase;text-align:center;text-wrap:balance;overflow-wrap:break-word}.mock-static-ad h3 span{display:block;color:#b8ff62;font-size:1.12em}.mock-static-ad h3 em{display:block;color:#b8ff62;font-style:normal}.proof-slot{position:relative;z-index:3;align-self:center;width:82%;min-height:401px;margin:31px auto 46px;border:8px solid rgba(255,255,255,.9);border-radius:39px;background:rgba(8,8,8,.74);display:grid;align-content:center;gap:23px;padding:46px 50px;box-shadow:0 62px 108px rgba(0,0,0,.38)}.proof-slot.conversion-shot .proof-line{position:relative;background:rgba(0,0,0,.72);color:#b8ff62;text-align:center;font-size:46px;white-space:normal;text-transform:uppercase;letter-spacing:.08em}.proof-slot.transcript-signal{border-style:dashed;background:rgba(18,18,18,.84);align-content:center}.proof-line{display:block;width:100%;border-radius:19px;background:rgba(255,255,255,.11);color:#f6f6f6;padding:19px 23px;font-size:31px;line-height:1.16;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.proof-slot.transcript-signal .proof-line{color:#b8ff62;text-align:center;font-size:46px;white-space:normal;text-transform:uppercase;letter-spacing:.08em}.sample-bottom{position:relative;z-index:3;align-self:end;max-width:82%;padding:0 0 15px 31px}.sample-bottom p{font-size:88px;line-height:.98;font-weight:1000;margin:0 0 35px;text-transform:none}.sample-bottom p span{display:block;color:#b8ff62}.sample-bottom i{display:block;width:38%;height:8px;background:white;margin:0 0 35px}.sample-bottom strong{display:block;font-size:46px;line-height:1.04;font-weight:1000;max-width:72%}.design-2 .proof-slot{margin-left:0;width:72%}.design-3 .mock-static-ad h3{text-align:left;max-width:78%}.design-4 .sample-bottom{max-width:82%}.design-5 .proof-slot{border-color:#b8ff62}`;

const cards = Array.from({ length: 20 }, (_, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const source = proofSources[index % proofSources.length];
  const middleText = source.sourceType === "Conversion"
    ? source.publicClaim || source.proofMeaning || source.proof || source.client
    : "Private transcript shaped the claim";
  const headline = buildProofHeadline(source);
  const claim = bottomClaim(middleText);

  return `<article class="design-card design-${(index % 5) + 1}" data-document-role="page" data-label="${id}"><div class="mock-static-ad"><img class="sample-noise-img" src="${backgroundUrl}" alt=""><div class="sample-noise"></div><h3><span>${escapeHtml(headline.highlight)}</span>${escapeHtml(headline.lineOne)}<em>${escapeHtml(headline.lineTwo)}</em></h3>${proofBlock(source)}<div class="sample-bottom"><p>${escapeHtml(claim)}</p><i></i><strong>Learn how this happened inside the one-day masterclass</strong></div></div></article>`;
});

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `<!doctype html><html><head><meta charset="utf-8"><title>Radical Edge Proof Ads</title><style>${styles}</style></head><body><main class="wrap">${cards.join("\n")}</main></body></html>`);

console.log(outFile);
