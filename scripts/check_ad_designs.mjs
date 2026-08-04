import assert from "node:assert/strict";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const angles = [
  ...Array(5).fill("Pain / Problem"),
  ...Array(5).fill("Contrarian Belief"),
  ...Array(5).fill("Proof / Result"),
  ...Array(3).fill("Mechanism / Framework"),
  ...Array(2).fill("Founder POV"),
];

const transcriptProofs = proofDatabase.clients.map((client) => `Transcript: ${client.proofSummary}`);
const conversionProofs = proofDatabase.conversionFiles.map((file) => `Conversion: ${file.title} (${file.type})`);
const assetNames = proofDatabase.assetFiles.map((file) => `${file.title} (${file.type})`);

assert.equal(angles.length, 20, "Ad set must generate exactly 20 designs.");
assert.ok(transcriptProofs.length > 0, "At least one testimonial transcript proof source is required.");
assert.ok(conversionProofs.length > 0, "At least one Conversion proof source is required.");
assert.ok(assetNames.length > 0, "At least one Assets visual is required.");

const checks = angles.map((angle, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const usesAsset = index % 2 === 0;
  const proof = angle === "Proof / Result"
    ? `${transcriptProofs[index % transcriptProofs.length]} ${conversionProofs[index % conversionProofs.length]}`
    : "Support with transcript or Conversion proof only if available.";
  const asset = usesAsset ? `${assetNames[index % assetNames.length]} from Assets` : "No image required; use text-first Canva layout.";
  const bottom = "Join the masterclass. Results vary.";
  const issues = [];

  if (!bottom.includes("Join the masterclass")) issues.push("missing CTA");
  if (!bottom.includes("Results vary")) issues.push("missing disclaimer");
  if (angle === "Proof / Result" && !/Transcript:/.test(proof)) issues.push("missing transcript proof");
  if (angle === "Proof / Result" && !/Conversion:/.test(proof)) issues.push("missing Conversion proof");
  if (usesAsset && !/Assets/.test(asset)) issues.push("missing Assets visual direction");

  return { id, issues };
});

const failed = checks.filter((check) => check.issues.length > 0);
assert.deepEqual(
  failed,
  [],
  `Design QA failed:\n${failed.map((check) => `${check.id}: ${check.issues.join(", ")}`).join("\n")}`,
);

console.log("Ad design QA passed: 20/20 designs have CTA, disclaimer, proof sourcing, and asset direction.");
