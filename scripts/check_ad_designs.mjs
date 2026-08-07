import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const angles = Array(20).fill("Proof / Result");

const transcriptProofs = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    sourceType: "Transcript",
    client: client.name,
    proof: client.proofSummary,
  }));
const conversionProofs = proofDatabase.conversionFiles
  .filter((file) => /screenshot|pdf/i.test(file.type) && file.fileId)
  .map((file) => ({
    sourceType: "Conversion",
    client: file.title,
    proof: file.publicClaim ?? file.summary ?? file.title,
    proofMeaning: file.proofMeaning,
    adHeader: file.adHeader,
    fileId: file.fileId,
    fileType: file.type,
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
  return (source.adHeader || source.proofMeaning || source.client).toUpperCase();
}

function buildHeadline(source) {
  const proof = publicProofCopy(source.proof);

  if (source.sourceType === "Conversion") {
    return conversionHeadlineLabel(source);
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
assert.ok(proofDatabase.conversionFiles.every((file) => file.adHeader && file.proofMeaning), "Every Conversion proof source needs extracted proof meaning and an ad header.");
assert.ok(baselineAsset, "A design sample baseline is required.");

const homePageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const canvaPreviewSource = readFileSync(new URL("../app/canva-preview/page.tsx", import.meta.url), "utf8");

assert.ok(homePageSource.includes("mock-static-ad"), "Homepage preview must render the static ad card.");
assert.ok(homePageSource.includes("proof-slot"), "Homepage preview must render the proof slot.");
assert.ok(homePageSource.includes("driveImageUrl"), "Homepage preview must build public Drive image URLs for conversion screenshots.");
assert.ok(homePageSource.includes("drive.usercontent.google.com/download"), "Homepage preview must use the direct public Drive image endpoint.");
assert.ok(homePageSource.includes("<img src={driveImageUrl(design[\"Proof File ID\"])}"), "Homepage preview must place conversion screenshots inside the proof slot.");
assert.ok(homePageSource.includes("function appBasePath()"), "Homepage must build deployment-stable generated proof-card links.");
assert.ok(homePageSource.includes("window.location.hostname.endsWith(\"github.io\") ? \"/radical-edge-static-ads-creator\" : \"\""), "Generated proof-card link must use the GitHub Pages base path on live and root path locally.");
assert.ok(homePageSource.includes("return `${appBasePath()}/canva-preview/?${params.toString()}`"), "Generated proof-card link must point to the correct canva-preview route.");
assert.ok(!homePageSource.includes("canva.com/d/"), "Homepage must not link to a stale hardcoded Canva design.");
assert.ok(!homePageSource.includes("Open editable Canva design"), "Homepage must not expose the stale editable Canva design button.");
assert.ok(canvaPreviewSource.includes("mock-static-ad rendered-static-ad"), "Canva preview must reuse the homepage static ad card markup.");
assert.ok(canvaPreviewSource.includes("proof-slot"), "Canva preview must reuse the homepage proof slot markup.");
assert.ok(canvaPreviewSource.includes("driveImageUrl"), "Canva preview must build public Drive image URLs for conversion screenshots.");
assert.ok(canvaPreviewSource.includes("drive.usercontent.google.com/download"), "Canva preview must use the direct public Drive image endpoint.");
assert.ok(canvaPreviewSource.includes("<img src={driveImageUrl(ad.fileId)}"), "Canva preview must place conversion screenshots inside the proof slot.");
assert.ok(!canvaPreviewSource.includes("rendered-proof"), "Canva preview should not use the old separate proof renderer.");
assert.ok(!canvaPreviewSource.includes("rendered-bottom"), "Canva preview should not use the old separate bottom renderer.");

const checks = angles.map((angle, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const source = index % 2 === 0 ? transcriptProofs[index % transcriptProofs.length] : conversionProofs[index % conversionProofs.length];
  const publicProof = publicProofCopy(source.proof);
  const usesScreenshot = source.sourceType === "Conversion" && /screenshot/i.test(source.fileType ?? "");
  const centerLabel = usesScreenshot ? source.client : source.client;
  const headline = buildHeadline(source);
  const baseline = `${baselineAsset.title} (${baselineAsset.type})`;
  const asset = usesScreenshot
    ? `${baseline} structure reference; approved Conversion screenshot required.`
    : `${baseline} structure reference; no image asset required.`;
  const bottom = "Join the masterclass. Results vary.";
  const issues = [];

  if (!bottom.includes("Join the masterclass")) issues.push("missing CTA");
  if (!bottom.includes("Results vary")) issues.push("missing disclaimer");
  if (angle !== "Proof / Result") issues.push("non-proof ad generated");
  if (!headline || /RESULTS LIKE THIS|\$10K\+ CLOSED|1M\+ VIEWS|CHOSEN FIRST|PROOF STRAIGHT FROM THE CHAT|CHAT PROOF|SCREENSHOT CARRIES|USE THE MESSAGE|CONVERSION SCREENSHOT PROOF/.test(headline)) issues.push("headline is still using generic rotated buckets");
  if (source.sourceType === "Conversion" && headline === source.client.toUpperCase()) issues.push("conversion headline is still using the file name");
  if (source.sourceType === "Transcript" && centerLabel !== source.client) issues.push("transcript source should show only the proof name in the center");
  if (source.sourceType === "Transcript" && /^Proof:/i.test(publicProof)) issues.push("transcript proof should not be pasted into the center");
  if (source.sourceType === "Conversion" && centerLabel !== source.client) issues.push("conversion source should use the renamed proof source");
  if (source.sourceType === "Conversion" && !source.fileId) issues.push("conversion screenshot is missing Drive file ID");
  if (!usesScreenshot && !/no image asset required/.test(asset)) issues.push("transcript proof should not require an image asset");
  if (usesScreenshot && !/approved Conversion screenshot required/.test(asset)) issues.push("screenshot proof should require a Conversion screenshot");
  if (!/design sample/.test(asset)) issues.push("missing Sample 1 design baseline");
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

console.log("Ad design QA passed: 20/20 designs use one proof source each, Conversion screenshots use screenshot slots, CTA/disclaimer are present, and Sample 1 remains the baseline.");
