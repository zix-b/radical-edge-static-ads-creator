"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type AngleType = "Proof / Result";
type ProofTreatment = "Copy-only proof" | "Screenshot proof" | "Narrative proof";
type ProofSource = {
  label: string;
  client: string;
  proof: string;
  extractedText?: string;
  proofMeaning?: string;
  adHeader?: string;
  fileId?: string;
  fileType?: string;
  status: string;
  displayProof: string;
  sourceType: "Transcript" | "Conversion";
  treatment: ProofTreatment;
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

const radicalEdgeVoice =
  "Sharp, direct, founder-led, high-agency, strategic, not hypey, not guru-ish.";

const offer = "One-day Radical Edge masterclass";
const editableCanvaDesignUrl = "https://www.canva.com/d/VKrqLWsHVyG6p3z";
const audiences = ["Founders", "Coaches / consultants", "Financial advisers", "Real estate agents", "Educators / experts", "Service providers"];

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
  label: `${file.title}: ${file.summary ?? `${file.title} (${file.type})`}`,
  client: file.title,
  proof: file.summary ?? `${file.title} (${file.type})`,
  extractedText: file.extractedText,
  proofMeaning: file.proofMeaning,
  adHeader: file.adHeader,
  fileId: file.fileId,
  fileType: file.type,
  status: file.status ?? "Needs image read / attribution check",
  displayProof: (file.summary ?? `${file.title} (${file.type})`)
    .replace(/\s*Verify\b.*$/i, "")
    .replace(/\s*Read image\/OCR\b.*$/i, "")
    .trim(),
  sourceType: "Conversion",
  treatment: /proof screenshot/i.test(file.type) ? "Screenshot proof" : "Copy-only proof",
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
  return /analytics proof/i.test(source.fileType ?? "") ? "Analytics proof PDF" : "";
}

