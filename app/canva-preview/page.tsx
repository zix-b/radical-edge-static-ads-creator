"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import proofDatabase from "../../content/proof-library.json";

type ProofSource = {
  client: string;
  proof: string;
  fileId?: string;
  fileType?: string;
  status: string;
  sourceType: "Transcript" | "Conversion";
};

type ProofTreatment = "Copy-only proof" | "Screenshot proof";

type PreviewAd = {
  id: string;
  layout: string;
  angle: string;
  proof: string;
  sourceType: "Transcript" | "Conversion";
  treatment: ProofTreatment;
  fileId: string;
  headline: {
    highlight: string;
    lineOne: string;
    lineTwo: string;
  };
  cta: string;
};

const offer = "One-day Radical Edge masterclass";
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];
const hiddenPublicNames = [
  ...proofDatabase.clients.filter((client) => client.name !== "Custom proof").map((client) => client.name),
  "Kev",
  "Kevin",
];

const testimonialSources: ProofSource[] = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    client: client.name,
    proof: client.proofSummary,
    status: client.status,
    sourceType: "Transcript",
  }));

const conversionSources: ProofSource[] = proofDatabase.conversionFiles.map((file) => ({
  client: file.title,
  proof: file.summary ?? `${file.title} (${file.type})`,
  fileId: file.fileId,
  fileType: file.type,
  status: file.status ?? "Needs image read / attribution check",
  sourceType: "Conversion",
}));

const proofSources = [...testimonialSources, ...conversionSources];

function hasUsablePublicProof(source: ProofSource) {
  if (source.sourceType === "Conversion" && source.fileId && /proof screenshot/i.test(source.fileType ?? "")) return true;
  return !/Read image\/OCR|Conversion screenshot from Drive|Analytics proof from Drive|Transcript pending|Paste the exact/i.test(source.proof);
}

function anonymiseProofText(text: string) {
  return hiddenPublicNames.reduce((current, name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return current.replace(new RegExp(`\\b${escaped}\\b`, "gi"), name === "Kev" || name === "Kevin" ? "the team" : "the client");
  }, text);
}

