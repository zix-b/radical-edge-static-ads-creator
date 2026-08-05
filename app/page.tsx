"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type AngleType = "Proof / Result";
type ProofTreatment = "Copy-only proof" | "Screenshot proof" | "Narrative proof";
type ProofSource = {
  label: string;
  client: string;
  proof: string;
  fileId?: string;
  fileType?: string;
  status: string;
  displayProof: string;
  sourceType: "Transcript" | "Conversion";
  treatment: ProofTreatment;
};
type QaResult = {
  adId: string;
  label: string;
  status: "Pass" | "Check";
  issues: string[];
};

type AdRow = {
  "Ad ID": string;
  "Campaign Name": string;
  "Batch Name": string;
  "Target Audience": string;
  "Angle Type": AngleType;
  "Proof Client": string;
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
const editableCanvaDesignUrl = "https://www.canva.com/d/AV2RmUlTg6EQbZL";
const audiences = ["Founders", "Coaches / consultants", "Financial advisers", "Real estate agents", "Educators / experts", "Service providers"];

const allowedDriveFolders = proofDatabase.allowedDriveFolders;
const proofTreatments: Array<{ title: ProofTreatment; bestFor: string; rule: string }> = [
  {
    title: "Copy-only proof",
    bestFor: "Privacy-sensitive testimonial ads",
    rule: "Use the proof to shape the headline and anonymised claim. Do not show names, phone numbers, profile pictures or private transcript text.",
  },
  {
    title: "Screenshot proof",
    bestFor: "Trust-heavy proof ads and retargeting",
    rule: "Use only Conversion screenshots in the center frame. Blur names, phone numbers, profile pictures and sensitive details in Canva before publishing.",
  },
  {
    title: "Narrative proof",
    bestFor: "Landing pages, emails and founder posts",
    rule: "Keep this in notes for now. Do not turn it into a static ad layout until the story has consent, context and approved attribution.",
  },
];
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
  if (source.sourceType === "Conversion" && /proof screenshot/i.test(source.fileType ?? "")) {
    const context = /Conversion screenshot from Drive|Read image\/OCR/i.test(source.proof)
      ? "OCR/context still needed before writing any public claim."
      : source.displayProof;

    return `Use as centre screenshot proof. Blur names, numbers, profile pictures and sensitive details in Canva. ${context}`;
  }

  if (source.sourceType === "Conversion" && /analytics proof/i.test(source.fileType ?? "")) {
    return "Analytics proof PDF. Do not use directly as an ad yet; extract the exact metric, date range, source and attribution first.";
  }

  if (!hasUsablePublicProof(source)) {
    return "Not ready for public ad copy yet. Extract the exact claim, context, consent and attribution before using.";
  }

  return source.displayProof;
}

function formatSourceDate(title: string) {
  const dateMatch = title.match(/(\d{4})-(\d{2})-(\d{2})(?: at ([\d.]+) (AM|PM))?/i);
  if (!dateMatch) return "";

  const [, year, month, day, rawTime, meridiem] = dateMatch;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  const dateLabel = `${date.toLocaleString("en-US", { month: "short" })} ${Number(day)}, ${year}`;
  if (!rawTime || !meridiem) return dateLabel;

  return `${dateLabel}, ${rawTime.replaceAll(".", ":")} ${meridiem.toUpperCase()}`;
}

