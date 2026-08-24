import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = ["app/page.tsx", "app/canva-preview/page.tsx"];
const banned = [
  /—/,
  /THE PROOF DID THE SELLING/,
  /TRUST CAME BEFORE THE PITCH/,
  /THE BUYER DIDN'T START COLD/,
  /Private transcript shaped the claim/,
];

function extractQuotedItems(source, declaration) {
  const match = source.match(new RegExp(`const ${declaration} = \\[([\\s\\S]*?)\\n\\];`));
  assert.ok(match, `Missing ${declaration}`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

for (const file of files) {
  const source = await readFile(file, "utf8");
  const frames = extractQuotedItems(source, "headlineFrames");

  assert.equal(frames.length, 20, `${file} must define 20 headline frames`);
  assert.equal(new Set(frames).size, 20, `${file} contains duplicate headline frames`);

  const generated = Array.from({ length: 20 }, (_, index) => frames[(index * 3) % frames.length]);
  assert.equal(new Set(generated).size, 20, `${file} repeats a headline in a 20-card batch`);

  for (const pattern of banned) {
    assert.doesNotMatch(source, pattern, `${file} contains banned copy: ${pattern}`);
  }
}

console.log("Proof-copy QA passed: 20 unique frames on both preview surfaces.");
