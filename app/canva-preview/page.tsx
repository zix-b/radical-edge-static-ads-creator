"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import proofDatabase from "../../content/proof-library.json";

type ProofSource = {
  client: string;
  proof: string;
  status: string;
  sourceType: "Transcript" | "Conversion";
};

type PreviewAd = {
  id: string;
  layout: string;
  angle: string;
  proofClient: string;
  proof: string;
  cta: string;
};

const offer = "One-day Radical Edge masterclass";
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];

const testimonialSources: ProofSource[] = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    client: client.name,
    proof: client.proofSummary,
    status: client.status,
    sourceType: "Transcript",
  }));

const conversionSources: ProofSource[] = proofDatabase.conversionFiles.map((file) => ({
  client: `Conversion: ${file.title}`,
  proof: file.summary ?? `${file.title} (${file.type})`,
  status: file.status ?? "Needs image read / attribution check",
  sourceType: "Conversion",
}));

const proofSources = [...testimonialSources, ...conversionSources];

function fitCopy(text: string, maxLength: number) {
  const cleaned = text
    .replace(/\s*Verify exact (wording|pull-quote).*$/i, "")
    .replace(/\s*Read image\/OCR and verify exact wording.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  const sliced = cleaned.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 60 ? lastSpace : maxLength - 1).trimEnd()}...`;
}

function proofSnippet(proof: string) {
  return proof
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .replace(/\s*Verify exact wording.*$/i, "")
    .slice(0, 118);
}

function buildHeadline(proof: string) {
  const proofText = proofSnippet(proof);
  const hasRevenue = /\$|closed|revenue/i.test(proofText);
  const hasViews = /views|followers/i.test(proofText);
  const hasTrust = /chosen|trust|recognition|enquir/i.test(proofText);

  return {
    highlight: hasRevenue ? "$10K+ CLOSED" : hasViews ? "1M+ VIEWS" : hasTrust ? "CHOSEN FIRST" : "RESULTS LIKE THIS",
    lineOne: hasRevenue ? "from organic demand" : hasViews ? "from authority content" : hasTrust ? "before the sales call" : "come from authority",
    lineTwo: "not cold chasing",
  };
}

function bottomClaim(proof: string) {
  if (/\$|closed|revenue/i.test(proof)) return "Turn proof into demand";
  if (/views|followers/i.test(proof)) return "Make attention convert";
  return "Get prospects that come to you";
}

function parseIndexes(value: string | null) {
  if (!value) return proofSources.map((_, index) => index);
  const parsed = value
    .split(",")
    .map((item) => Number(item))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < proofSources.length);
  return parsed.length ? parsed : proofSources.map((_, index) => index);
}

function buildAds(selectedProofIndexes: number[], seed: number): PreviewAd[] {
  const selectedProofs = selectedProofIndexes.map((index) => proofSources[index]).filter(Boolean);

  return Array.from({ length: 20 }, (_, index) => {
    const variantIndex = index + seed;
    const proofSource = selectedProofs[variantIndex % selectedProofs.length] ?? proofSources[0];
    const sourceType = proofSource.sourceType;
    const proofClient = sourceType === "Conversion" ? `Conversion proof ${String(index + 1).padStart(2, "0")}` : proofSource.client;
    const fittedProof = fitCopy(proofSource.proof, 120);

    return {
      id: `RE-${String(index + 1).padStart(2, "0")}`,
      layout: proofLayouts[variantIndex % proofLayouts.length],
      angle: "Proof / Result",
      proofClient,
      proof: `${sourceType}: ${proofClient}: ${fittedProof}`,
      cta: "Join the masterclass",
    };
  });
}

function CanvaPreviewContent() {
  const searchParams = useSearchParams();
  const params = {
    audience: searchParams.get("audience") || "Founders",
    promise: searchParams.get("promise") || "Build a personal brand that attracts high-ticket clients without outsourcing your voice.",
    batch: searchParams.get("batch") || "Masterclass Batch 01",
    seed: Number(searchParams.get("seed") || 0),
    proofIndexes: parseIndexes(searchParams.get("proofs")),
  };

  const ads = useMemo(() => buildAds(params.proofIndexes, params.seed), [params.proofIndexes, params.seed]);

  return (
    <main className="rendered-preview-page">
      <header className="rendered-preview-header">
        <div>
          <span>RADICAL EDGE</span>
          <h1>{params.batch}</h1>
        </div>
        <p>{params.audience} / {offer}</p>
      </header>

      <section className="rendered-preview-grid" aria-label="Rendered Canva-ready proof cards">
        {ads.map((ad) => {
          const headline = buildHeadline(ad.proof);
          return (
            <article className="rendered-card" data-document-role="page" data-label={ad.id} key={ad.id}>
              <div className="rendered-noise" />
              <div className="rendered-topline">
                <span>{ad.id}</span>
                <b>{ad.layout}</b>
              </div>
              <h2>
                <span>{headline.highlight}</span>
                {headline.lineOne}
                <em>{headline.lineTwo}</em>
              </h2>
              <div className="rendered-proof">
                <span>{ad.proofClient} proof</span>
                <strong>{proofSnippet(ad.proof)}</strong>
                <span>The system behind this is taught in the masterclass</span>
              </div>
              <div className="rendered-bottom">
                <p>{bottomClaim(ad.proof)} <span>already convinced</span></p>
                <i />
                <strong>{params.promise}</strong>
              </div>
              <footer>
                <b>RADICAL EDGE</b>
                <span>{ad.cta} &gt;</span>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default function CanvaPreviewPage() {
  return (
    <Suspense fallback={<main className="rendered-preview-page">Loading rendered cards...</main>}>
      <CanvaPreviewContent />
    </Suspense>
  );
}