function proofSourceTitle(source: ProofSource) {
  if (source.sourceType === "Transcript") return `Copy-only proof: ${source.client}`;

  if (/analytics proof/i.test(source.fileType ?? "")) return `Analytics proof: ${source.client}`;

  const readableDate = formatSourceDate(source.client);
  if (readableDate) return `Screenshot proof: ${readableDate}`;

  const imageMatch = source.client.match(/IMG[_ -]?(\d+)/i);
  if (imageMatch) return `Screenshot proof: IMG ${imageMatch[1]}`;

  return `Screenshot proof: ${source.client}`;
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
  const dateMatch = source.client.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00`);
    return `${date.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${Number(dateMatch[3])} CHAT PROOF`;
  }

  const imageMatch = source.client.match(/IMG[_ -]?(\d+)/i);
  if (imageMatch) return `CHAT PROOF IMG ${imageMatch[1]}`;

  return "CONVERSION SCREENSHOT PROOF";
}

function buildProofHeadline(source: ProofSource) {
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
    return [
      "SCREENSHOT PROOF",
      "Place the approved Conversion screenshot in this frame",
      "Blur names, numbers, profile pictures and sensitive details",
    ];
  }

  return [
    "COPY-ONLY PROOF",
    "Private proof shaped the headline and claim",
    "No client name, photo or private transcript text shown",
  ];
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
    const fittedProofText = publicProofCopy(proofText, 120);
    const headline = buildProofHeadline(proofSource);
    const middleText = sourceType === "Conversion" ? `Conversion screenshot: ${proofSource.client}` : "Transcript signal: headline only";
    const centerMode = proofTreatment === "Screenshot proof" ? "Screenshot proof" : "Copy-only proof";
    const bottomText = `${cta}. Results vary.`;
    const baselineInstruction = `Use ${baselineDesign} as the structure reference: large headline, strong proof middle, clear interpretation, Radical Edge footer and CTA band.`;
    const visualDirection = `${baselineInstruction} Use the selected proof source as the evidence base. Transcript sources are copy-only and should only shape the headline/claim. Conversion screenshots go in the center frame. Do not use client names, client photos or founder photos in this Canva draft.`;
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
      Hypothesis: `If ${audience.toLowerCase()} trust this ${proofTreatment.toLowerCase()} source, then this creative should improve qualified attention for the masterclass.`,
      Status: !hasUsablePublicProof(proofSource) || /pending|verify|needs/i.test(proofSource?.status ?? "") ? "Verify proof" : "Ready for Canva",
      Notes: `Canva page direction. Layout: ${layout}. Proof source: ${proofSource?.client ?? "Unassigned"}. Auto-fit copy before QA.`,
    };
  });
}

function qaDesigns(designs: AdRow[], baselineDesign: string, selectedProofs: ProofSource[]): QaResult[] {
  return designs.map((design) => {
    const issues: string[] = [];
    const proofText = design["Proof / Evidence"];
    const middleText = design["Middle Text"];

    if (!design["Top Text"].trim()) issues.push("Missing top text");
    if (!middleText.trim()) issues.push("Missing middle proof/message");
    if (!design["Bottom Text"].includes("Join the masterclass")) issues.push("Missing masterclass CTA");
    if (!design["Bottom Text"].includes("Results vary")) issues.push("Missing results disclaimer");
    if (!design["Visual Direction"].trim()) issues.push("Missing visual direction");
    if (!design["Asset Needed"].trim()) issues.push("Missing asset instruction");
    if (!design["Baseline Design"].includes("Sample 1") && !/design sample/i.test(design["Baseline Design"])) {
      issues.push("Baseline should come from the Assets design sample");
    }
    if (!design["Visual Direction"].includes(baselineDesign)) {
      issues.push("Visual direction must reference the Sample 1 baseline");
    }
    if (design["Top Text"].length > 120) issues.push("Top text may be too long for 1080 x 1350");
    if (middleText.length > 260) issues.push("Generated proof copy was not auto-fitted");
    if (design["Angle Type"] !== "Proof / Result") issues.push("Generated ad must stay proof/result only");
    if (design["Proof Source Type"] === "Transcript" && design["Center Mode"] !== "Copy-only proof") {
      issues.push("Transcript sources must use copy-only proof");
    }
    if (design["Proof Source Type"] === "Transcript" && /^Proof:/i.test(middleText)) {
      issues.push("Transcript proof should not be pasted into the center block");
    }
    if (design["Proof Treatment"] === "Screenshot proof" && design["Center Mode"] !== "Screenshot proof") {
      issues.push("Screenshot proofs must use the center image slot");
    }
    if (design["Proof Treatment"] === "Screenshot proof" && !design["Proof File ID"]) {
      issues.push("Conversion screenshot is missing a Drive file ID");
    }
    if (hiddenPublicNames.some((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(proofText))) {
      issues.push("Public design must not include client or founder names");
    }
    if (/Read image\/OCR|Conversion screenshot from Drive|Analytics proof from Drive|Verify exact/i.test(proofText)) {
      issues.push("Internal proof hygiene notes leaked into public copy");
    }
    if (/Approved proof goes here after the source is verified/i.test(proofText)) {
      issues.push("Selected proof source needs manual proof copy before Canva approval");
    }
    if (selectedProofs.length === 0) {
      issues.push("Select at least one proof source for proof ads");
    }
    return {
      adId: design["Ad ID"],
      label: design["Canva Layout Type"],
      status: issues.length ? "Check" : "Pass",
      issues,
    };
  });
}

export default function Home() {
  const [audience, setAudience] = useState("Founders");
  const [mainPromise, setMainPromise] = useState("Build a personal brand that attracts high-ticket clients without outsourcing your voice.");
  const [selectedProofLabels, setSelectedProofLabels] = useState<string[]>(proofSources.filter(hasUsablePublicProof).map((source) => source.label));
  const [batchName, setBatchName] = useState("Masterclass Batch 01");
  const [status, setStatus] = useState("Ready to generate proof previews.");
  const [variantSeed, setVariantSeed] = useState(0);
  const selectedProofs = useMemo(
    () => proofSources.filter((source) => selectedProofLabels.includes(source.label)),
    [selectedProofLabels],
  );

  const designs = useMemo(
    () => buildRows({ audience, mainPromise, selectedProofs, batchName, baselineDesign, variantSeed }),
    [audience, mainPromise, selectedProofs, batchName, variantSeed],
  );
  const qaResults = useMemo(() => qaDesigns(designs, baselineDesign, selectedProofs), [designs, selectedProofs]);
  const qaIssues = qaResults.filter((result) => result.issues.length);
  const qaPassed = qaIssues.length === 0 && designs.length === 20;
  const proofCoverage = useMemo(
    () => selectedProofs.map((source) => ({
      client: source.client,
      count: designs.filter((design) => design.Notes.includes(`Proof source: ${source.client}.`)).length,
    })),
    [designs, selectedProofs],
  );

  function toggleProof(label: string) {
    setSelectedProofLabels((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  function generateProofPreviews() {
    setVariantSeed((current) => current + 1);
    if (qaPassed) {
      setStatus(`Regenerated ${designs.length} checked proof previews from ${baselineDesign}`);
    } else {
      setStatus(`Regenerated with auto-fit copy. ${qaIssues.length} check${qaIssues.length === 1 ? "" : "s"} still need review.`);
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
                <span><b>{proofSourceTitle(source)}</b>{proofSourceDisplayText(source)}</span>
              </label>
            ))}
          </div>
          <span className="hint">Every generated ad is a proof ad and uses exactly one selected proof source. Keep only the transcripts or Conversion screenshots you want in this batch.</span>

          <div className="proof-treatment-grid">
            {proofTreatments.map((item) => (
              <div className="treatment-card" key={item.title}>
                <b>{item.title}</b>
                <span>{item.bestFor}</span>
                <p>{item.rule}</p>
              </div>
            ))}
          </div>

          <div className="baseline-card">
            <span>Baseline design</span>
            <b>{baselineDesign}</b>
            <p>Use this as the structure reference only. The generated ads are proof-first and do not depend on image assets.</p>
          </div>

          <div className="source-card">
            <b>Manual proof database</b>
            <p>Use Drive as the parking spot for approved inputs, then manually extract usable proof into the checked proof database. No live Drive auto-ingestion for now.</p>
            <ul>
              {allowedDriveFolders.map((folder) => (
                <li key={folder.url}><a href={folder.url} target="_blank" rel="noreferrer">{folder.label}</a></li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="design-panel">
          <div className="section-heading light"><span>02</span><h2>Proof preview set</h2><small>{designs.length} designs</small></div>
          <div className={qaPassed ? "qa-card pass" : "qa-card check"}>
            <div>
              <b>{qaPassed ? "QA passed" : "Needs design check"}</b>
              <span>{qaPassed ? "20 / 20 designs have source, fitted copy, CTA, disclaimer and visual direction." : `${qaIssues.length} design${qaIssues.length === 1 ? "" : "s"} could not be auto-fitted. Regenerate or remove the longest proof source.`}</span>
            </div>
            <small>{qaPassed ? "Approved for Canva polish" : "Draft only"}</small>
          </div>
          {qaIssues.length > 0 && (
            <div className="qa-issues">
              {qaIssues.slice(0, 6).map((result) => (
                <p key={result.adId}><b>{result.adId}</b> {result.issues.join("; ")}</p>
              ))}
            </div>
          )}
          <div className="batch-summary">
            <div><b>{designs.length}</b><span>Proof / Result Ads</span></div>
            <div><b>{selectedProofs.length}</b><span>Proof Sources In Rotation</span></div>
            <div><b>{designs.filter((design) => design["Proof Treatment"] === "Screenshot proof").length}</b><span>Screenshot Proof Slots</span></div>
          </div>
          <div className="actions-bar">
            <button className="generate" onClick={generateProofPreviews}>Generate proof previews <span>→</span></button>
            <a className="secondary-action link-action" href={editableCanvaDesignUrl} target="_blank" rel="noreferrer">Open editable Canva design</a>
            <span>{status}</span>
          </div>
          <div className="asset-coverage proof-coverage">
            {proofCoverage.map((item) => (
              <span key={item.client}><b>{item.count}</b> {item.client}</span>
            ))}
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
                <p>{design["Visual Direction"]}</p>
                <small className="asset-used">Asset: {design["Asset Used"]}</small>
                <span className={qaResults[index].status === "Pass" ? "design-qa pass" : "design-qa check"}>
                  {qaResults[index].status === "Pass" ? "QA pass" : "Needs check"}
                </span>
              </article>
            );})}
          </div>
        </section>
      </section>

      <footer><span>RADICAL EDGE</span><p>{radicalEdgeVoice}</p></footer>
    </main>
  );
}
