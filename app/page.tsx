"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type AngleType = "Proof / Result";
type ProofTreatment = "Copy-only proof" | "Screenshot proof" | "Narrative proof";
type ProofSource = {
  label: string;
  client: string;
  clientLabel?: string;
  proof: string;
  publicClaim?: string;
  extractedText?: string;
  proofMeaning?: string;
  adHeader?: string;
  fileId?: string;
  fileType?: string;
  visualUse?: string;
  needsBlur?: string;
  status: string;
  displayProof: string;
  sourceType: "Transcript" | "Conversion";
  treatment: ProofTreatment;
};

type ExtractedProof = {
  proofName: string;
  sourceType: "Conversion screenshot" | "Analytics PDF" | "Transcript" | "Manual text";
  clientName: string;
  rawExtractedText: string;
  privateDetailsFound: string[];
  publicClaim: string;
  proofMeaning: string;
  headlineOptions: string[];
  riskNotes: string[];
  needsBlur: string[];
  suggestedTreatment: ProofTreatment;
  approvedForAds: false;
};

type AdRow = {
  "Ad ID": string;
  "Campaign Name": string;
  "Batch Name": string;
  "Target Audience": string;
  "Angle Type": AngleType;
  "Proof Client": string;
  "Proof Name": string;
  "Proof Source Type": "Transcript" | "Conversion";
  "Proof Treatment": ProofTreatment;
  "Proof File ID": string;
  "Baseline Design": string;
  "Pain / Desire": string;
  "Core Message": string;
  Hook: string;
  Subhook: string;
  "Proof / Evidence": string;
  CTA: string;
  "Visual Direction": string;
  "Asset Needed": string;
  "Asset Used": string;
  "Canva Layout Type": string;
  "Top Text": string;
  "Headline Highlight": string;
  "Headline Line One": string;
  "Headline Line Two": string;
  "Middle Text": string;
  "Center Mode": "Screenshot proof" | "Copy-only proof";
  "Bottom Text": string;
  "Meta Primary Text": string;
  "Meta Headline": string;
  "Meta Description": string;
  Hypothesis: string;
  Status: string;
  Notes: string;
};

type ProofStrategy = {
  publicClientType: string;
  buyerMoment: string;
  wrongSolution: string;
  mechanism: string;
  bottomLine: string;
  metaAngle: string;
};

const radicalEdgeVoice =
  "Sharp founder/operator copy. Concrete pain. No hype. No generic marketing language.";

const offer = "One-day Radical Edge masterclass";
const editableCanvaDesignUrl = "https://www.canva.com/d/urqxhQ5Rp4ZgXhC";
const audiences = ["Founders", "Coaches / consultants", "Financial advisers", "Real estate agents", "Educators / experts", "Service providers"];
const metadataDoc = proofDatabase.referenceLinks.find((link) => link.label === "Conversion proof metadata");

const testimonialSources: ProofSource[] = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    label: `${client.name}: ${client.proofSummary}`,
    client: client.name,
    proof: client.proofSummary,
    status: client.status,
    displayProof: client.proofSummary.replace(/\s*Verify\b.*$/i, "").trim(),
    sourceType: "Transcript",
    treatment: "Copy-only proof",
  }));
const conversionSources: ProofSource[] = proofDatabase.conversionFiles.map((file) => ({
  label: file.proofId ?? file.title,
  client: file.title,
  clientLabel: file.clientLabel,
  proof: file.summary ?? file.title,
  publicClaim: file.publicClaim,
  extractedText: file.extractedText,
  proofMeaning: file.proofMeaning,
  adHeader: file.adHeader,
  fileId: file.fileId,
  fileType: file.type,
  visualUse: file.visualUse,
  needsBlur: file.needsBlur,
  status: file.status ?? "Needs image read / attribution check",
  displayProof: file.publicClaim ?? file.summary ?? file.title,
  sourceType: "Conversion",
  treatment: /screenshot/i.test(file.type) ? "Screenshot proof" : "Copy-only proof",
}));
const proofSources = [...testimonialSources, ...conversionSources];
const baselineAsset = proofDatabase.assetFiles.find((file) => file.type === "design sample");
const baselineDesign = baselineAsset ? `${baselineAsset.title} (${baselineAsset.type})` : "Sample 1 (design sample)";
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];
const hiddenPublicNames = [
  ...proofDatabase.clients.filter((client) => client.name !== "Custom proof").map((client) => client.name),
  "Kev",
  "Kevin",
];

