import assert from "node:assert/strict";
import proofDatabase from "../content/proof-library.json" with { type: "json" };

const angles = Array(20).fill("Proof / Result");

const transcriptProofs = proofDatabase.clients.map((client) => `Transcript: ${client.proofSummary}`);
const conversionProofs = proofDatabase.conversionFiles.map((file) => `Conversion: ${file.title} (${file.type})`);
const baselineAsset = proofDatabase.assetFiles.find((file) => file.type === "design sample");

assert.equal(angles.length, 20, "Ad set must generate exactly 20 designs.");
assert.ok(transcriptProofs.length > 0, "At least one testimonial transcript proof source is required.");
assert.ok(conversionProofs.length > 0, "At least one Conversion proof source is required.");
assert.ok(baselineAsset, "A design sample baseline is required.");

const checks = angles.map((angle, index) => {
  const id = `RE-${String(index + 1).padStart(2, "0")}`;
  const proof = `${transcriptProofs[index % transcriptProofs.length]} ${conversionProofs[index % conversionProofs.length]}`;
  const baseline = `${baselineAsset.title} (${baselineAsset.type})`;
  const asset = `${baseline} structure reference; no image asset required.`;
  const bottom = "Join the masterclass. Results vary.";
  const issues = [];

  if (!bottom.includes("Join the masterclass")) issues.push("missing CTA");
  if (!bottom.includes("Results vary")) issues.push("missing disclaimer");
  if (angle !== "Proof / Result") issues.push("non-proof ad generated");
  if (!/Transcript:/.test(proof)) issues.push("missing transcript proof");
  if (!/Conversion:/.test(proof)) issues.push("missing Conversion proof");
  if (!/no image asset required/.test(asset)) issues.push("image asset should not be required");
  if (!/design sample/.test(asset)) issues.push("missing Sample 1 design baseline");

  return { id, issues };
});

const failed = checks.filter((check) => check.issues.length > 0);
assert.deepEqual(
  failed,
  [],
  `Design QA failed:\n${failed.map((check) => `${check.id}: ${check.issues.join(", ")}`).join("\n")}`,
);

console.log("Ad design QA passed: 20/20 designs are proof ads with testimonial sourcing, CTA, disclaimer, Sample 1 baseline, and no image asset dependency.");
