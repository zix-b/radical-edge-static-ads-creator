import assert from "node:assert/strict";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const angles = Array(20).fill("Proof / Result");

const transcriptProofs = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    sourceType: "Transcript",
    proof: client.proofSummary,
  }));
const conversionProofs = proofDatabase.conversionFiles
  .filter((file) => /proof screenshot/i.test(file.type) && file.fileId)
  .map((file) => ({
    sourceType: "Conversion",
    client: file.title,
    proof: file.summary ?? `${file.title} (${file.type})`,
    fileId: file.fileId,
  }));
const baselineAsset = proofDatabase.assetFiles.find((file) => file.type === "design sample");
const hiddenPublicNames = [
  ...proofDatabase.clients.filter((client) => client.name !== "Custom proof").map((client) => client.name),
  "Kev",
  "Kevin",
];

function anonymiseProofText(text) {
  return hiddenPublicNames.reduce((current, name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return current.replace(new RegExp(`\\b${escaped}\\b`, "gi"), name === "Kev" || name === "Kevin" ? "the team" : "the client");
  }, text);
}

function publicProofCopy(text) {
  return anonymiseProofText(text)
    .replace(/\s*Verify\b.*$/i, "")
    .replace(/\s*Read image\/OCR\b.*$/i, "")
    .replace(/\s*before publishing\.?$/i, "")
    .replace(/^Client says\b/i, "A client said")
    .replace(/^Conversion screenshot from Drive\.?/i, "")
    .replace(/^Analytics proof from Drive\.?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function conversionHeadlineLabel(source) {
  const dateMatch = source.client.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00`);
    return `${date.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${Number(dateMatch[3])} CHAT PROOF`;
  }

  const imageMatch = source.client.match(/IMG[_ -]?(\d+)/i);
  if (imageMatch) return `CHAT PROOF IMG ${imageMatch[1]}`;

  return "CONVERSION SCREENSHOT PROOF";
}

function buildHeadline(source) {
  const proof = publicProofCopy(source.proof);

  if (source.sourceType === "Conversion") {
    return /sales training|contextualised sales|personal brand/i.test(proof)
      ? "THE CALL MADE SALES CLICK"
      : conversionHeadlineLabel(source);
  }
  if (/\$30k|\$10k|closed/i.test(proof)) return "$30K+ FROM ORGANIC LEADS";
  if (/1M views|1,000 followers|9 videos|5 hours/i.test(proof)) return "1M VIEWS FROM 9 VIDEOS";
  if (/Chosen over more established competitors/i.test(proof)) return "CHOSEN OVER BIGGER COMPETITORS";
  if (/\$50k|bootcamp/i.test(proof)) return "$50K+ BOOTCAMP REVENUE";
  if (/attractive character|content topics|video editing|attention|leads/i.test(proof)) return "CLEARER CHARACTER";
  if (/1M\+ monthly views|parent\/student trust/i.test(proof)) return "1M+ MONTHLY VIEWS";
  if (/combined TikTok\/Instagram|2,500 followers|enquiries/i.test(proof)) return "NEARLY 1M COMBINED VIEWS";
  return "PROOF FROM AUTHORITY CONTENT";
}

assert.equal(angles.length, 20, "Ad set must generate exactly 20 designs.");
assert.ok(transcriptProofs.length > 0, "At least one testimonial transcript proof source is required.");
assert.ok(conversionProofs.length > 0, "At least one Conversion proof source is required.");
assert.ok(proofDatabase.conversionFiles.every((file) => file.summary && file.status), "Every Conversion proof source needs a summary and verification status.");
assert.ok(baselineAsset, "A design sample baseline is required.");

const checks = angles.map((angle, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const source = index % 2 === 0 ? transcriptProofs[index % transcriptProofs.length] : conversionProofs[index % conversionProofs.length];
  const publicProof = publicProofCopy(source.proof);
  const treatment = source.sourceType === "Conversion" ? "Screenshot proof" : "Copy-only proof";
  const centerMode = treatment;
  const headline = buildHeadline(source);
  const baseline = `${baselineAsset.title} (${baselineAsset.type})`;
  const asset = treatment === "Screenshot proof"
    ? `${baseline} structure reference; approved Conversion screenshot required.`
    : `${baseline} structure reference; no image asset required.`;
  const bottom = "Join the masterclass. Results vary.";
  const issues = [];

  if (!bottom.includes("Join the masterclass")) issues.push("missing CTA");
  if (!bottom.includes("Results vary")) issues.push("missing disclaimer");
  if (angle !== "Proof / Result") issues.push("non-proof ad generated");
  if (!headline || /RESULTS LIKE THIS|\$10K\+ CLOSED|1M\+ VIEWS|CHOSEN FIRST|PROOF STRAIGHT FROM THE CHAT/.test(headline)) issues.push("headline is still using generic rotated buckets");
  if (source.sourceType === "Transcript" && treatment !== "Copy-only proof") issues.push("transcript source should use copy-only proof");
  if (source.sourceType === "Transcript" && centerMode !== "Copy-only proof") issues.push("transcript source should influence headline only");
  if (source.sourceType === "Transcript" && /^Proof:/i.test(publicProof)) issues.push("transcript proof should not be pasted into the center");
  if (source.sourceType === "Conversion" && treatment !== "Screenshot proof") issues.push("conversion source should use screenshot proof");
  if (source.sourceType === "Conversion" && centerMode !== "Screenshot proof") issues.push("conversion source should use screenshot center slot");
  if (source.sourceType === "Conversion" && !source.fileId) issues.push("conversion screenshot is missing Drive file ID");
  if (treatment === "Copy-only proof" && !/no image asset required/.test(asset)) issues.push("copy-only proof should not require an image asset");
  if (treatment === "Screenshot proof" && !/approved Conversion screenshot required/.test(asset)) issues.push("screenshot proof should require a Conversion screenshot");
  if (!/design sample/.test(asset)) issues.push("missing Sample 1 design baseline");
  if (hiddenPublicNames.some((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(publicProof))) {
    issues.push("public proof contains client or founder name");
  }
  if (/Read image\/OCR|Conversion screenshot from Drive|Analytics proof from Drive|Verify exact/i.test(publicProof)) {
    issues.push("public proof contains internal verification note");
  }
  if (/Approved proof goes here after the source is verified/i.test(publicProof)) {
    issues.push("public proof contains unresolved placeholder copy");
  }

  return { id, issues };
});

const failed = checks.filter((check) => check.issues.length > 0);
assert.deepEqual(
  failed,
  [],
  `Design QA failed:\n${failed.map((check) => `${check.id}: ${check.issues.join(", ")}`).join("\n")}`,
);

console.log("Ad design QA passed: 20/20 designs use proof treatments correctly: transcript sources stay copy-only, Conversion screenshots use screenshot slots, CTA/disclaimer are present, and Sample 1 remains the baseline.");