function proofSourceTitle(source: ProofSource) {
  return source.client;
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

function proofSnippet(proof: string) {
  return publicProofCopy(proof, 118)
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^Proof:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .slice(0, 118);
}

function driveThumbnailUrl(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w900`;
}

function buildProofLines(design: AdRow) {
  if (design["Center Mode"] === "Screenshot proof") {
    return [];
  }

  return [design["Proof Name"]];
}

function bottomClaim(design: AdRow) {
  if (/\$|closed|revenue/i.test(design["Middle Text"])) return "Turn proof into demand";
  if (/views|followers/i.test(design["Middle Text"])) return "Make attention convert";
  return "Get prospects that come to you";
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
    const hook = `Proof ad for ${audience.toLowerCase()}`;
    const subhook = `Build a personal brand that attracts high-ticket clients without outsourcing your voice.`;
    const cta = "Join the masterclass";
    const topText = hook;
    const sourceType = proofSource?.sourceType ?? "Transcript";
    const proofTreatment = proofSource?.treatment ?? "Copy-only proof";
    const proofLabel = sourceType === "Conversion" ? `Conversion proof ${String(index + 1).padStart(2, "0")}` : proofSource?.client ?? "Unassigned";
    const proofName = proofSourceTitle(proofSource);
    const fittedProofText = publicProofCopy(proofText, 120);
    const headline = buildProofHeadline(proofSource);
    const middleText = sourceType === "Conversion"
      ? proofSource.proofMeaning || proofSource.displayProof || proofSource.client
      : "Transcript signal: headline only";
    const centerMode = proofTreatment === "Screenshot proof" ? "Screenshot proof" : "Copy-only proof";
    const bottomText = `${cta}. Results vary.`;
    const baselineInstruction = `Use ${baselineDesign} as the structure reference: large headline, strong proof middle, clear interpretation, Radical Edge footer and CTA band.`;
    const visualDirection = `${baselineInstruction} Use the selected proof source as the evidence base. Transcript sources shape the headline/claim. Conversion screenshots go in the center frame. Do not use client photos or founder photos in this Canva draft.`;
    const assetNeeded = proofTreatment === "Screenshot proof"
      ? "Approved Conversion screenshot. Blur names, phone numbers, profile pictures and sensitive details in Canva before publishing."
      : "No image asset. Use anonymised copy-only proof shaped from the manual proof database.";

    return {
      "Ad ID": id,
      "Campaign Name": `Masterclass - ${audience}`,
      "Batch Name": batchName,
      "Target Audience": audience,
      "Angle Type": "Proof / Result",
      "Proof Client": proofLabel,
      "Proof Name": proofName,
      "Proof Source Type": sourceType,
      "Proof Treatment": proofTreatment,
      "Proof File ID": proofSource?.fileId ?? "",
      "Baseline Design": baselineDesign,
      "Pain / Desire": fittedProofText,
      "Core Message": mainPromise,
      Hook: hook,
      Subhook: subhook,
      "Proof / Evidence": middleText,
      CTA: cta,
      "Visual Direction": visualDirection,
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
      "Meta Primary Text": `${hook}\n\n${subhook}\n\n${mainPromise}\n\n${cta}. Example only. Results vary.`,
      "Meta Headline": hook.length > 52 ? hook.slice(0, 49).trimEnd() + "..." : hook,
      "Meta Description": `${offer} for ${audience}.`,
      Hypothesis: `If ${audience.toLowerCase()} trust this proof source, then this creative should improve qualified attention for the masterclass.`,
      Status: !hasUsablePublicProof(proofSource) || /pending|verify|needs/i.test(proofSource?.status ?? "") ? "Verify proof" : "Ready for Canva",
      Notes: `Canva page direction. Layout: ${layout}. Proof source: ${proofName}. Auto-fit copy before QA.`,
    };
  });
}

export default function Home() {
  const [audience, setAudience] = useState("Founders");
  const [mainPromise, setMainPromise] = useState("Build a personal brand that attracts high-ticket clients without outsourcing your voice.");
  const [selectedProofLabels, setSelectedProofLabels] = useState<string[]>(proofSources.filter(hasUsablePublicProof).map((source) => source.label));
  const [batchName, setBatchName] = useState("Masterclass Batch 01");
  const [variantSeed, setVariantSeed] = useState(0);
  const selectedProofs = useMemo(
    () => proofSources.filter((source) => selectedProofLabels.includes(source.label)),
    [selectedProofLabels],
  );

  const designs = useMemo(
    () => buildRows({ audience, mainPromise, selectedProofs, batchName, baselineDesign, variantSeed }),
    [audience, mainPromise, selectedProofs, batchName, variantSeed],
  );

  function toggleProof(label: string) {
    setSelectedProofLabels((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  function generateProofPreviews() {
    setVariantSeed((current) => current + 1);
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

          <label htmlFor="audience">Audience</label>
          <select id="audience" value={audience} onChange={(event) => setAudience(event.target.value)}>
            {audiences.map((item) => <option key={item}>{item}</option>)}
          </select>

          <label htmlFor="batch">Batch name</label>
          <input id="batch" value={batchName} onChange={(event) => setBatchName(event.target.value)} />

          <label htmlFor="promise">Main promise</label>
          <textarea id="promise" rows={4} value={mainPromise} onChange={(event) => setMainPromise(event.target.value)} />

          <label>Proof sources to use</label>
          <div className="testimonial-checklist">
            {proofSources.map((source) => (
              <label className="check-row proof-row" key={source.label}>
                <input type="checkbox" checked={selectedProofLabels.includes(source.label)} onChange={() => toggleProof(source.label)} />
                <span><b>{proofSourceTitle(source)}</b>{proofSourceDisplayText(source) ? <small>{proofSourceDisplayText(source)}</small> : null}</span>
              </label>
            ))}
          </div>
          <span className="hint">Every generated ad is a proof ad and uses exactly one selected proof source. Keep only the transcripts or Conversion screenshots you want in this batch.</span>

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
          </div>

          <div className="design-grid">
            {designs.map((design, index) => {
              return (
              <article className={`design-card design-${(index % 5) + 1}`} key={design["Ad ID"]}>
                <div className="design-meta">
                  <span>{design["Ad ID"]}</span>
                  <b>{design["Canva Layout Type"]}</b>
                </div>
                <div className="mock-static-ad">
                  <div className="sample-noise" />
                  <small>{design["Angle Type"]}</small>
                  <h3>
                    <span>{design["Headline Highlight"]}</span>
                    {design["Headline Line One"]}
                    <em>{design["Headline Line Two"]}</em>
                  </h3>
                  <div className={`proof-slot ${design["Center Mode"] === "Screenshot proof" ? "conversion-shot" : "transcript-signal"}`}>
                    {design["Center Mode"] === "Screenshot proof" && design["Proof File ID"] ? (
                      <img src={driveThumbnailUrl(design["Proof File ID"])} alt={`${design["Ad ID"]} conversion proof screenshot`} />
                    ) : null}
                    {buildProofLines(design).map((line) => <span className="proof-line" key={line}>{line}</span>)}
                  </div>
                  <div className="sample-bottom">
                    <p>{bottomClaim(design)} <span>already convinced</span></p>
                    <i />
                    <strong>Learn how this happened inside the one-day masterclass</strong>
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