function hasUsablePublicProof(source: ProofSource) {
  if (source.sourceType === "Conversion" && source.fileId && /proof screenshot/i.test(source.fileType ?? "")) return true;
  return !/Read image\/OCR|Conversion screenshot from Drive|Analytics proof from Drive|Transcript pending|Paste the exact/i.test(source.proof);
}

function proofSourceDisplayText(source: ProofSource) {
  if (source.sourceType === "Transcript") return "Transcript shapes headline only";
  if (/pdf/i.test(source.fileType ?? "")) return "Analytics PDF metadata";
  return source.publicClaim || source.proofMeaning || source.proof;
}

function proofSourceTitle(source: ProofSource) {
  return source.client;
}

function publicProofName(source: ProofSource) {
  const privateNames = [...hiddenPublicNames, source.clientLabel].filter(Boolean) as string[];
  const withoutNames = privateNames.reduce((current, name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return current.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "");
  }, source.client)
    .replace(/_/g, " ")
    .replace(/\bcopy of\b/gi, "")
    .replace(/\bscreenshot\b/gi, "")
    .replace(/\bproof\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const fallback = source.sourceType === "Conversion" ? source.publicClaim || source.adHeader : source.proof;
  return publicProofCopy(withoutNames || fallback || "Verified proof source", 52);
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

function conversionHeadlineLabel(source: ProofSource) {
  return (source.adHeader || source.proofMeaning || source.client).toUpperCase();
}

function buildProofHeadline(source: ProofSource) {
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

function proofSnippet(proof: string) {
  return publicProofCopy(proof, 118)
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^Proof:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .slice(0, 118);
}

function inferProofStrategy(source: ProofSource): ProofStrategy {
  const combined = [
    source.adHeader,
    source.publicClaim,
    source.proofMeaning,
    source.proof,
    source.client,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/viewing|listing viewing/i.test(combined)) {
    return {
      publicClientType: "agent / adviser",
      buyerMoment: "A buyer action came from content.",
      wrongSolution: "More cold follow-up",
      mechanism: "Content did the trust work before the viewing.",
      bottomLine: "The prospect came in with context.",
      metaAngle: "Content created a concrete buyer action, not just attention.",
    };
  }

  if (/referral/i.test(combined)) {
    return {
      publicClientType: "agent / adviser",
      buyerMoment: "A referral path opened through visible trust.",
      wrongSolution: "Waiting for random word of mouth",
      mechanism: "Authority content made the person easier to refer.",
      bottomLine: "The referral did not come from a cold pitch.",
      metaAngle: "Visible authority can make referrals less random.",
    };
  }

  if (/enquiry|warm lead|lead was warm|start from cold/i.test(combined)) {
    return {
      publicClientType: "founder / expert",
      buyerMoment: "The lead arrived with context.",
      wrongSolution: "Starting every call from zero trust",
      mechanism: "Content answered part of the sales conversation before WhatsApp.",
      bottomLine: "The call did not start from zero trust.",
      metaAngle: "The ad tests proof that content can pre-frame the sales call.",
    };
  }

  if (/call made sales|super insightful|sales advice|sales training/i.test(combined)) {
    return {
      publicClientType: "expert with a personal brand",
      buyerMoment: "Sales advice landed because the positioning was clear.",
      wrongSolution: "Using a generic sales script",
      mechanism: "The sales process was tied to the person's actual market position.",
      bottomLine: "The advice worked because it had context.",
      metaAngle: "Generic sales scripts fail when the offer context is unclear.",
    };
  }

  if (/\$|closed|revenue|bootcamp/i.test(combined)) {
    return {
      publicClientType: "expert / service provider",
      buyerMoment: "Revenue followed after trust was built before the call.",
      wrongSolution: "Trying to close cold attention",
      mechanism: "Organic content created sales context before the buyer conversation.",
      bottomLine: "The sale was not the first touchpoint.",
      metaAngle: "The proof tests whether revenue claims work better when tied to pre-call trust.",
    };
  }

  if (/views|followers|organic views|monthly views/i.test(combined)) {
    return {
      publicClientType: "education / expert business",
      buyerMoment: "Reach became more useful because the content was focused.",
      wrongSolution: "Posting volume without a point of view",
      mechanism: "Clearer hooks and formats gave buyers a reason to remember the brand.",
      bottomLine: "Reach only matters when buyers remember you.",
      metaAngle: "The proof tests whether attention with clearer positioning attracts better demand.",
    };
  }

  if (/chosen|competitors|established/i.test(combined)) {
    return {
      publicClientType: "agent / adviser",
      buyerMoment: "The buyer had already compared the person before the call.",
      wrongSolution: "Trying to win purely inside the sales call",
      mechanism: "Content made the buyer trust the person before comparing options.",
      bottomLine: "The decision started before the call.",
      metaAngle: "The proof tests whether comparison-based authority creates more qualified interest.",
    };
  }

  return {
    publicClientType: "founder / expert",
    buyerMoment: "The content gave the buyer a reason to move closer.",
    wrongSolution: "Posting without a conversion path",
    mechanism: "The message connected attention to a real buying conversation.",
    bottomLine: "The content gave the buyer a reason to come closer.",
    metaAngle: "The proof tests whether concrete buyer behaviour beats generic authority claims.",
  };
}

function buildProofLines(design: AdRow) {
  return [design["Proof Name"]];
}

function bottomClaim(design: AdRow) {
  return design["Bottom Text"];
}

function buildRows({
  audience,
  mainPromise,
  batchName,
  selectedProofs,
  baselineDesign,
  variantSeed,
}: {
  audience: string;
  mainPromise: string;
  batchName: string;
  selectedProofs: ProofSource[];
  baselineDesign: string;
  variantSeed: number;
}): AdRow[] {
  return Array.from({ length: 20 }, (_, index) => {
    const variantIndex = index + variantSeed;
    const proofSource = selectedProofs[variantIndex % selectedProofs.length] ?? proofSources[0];
    const layout = proofLayouts[variantIndex % proofLayouts.length];
    const id = `RE-${String(index + 1).padStart(2, "0")}`;
    const proofText = proofSource?.proof ?? "Select a proof source.";
    const hook = `Proof for ${audience.toLowerCase()}`;
    const subhook = `Your content should make the sales call easier, not create more cold follow-up.`;
    const cta = "Join the masterclass";
    const topText = hook;
    const sourceType = proofSource?.sourceType ?? "Transcript";
    const proofTreatment = proofSource?.treatment ?? "Copy-only proof";
    const proofLabel = proofSource?.client ?? "Unassigned";
    const proofName = publicProofName(proofSource);
    const strategy = inferProofStrategy(proofSource);
    const fittedProofText = publicProofCopy(proofSource?.publicClaim || proofText, 120);
    const headline = buildProofHeadline(proofSource);
    const middleText = sourceType === "Conversion"
      ? proofSource.publicClaim || proofSource.proofMeaning || proofSource.displayProof || proofSource.client
      : "Private transcript shaped the claim";
    const centerMode = proofTreatment === "Screenshot proof" ? "Screenshot proof" : "Copy-only proof";
    const bottomText = strategy.bottomLine;
    const baselineInstruction = `Use ${baselineDesign} as the structure reference: large headline, strong proof middle, clear interpretation, Radical Edge footer and CTA band.`;
    const visualDirection = `${baselineInstruction} Use the selected proof source as the evidence base. Follow content/proof-ad-reference-library.md: lead with result or buyer moment, then show the business bottleneck and mechanism. Transcript sources shape the headline/claim. Conversion screenshots go in the center frame. Do not use client photos or founder photos in this Canva draft.`;
    const assetNeeded = proofTreatment === "Screenshot proof"
      ? `Manual screenshot paste. ${proofSource.needsBlur || "Blur private details before publishing."}`
      : "No image asset. Use anonymised copy-only proof shaped from the manual proof database.";

    return {
      "Ad ID": id,
      "Campaign Name": `Masterclass - ${audience}`,
      "Batch Name": batchName,
      "Target Audience": audience,
      "Angle Type": "Proof / Result",
      "Proof Client": proofSource?.clientLabel ?? proofLabel,
      "Proof Name": proofName,
      "Proof Source Type": sourceType,
      "Proof Treatment": proofTreatment,
      "Proof File ID": proofSource?.fileId ?? "",
      "Baseline Design": baselineDesign,
      "Pain / Desire": fittedProofText,
      "Core Message": strategy.metaAngle,
      Hook: hook,
      Subhook: subhook,
      "Proof / Evidence": middleText,
      CTA: cta,
      "Visual Direction": proofSource.visualUse ? `${visualDirection} ${proofSource.visualUse}` : visualDirection,
      "Asset Needed": assetNeeded,
      "Asset Used": proofTreatment === "Screenshot proof" ? "Conversion screenshot" : "No image asset",
      "Canva Layout Type": layout,
      "Top Text": topText,
      "Headline Highlight": headline.highlight,
      "Headline Line One": headline.lineOne,
      "Headline Line Two": headline.lineTwo,
      "Middle Text": middleText,
      "Center Mode": centerMode,
      "Bottom Text": bottomText,
      "Meta Primary Text": `${strategy.bottomLine}\n\n${strategy.buyerMoment}\n\n${cta}. Results vary.`,
      "Meta Headline": headline.highlight.length > 52 ? headline.highlight.slice(0, 49).trimEnd() + "..." : headline.highlight,
      "Meta Description": `${strategy.publicClientType}. ${offer}.`,
      Hypothesis: `If ${audience.toLowerCase()} recognise ${strategy.wrongSolution.toLowerCase()}, this proof should create more qualified masterclass interest.`,
      Status: !hasUsablePublicProof(proofSource) || /pending|verify|needs/i.test(proofSource?.status ?? "") ? "Verify proof" : "Ready for Canva",
      Notes: `Canva page direction. Layout: ${layout}. Proof source: ${proofName}. ${proofSource.status}`,
    };
  });
}

export default function Home() {
  const [audience, setAudience] = useState("Founders");
  const [mainPromise, setMainPromise] = useState("Make your content do more work before the sales call.");
  const [selectedProofLabels, setSelectedProofLabels] = useState<string[]>(conversionSources.filter(hasUsablePublicProof).map((source) => source.label));
  const [batchName, setBatchName] = useState("Masterclass Batch 01");
  const [variantSeed, setVariantSeed] = useState(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofSourceName, setProofSourceName] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [manualProofText, setManualProofText] = useState("");
  const [extractedProof, setExtractedProof] = useState<ExtractedProof | null>(null);
  const [extractError, setExtractError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const selectedProofs = useMemo(
    () => proofSources.filter((source) => selectedProofLabels.includes(source.label)),
    [selectedProofLabels],
  );

  const designs = useMemo(
    () => buildRows({ audience, mainPromise, selectedProofs, batchName, baselineDesign, variantSeed }),
    [audience, mainPromise, selectedProofs, batchName, variantSeed],
  );

  const renderedPreviewUrl = useMemo(() => {
    const selectedIndexes = proofSources
      .map((source, index) => selectedProofLabels.includes(source.label) ? index : -1)
      .filter((index) => index >= 0);
    const params = new URLSearchParams({
      audience,
      promise: mainPromise,
      batch: batchName,
      seed: String(variantSeed),
      proofs: selectedIndexes.join(","),
    });
    return `/canva-preview/?${params.toString()}`;
  }, [audience, batchName, mainPromise, selectedProofLabels, variantSeed]);

  function toggleProof(label: string) {
    setSelectedProofLabels((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  function generateProofPreviews() {
    setVariantSeed((current) => current + 1);
  }

  async function readProof() {
    setExtractError("");
    setExtractedProof(null);

    if (!proofFile && !manualProofText.trim()) {
      setExtractError("Upload a proof screenshot/PDF or paste proof text first.");
      return;
    }

    const formData = new FormData();
    formData.set("sourceName", proofSourceName.trim() || proofFile?.name || "Manual proof");
    formData.set("notes", proofNotes);
    formData.set("manualText", manualProofText);
    if (proofFile) formData.set("file", proofFile);

    setIsExtracting(true);
    try {
      const response = await fetch("/api/read-proof", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setExtractError(data?.error || "Proof reading failed.");
        return;
      }

      setExtractedProof(data.extraction);
    } catch {
      setExtractError("Proof reader backend is unavailable. Run the local server with OPENAI_API_KEY set.");
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Radical Edge home">
          <span className="brand-mark">R/</span>
          <span>RADICAL EDGE</span>
        </a>
        <span className="product-label">ADS BATCH CREATOR</span>
      </header>

      <section className="hero compact" id="top">
        <p>Use this to create structured Meta static ad variations fast, then polish the winners manually in Canva.</p>
      </section>

      <section className="batch-studio">
        <aside className="brief-panel">
          <div className="section-heading"><span>01</span><h2>Batch brief</h2></div>

          <div className="fixed-offer">
            <span>Offer</span>
            <b>{offer}</b>
          </div>

          <div className="strategy-card">
            <span>Reference loaded</span>
            <b>proof-ad-reference-library.md</b>
            <p>Lead with the result or buyer moment. Keep names internal. Show the bottleneck, mechanism and proof source.</p>
          </div>

          <label htmlFor="audience">Audience</label>
          <select id="audience" value={audience} onChange={(event) => setAudience(event.target.value)}>
            {audiences.map((item) => <option key={item}>{item}</option>)}
          </select>

          <label htmlFor="batch">Batch name</label>
          <input id="batch" value={batchName} onChange={(event) => setBatchName(event.target.value)} />

          <label htmlFor="promise">Main promise</label>
          <textarea id="promise" rows={4} value={mainPromise} onChange={(event) => setMainPromise(event.target.value)} />

          <label>Proof sources to use</label>
          {metadataDoc ? (
            <a className="metadata-link" href={metadataDoc.url} target="_blank" rel="noreferrer">
              Open proof metadata doc
            </a>
          ) : null}
          <div className="testimonial-checklist">
            {proofSources.map((source) => (
              <label className="check-row proof-row" key={source.label}>
                <input type="checkbox" checked={selectedProofLabels.includes(source.label)} onChange={() => toggleProof(source.label)} />
                <span><b>{proofSourceTitle(source)}</b>{proofSourceDisplayText(source) ? <small>{proofSourceDisplayText(source)}</small> : null}</span>
              </label>
            ))}
          </div>
          <span className="hint">Every generated ad is a proof ad and uses exactly one selected proof source. Keep only the transcripts or Conversion screenshots you want in this batch.</span>

          <div className="proof-reader">
            <div className="reader-heading">
              <span>Proof reader</span>
              <b>Backend OCR</b>
            </div>

            <label htmlFor="proof-source-name">Proof name</label>
            <input id="proof-source-name" value={proofSourceName} onChange={(event) => setProofSourceName(event.target.value)} placeholder="e.g. hakim 5k in a day" />

            <label htmlFor="proof-upload">Screenshot or PDF</label>
            <input
              id="proof-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
            />

            <label htmlFor="manual-proof">Manual text</label>
            <textarea
              id="manual-proof"
              rows={4}
              value={manualProofText}
              onChange={(event) => setManualProofText(event.target.value)}
              placeholder="Paste transcript excerpt, WhatsApp text, or notes if there is no file."
            />

            <label htmlFor="proof-notes">Context notes</label>
            <textarea
              id="proof-notes"
              rows={3}
              value={proofNotes}
              onChange={(event) => setProofNotes(event.target.value)}
              placeholder="Client, timeframe, what needs redaction, attribution status."
            />

            <button className="reader-button" onClick={readProof} disabled={isExtracting}>
              {isExtracting ? "Reading proof..." : "Read proof with OpenAI"}
            </button>
            {extractError ? <p className="reader-error">{extractError}</p> : null}

            {extractedProof ? (
              <div className="extraction-result">
                <div className="result-topline">
                  <b>{extractedProof.proofName}</b>
                  <span>{extractedProof.approvedForAds ? "Approved" : "Review required"}</span>
                </div>
                <dl>
                  <dt>Public claim</dt>
                  <dd>{extractedProof.publicClaim || "No safe public claim extracted yet."}</dd>
                  <dt>What this proves</dt>
                  <dd>{extractedProof.proofMeaning || "Needs human context."}</dd>
                  <dt>Headlines</dt>
                  <dd>{extractedProof.headlineOptions.length ? extractedProof.headlineOptions.join(" / ") : "No headline options returned."}</dd>
                  <dt>Blur before use</dt>
                  <dd>{extractedProof.needsBlur.length ? extractedProof.needsBlur.join(", ") : "No blur list returned."}</dd>
                  <dt>Risk notes</dt>
                  <dd>{extractedProof.riskNotes.length ? extractedProof.riskNotes.join(" / ") : "No risk notes returned."}</dd>
                  <dt>Raw extracted text</dt>
                  <dd className="raw-text">{extractedProof.rawExtractedText || "No raw text returned."}</dd>
                </dl>
              </div>
            ) : null}
          </div>

          <div className="baseline-card">
            <span>Baseline design</span>
            <b>{baselineDesign}</b>
            <p>Use this as the structure reference only. The generated ads are proof-first and do not depend on image assets.</p>
          </div>

        </aside>

        <section className="design-panel">
          <div className="section-heading light"><span>02</span><h2>Proof preview set</h2><small>{designs.length} designs</small></div>
          <div className="actions-bar">
            <button className="generate" onClick={generateProofPreviews}>Generate proof previews <span>→</span></button>
            <a className="secondary-action link-action" href={editableCanvaDesignUrl} target="_blank" rel="noreferrer">Open editable Canva design</a>
            <a className="secondary-action link-action" href={renderedPreviewUrl} target="_blank" rel="noreferrer">Open rendered proof cards</a>
          </div>

          <div className="design-grid">
            {designs.map((design, index) => {
              return (
              <article className={`design-card design-${(index % 5) + 1}`} key={design["Ad ID"]}>
                <div className="mock-static-ad">
                  <div className="sample-noise" />
                  <h3>
                    <span>{design["Headline Highlight"]}</span>
                    {design["Headline Line One"]}
                    <em>{design["Headline Line Two"]}</em>
                  </h3>
                  <div className={`proof-slot ${design["Center Mode"] === "Screenshot proof" ? "conversion-shot" : "transcript-signal"}`}>
                    {buildProofLines(design).map((line) => <span className="proof-line" key={line}>{line}</span>)}
                  </div>
                  <div className="sample-bottom">
                    <p>{bottomClaim(design)}</p>
                    <i />
                    <strong>{mainPromise}</strong>
                  </div>
                </div>
              </article>
            );})}
          </div>
        </section>
      </section>

      <footer><span>RADICAL EDGE</span><p>{radicalEdgeVoice}</p></footer>
    </main>
  );
}