function publicProofCopy(text: string, maxLength = 120) {
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

function proofSnippet(proof: string) {
  return publicProofCopy(proof, 118)
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^Proof:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .slice(0, 118);
}

function conversionHeadlineLabel(source: ProofSource) {
  const dateMatch = source.client.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00`);
    return `${date.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${Number(dateMatch[3])} CHAT PROOF`;
  }

  const imageMatch = source.client.match(/IMG[_ -]?(\d+)/i);
  if (imageMatch) return `CHAT PROOF IMG ${imageMatch[1]}`;

  return "CONVERSION SCREENSHOT PROOF";
}

function buildHeadline(source: ProofSource) {
  const proofText = proofSnippet(source.proof);

  if (source.sourceType === "Conversion") {
    if (/sales training|contextualised sales|personal brand/i.test(proofText)) {
      return {
        highlight: "THE CALL MADE SALES CLICK",
        lineOne: "because the advice matched their brand",
        lineTwo: "not a generic script",
      };
    }

    return {
      highlight: conversionHeadlineLabel(source),
      lineOne: "the screenshot carries the proof",
      lineTwo: "use the message in the center",
    };
  }

  if (/\$30k|\$10k|closed/i.test(proofText)) {
    return {
      highlight: "$30K+ FROM ORGANIC LEADS",
      lineOne: "including a fast $10K sales window",
      lineTwo: "from demand built before the call",
    };
  }

  if (/1M views|1,000 followers|9 videos|5 hours/i.test(proofText)) {
    return {
      highlight: "1M VIEWS FROM 9 VIDEOS",
      lineOne: "and 1,000 followers from focused content",
      lineTwo: "not endless posting",
    };
  }

  if (/Chosen over more established competitors/i.test(proofText)) {
    return {
      highlight: "CHOSEN OVER BIGGER COMPETITORS",
      lineOne: "before the sales call started",
      lineTwo: "because trust was built upfront",
    };
  }

  if (/\$50k|bootcamp/i.test(proofText)) {
    return {
      highlight: "$50K+ BOOTCAMP REVENUE",
      lineOne: "from stronger authority positioning",
      lineTwo: "not louder promotion",
    };
  }

  if (/attractive character|content topics|video editing|attention|leads/i.test(proofText)) {
    return {
      highlight: "CLEARER CHARACTER",
      lineOne: "clearer content, stronger attention",
      lineTwo: "so the right leads know why you matter",
    };
  }

  if (/1M\+ monthly views|parent\/student trust/i.test(proofText)) {
    return {
      highlight: "1M+ MONTHLY VIEWS",
      lineOne: "with stronger trust before enquiry",
      lineTwo: "from authority content",
    };
  }

  if (/combined TikTok\/Instagram|2,500 followers|enquiries/i.test(proofText)) {
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

function bottomClaim(proof: string) {
  if (/\$|closed|revenue/i.test(proof)) return "Turn proof into demand";
  if (/views|followers/i.test(proof)) return "Make attention convert";
  return "Get prospects that come to you";
}

function driveThumbnailUrl(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w900`;
}

function parseIndexes(value: string | null) {
  const usableIndexes = proofSources.map((source, index) => hasUsablePublicProof(source) ? index : -1).filter((index) => index >= 0);
  if (!value) return usableIndexes;
  const parsed = value
    .split(",")
    .map((item) => Number(item))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < proofSources.length && hasUsablePublicProof(proofSources[index]));
  return parsed.length ? parsed : usableIndexes;
}

function buildAds(selectedProofIndexes: number[], seed: number): PreviewAd[] {
  const selectedProofs = selectedProofIndexes.map((index) => proofSources[index]).filter(Boolean);

  return Array.from({ length: 20 }, (_, index) => {
    const variantIndex = index + seed;
    const proofSource = selectedProofs[variantIndex % selectedProofs.length] ?? proofSources[0];
    return {
      id: `RE-${String(index + 1).padStart(2, "0")}`,
      layout: proofLayouts[variantIndex % proofLayouts.length],
      angle: "Proof / Result",
      proof: proofSource.sourceType === "Conversion" ? `Conversion screenshot: ${proofSource.client}` : "Transcript signal: headline only",
      sourceType: proofSource.sourceType,
      treatment: proofSource.sourceType === "Conversion" && /proof screenshot/i.test(proofSource.fileType ?? "") ? "Screenshot proof" : "Copy-only proof",
      fileId: proofSource.fileId ?? "",
      headline: buildHeadline(proofSource),
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
          return (
            <article className="rendered-card" data-document-role="page" data-label={ad.id} key={ad.id}>
              <div className="rendered-noise" />
              <div className="rendered-topline">
                <span>{ad.id}</span>
                <b>{ad.layout}</b>
              </div>
              <h2>
                <span>{ad.headline.highlight}</span>
                {ad.headline.lineOne}
                <em>{ad.headline.lineTwo}</em>
              </h2>
              <div className={`rendered-proof ${ad.treatment === "Screenshot proof" ? "conversion-shot" : "transcript-signal"}`}>
                {ad.treatment === "Screenshot proof" && ad.fileId ? (
                  <img src={driveThumbnailUrl(ad.fileId)} alt={`${ad.id} conversion proof screenshot`} />
                ) : null}
                {ad.treatment === "Screenshot proof" ? (
                  <>
                    <span>SCREENSHOT PROOF</span>
                    <strong>Place the approved Conversion screenshot in this frame</strong>
                    <span>Blur names, numbers, profile pictures and sensitive details</span>
                  </>
                ) : (
                  <>
                    <span>COPY-ONLY PROOF</span>
                    <strong>Private proof shaped the headline and claim</strong>
                    <span>No client name, photo or private transcript text shown</span>
                  </>
                )}
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
