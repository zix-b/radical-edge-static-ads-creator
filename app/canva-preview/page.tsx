"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import proofDatabase from "../../content/proof-library.json";

type ProofSource = {
  client: string;
  proof: string;
  publicClaim?: string;
  extractedText?: string;
  proofMeaning?: string;
  adHeader?: string;
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
  proofName: string;
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
const headlineFrames = [
  "THE PROOF DID THE SELLING",
  "TRUST CAME BEFORE THE PITCH",
  "THE BUYER DIDN'T START COLD",
  "CONTENT SHORTENED THE SALES CALL",
  "DEMAND STARTED BEFORE THE DM",
  "THE AUDIENCE ALREADY HAD CONTEXT",
  "THE SALE STARTED WITH THE CONTENT",
  "RECOGNITION CAME BEFORE REVENUE",
  "THE OFFER LANDED WITH LESS EXPLAINING",
  "CONTENT MADE THE NEXT STEP EASIER",
  "THE PROSPECT MOVED CLOSER FIRST",
  "AUTHORITY CHANGED THE CONVERSATION",
  "THE FOLLOW-UP DIDN'T START FROM ZERO",
  "THE CONTENT CARRIED THE TRUST",
  "BUYING CONTEXT CAME BEFORE THE CALL",
  "THE RIGHT PEOPLE WERE ALREADY WARM",
  "PROOF TURNED ATTENTION INTO ACTION",
  "THE BRAND GAVE BUYERS A REASON",
  "THE SALES CONVERSATION STARTED EARLY",
  "CONTENT CREATED THE COMMERCIAL SIGNAL",
];
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
  proof: file.summary ?? file.title,
  publicClaim: file.publicClaim,
  extractedText: file.extractedText,
  proofMeaning: file.proofMeaning,
  adHeader: file.adHeader,
  fileId: file.fileId,
  fileType: file.type,
  status: file.status ?? "Needs image read / attribution check",
  sourceType: "Conversion",
}));

const proofSources = [...testimonialSources, ...conversionSources];

function hasUsablePublicProof(source: ProofSource) {
  if (source.sourceType === "Conversion" && source.fileId && /screenshot|pdf/i.test(source.fileType ?? "")) return true;
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

  const usable = cleaned || "Use the verified proof source here.";
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
  return (source.adHeader || source.proofMeaning || source.client).toUpperCase();
}

function pickVariant(items: string[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

function buildHeadline(source: ProofSource, seed: number) {
  const proofText = proofSnippet(source.proof);

  if (/S\$5K|S\$9\.5K|two-hour class/i.test(proofText)) {
    const variants = [
      ["ABOUT S$9.5K FROM A 2-HOUR CLASS", "after about S$5K net", "from the previous class"],
      ["THE NEXT CLASS BROUGHT ABOUT S$9.5K", "the previous one netted about S$5K", ""],
      ["ABOUT S$5K NET. THEN ABOUT S$9.5K.", "from two-hour classes", ""],
      ["TRUST CAME BEFORE THE CLASS", "about S$9.5K from two hours", ""],
      ["SOLD OUT BEFORE THE YOUTUBE POST", "Instagram brought the signups", ""],
      ["INSTAGRAM FILLED THE CLASS", "before YouTube heard about it", ""],
      ["3 YEARS OF CONTENT STARTED PAYING BACK", "about S$9.5K from the next class", ""],
      ["THE CONTENT ATM FINALLY PAID OUT", "about S$5K net, then about S$9.5K", ""],
      ["HE DOUBLED THE PRICE", "and the next class still sold out", ""],
      ["FROM S$5K NET TO ABOUT S$9.5K", "with the same two-hour class format", ""],
      ["THE CLASS SOLD BEFORE THE BIG ANNOUNCEMENT", "Instagram had already done the work", ""],
      ["NO YOUTUBE ANNOUNCEMENT NEEDED", "the class was already sold out", ""],
      ["YEARS OF CONTENT. ONE SOLD-OUT CLASS.", "Instagram turned attention into seats", ""],
      ["THE AUDIENCE WAS READY TO BUY", "before the class reached YouTube", ""],
      ["ABOUT S$9.5K. TWO HOURS.", "the demand was built before launch day", ""],
      ["THE SECOND CLASS NEARLY DOUBLED THE RETURN", "about S$5K net became about S$9.5K", ""],
      ["HIGHER PRICE. SOLD-OUT CLASS.", "the audience already trusted the educator", ""],
      ["CONTENT TURNED INTO PAID SEATS", "not another spike in views", ""],
      ["THE SALE STARTED YEARS BEFORE THE CLASS", "each post built the buying context", ""],
      ["INSTAGRAM DID MORE THAN BUILD AN AUDIENCE", "it filled a higher-priced class", ""],
    ];
    const [highlight, lineOne, lineTwo] = variants[Math.abs(seed) % variants.length];
    return { highlight, lineOne, lineTwo };
  }

  const claimLines = source.sourceType === "Conversion"
    ? [conversionHeadlineLabel(source).toLowerCase()]
    : /\$30k|\$10k|closed/i.test(proofText)
      ? ["$30K+ from organic leads", "$10K came in fast", "organic demand created the sales window", "the close came after trust was built"]
      : /1M views|1,000 followers|9 videos|5 hours/i.test(proofText)
        ? ["1M views from 9 videos", "1,000 followers from focused content", "five hours of shooting created the assets", "a tighter content angle moved faster"]
        : /Chosen over more established competitors/i.test(proofText)
          ? ["chosen over more established competitors", "the content changed the comparison", "the buyer knew why to choose him", "authority beat the bigger name"]
          : /\$50k|bootcamp/i.test(proofText)
            ? ["$50K+ in bootcamp revenue", "clearer authority supported the offer", "the bootcamp sold with more context", "recognition made the ask easier"]
            : /attractive character|content topics|video editing|attention|leads/i.test(proofText)
              ? ["clearer character, topics and editing", "a sharper angle created better leads", "the brand stopped feeling random", "the content became easier to trust"]
              : /1M\+ monthly views|parent\/student trust/i.test(proofText)
                ? ["1M+ monthly views", "more parent and student trust", "recognition arrived before enquiry", "views supported warmer enquiries"]
                : /combined TikTok\/Instagram|2,500 followers|enquiries/i.test(proofText)
                  ? ["close to 1M combined views", "around 2,500 followers", "recognition created more enquiries", "the centre became easier to remember"]
                  : [publicProofCopy(proofText, 74).toLowerCase()];

  return {
    highlight: pickVariant(headlineFrames, seed),
    lineOne: pickVariant(claimLines, Math.floor(Math.abs(seed) / headlineFrames.length) + seed),
    lineTwo: "",
  };
}

function bottomClaim(proof: string) {
  if (/\$|closed|revenue/i.test(proof)) return "Revenue is easier when trust exists first.";
  if (/views|followers/i.test(proof)) return "Views only matter when they move buyers.";
  if (/viewing|referral|enquiry|lead|call/i.test(proof)) return "The sales conversation started before the call.";
  return "Good content gives buyers a reason to come closer.";
}

function parseIndexes(value: string | null) {
  const conversionIndexes = proofSources.map((source, index) => source.sourceType === "Conversion" && hasUsablePublicProof(source) ? index : -1).filter((index) => index >= 0);
  const usableIndexes = conversionIndexes.length
    ? conversionIndexes
    : proofSources.map((source, index) => hasUsablePublicProof(source) ? index : -1).filter((index) => index >= 0);
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
      proofName: proofSource.client,
      proof: proofSource.sourceType === "Conversion"
        ? proofSource.publicClaim || proofSource.proofMeaning || proofSource.proof || proofSource.client
        : publicProofCopy(proofSource.proof, 120),
      sourceType: proofSource.sourceType,
      treatment: proofSource.sourceType === "Conversion" && /screenshot/i.test(proofSource.fileType ?? "") ? "Screenshot proof" : "Copy-only proof",
      fileId: proofSource.fileId ?? "",
      headline: buildHeadline(proofSource, seed * 7 + index * 3),
      cta: "Join the masterclass",
    };
  });
}

type PreviewParams = {
  audience: string;
  promise: string;
  batch: string;
  seed: number;
  proofIndexes: number[];
};

const defaultPreviewParams: PreviewParams = {
  audience: "Founders",
  promise: "Build a personal brand that attracts high-ticket clients without outsourcing your voice.",
  batch: "Masterclass Batch 01",
  seed: 0,
  proofIndexes: parseIndexes(null),
};

function RenderedCards({ params, ads }: { params: PreviewParams; ads: PreviewAd[] }) {
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
              <img className="rendered-noise-img" src="../radical-edge-ad-background.png" alt="" />
              <div className="rendered-noise" />
              <h2>
                <span>{ad.headline.highlight}</span>
                {ad.headline.lineOne}
                <em>{ad.headline.lineTwo}</em>
              </h2>
              <div className={`rendered-proof ${ad.treatment === "Screenshot proof" ? "conversion-shot" : "transcript-signal"}`}>
                <strong>{ad.proofName}</strong>
              </div>
              <div className="rendered-bottom">
                <p>{bottomClaim(ad.proof)}</p>
                <i />
                <strong>{params.promise}</strong>
              </div>
              <footer>
                <span>{ad.cta} &gt;</span>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function StaticCanvaFallback() {
  return <RenderedCards params={defaultPreviewParams} ads={buildAds(defaultPreviewParams.proofIndexes, defaultPreviewParams.seed)} />;
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

  return <RenderedCards params={params} ads={ads} />;
}

export default function CanvaPreviewPage() {
  return (
    <Suspense fallback={<StaticCanvaFallback />}>
      <CanvaPreviewContent />
    </Suspense>
  );
}
