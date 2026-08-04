"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type AngleType = "Proof / Result";
type ProofSource = {
  label: string;
  client: string;
  proof: string;
  status: string;
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
  "Middle Text": string;
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
const canvaDesignUrl = process.env.NEXT_PUBLIC_CANVA_DESIGN_URL ?? "https://www.canva.com/d/N79ctvwCqtZze9Z";
const audiences = ["Founders", "Coaches / consultants", "Financial advisers", "Real estate agents", "Educators / experts", "Service providers"];

const allowedDriveFolders = proofDatabase.allowedDriveFolders;
const conversionOptions = proofDatabase.conversionFiles.map((file) => `${file.title} (${file.type})`);
const testimonialSources: ProofSource[] = proofDatabase.clients
  .filter((client) => client.name !== "Custom proof")
  .map((client) => ({
    label: `${client.name}: ${client.proofSummary}`,
    client: client.name,
    proof: client.proofSummary,
    status: client.status,
  }));
const baselineAsset = proofDatabase.assetFiles.find((file) => file.type === "design sample");
const baselineDesign = baselineAsset ? `${baselineAsset.title} (${baselineAsset.type})` : "Sample 1 (design sample)";
const proofSourceOptions = [
  ...testimonialSources.map((source) => `Transcript: ${source.label}`),
  ...conversionOptions.map((proof) => `Conversion: ${proof}`),
];
const proofLayouts = ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"];

function buildSampleHeadline(design: AdRow) {
  const proofText = proofSnippet(design["Middle Text"]);
  const hasRevenue = /\$|closed|revenue/i.test(proofText);
  const hasViews = /views|followers/i.test(proofText);
  const hasTrust = /chosen|trust|recognition|enquir/i.test(proofText);
  return {
    highlight: hasRevenue ? "$10K+ CLOSED" : hasViews ? "1M+ VIEWS" : hasTrust ? "CHOSEN FIRST" : "RESULTS LIKE THIS",
    lineOne: hasRevenue ? "from organic demand" : hasViews ? "from authority content" : hasTrust ? "before the sales call" : "come from authority",
    lineTwo: "not cold chasing",
  };
}

function proofSnippet(proof: string) {
  return proof
    .replace(/^Transcript:\s*/i, "")
    .replace(/^Conversion:\s*/i, "")
    .replace(/^[A-Za-z][A-Za-z\s]+:\s*/, "")
    .replace(/\s*Verify exact wording.*$/i, "")
    .slice(0, 118);
}

function buildProofLines(design: AdRow) {
  return [
    `${design["Proof Client"]} proof`,
    proofSnippet(design["Middle Text"]) || "Proof from testimonial transcript",
    "The system behind this is taught in the masterclass",
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
}: {
  audience: string;
  mainPromise: string;
  batchName: string;
  selectedProofs: ProofSource[];
  baselineDesign: string;
}): AdRow[] {
  return Array.from({ length: 20 }, (_, index) => {
    const proofSource = selectedProofs[index % selectedProofs.length] ?? testimonialSources[0];
    const layout = proofLayouts[index % proofLayouts.length];
    const id = `RE-${String(index + 1).padStart(2, "0")}`;
    const proofText = proofSource?.proof ?? "Select a testimonial proof source.";
    const hook = `${proofSource?.client ?? "Client"} proof ad`;
    const subhook = `Build a personal brand that attracts high-ticket clients without outsourcing your voice.`;
    const cta = "Join the masterclass";
    const topText = hook;
    const middleText = `Transcript: ${proofSource?.client ?? "Unassigned"}: ${proofText}`;
    const bottomText = `${cta}. Results vary.`;
    const baselineInstruction = `Use ${baselineDesign} as the structure reference: large headline, strong proof middle, clear interpretation, Radical Edge footer and CTA band.`;
    const visualDirection = `${baselineInstruction} Use ${proofSource?.client ?? "the selected testimonial"} proof as the main evidence. Do not use client or founder photos in this Canva draft.`;
    const assetNeeded = `${baselineDesign} structure reference plus approved pull-quote/number from testimonial transcripts. No image asset required.`;

    return {
      "Ad ID": id,
      "Campaign Name": `Masterclass - ${audience}`,
      "Batch Name": batchName,
      "Target Audience": audience,
      "Angle Type": "Proof / Result",
      "Proof Client": proofSource?.client ?? "Unassigned",
      "Baseline Design": baselineDesign,
      "Pain / Desire": proofText,
      "Core Message": mainPromise,
      Hook: hook,
      Subhook: subhook,
      "Proof / Evidence": middleText,
      CTA: cta,
      "Visual Direction": visualDirection,
      "Asset Needed": assetNeeded,
      "Asset Used": "No image asset",
      "Canva Layout Type": layout,
      "Top Text": topText,
      "Middle Text": middleText,
      "Bottom Text": bottomText,
      "Meta Primary Text": `${hook}\n\n${subhook}\n\n${mainPromise}\n\n${cta}. Example only. Results vary.`,
      "Meta Headline": hook.length > 52 ? hook.slice(0, 49).trimEnd() + "..." : hook,
      "Meta Description": `${offer} for ${audience}.`,
      Hypothesis: `If ${audience.toLowerCase()} trust ${proofSource?.client ?? "this testimonial"} proof, then this creative should improve qualified attention for the masterclass.`,
      Status: proofSource?.status.includes("pending") ? "Verify proof" : "Ready for Canva",
      Notes: `Canva page direction. Layout: ${layout}. Testimonial: ${proofSource?.client ?? "Unassigned"}.`,
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
    if (middleText.length > 260) issues.push("Middle proof may need trimming in Canva");
    if (design["Angle Type"] === "Proof / Result" && !/Transcript|Conversion/i.test(proofText)) {
      issues.push("Proof ad must cite testimonial transcript or Conversion source");
    }
    if (selectedProofs.length === 0) {
      issues.push("Select at least one testimonial for proof ads");
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
  const [selectedProofLabels, setSelectedProofLabels] = useState<string[]>(testimonialSources.map((source) => source.label));
  const [batchName, setBatchName] = useState("Masterclass Batch 01");
  const [status, setStatus] = useState("Ready to generate from the Sample 1 baseline");
  const [syncedProofs, setSyncedProofs] = useState<string[]>(testimonialSources.map((source) => source.proof));
  const [syncStatus, setSyncStatus] = useState("Not synced this session");
  const selectedProofs = useMemo(
    () => testimonialSources.filter((source) => selectedProofLabels.includes(source.label)),
    [selectedProofLabels],
  );

  const designs = useMemo(
    () => buildRows({ audience, mainPromise, selectedProofs, batchName, baselineDesign }),
    [audience, mainPromise, selectedProofs, batchName],
  );
  const proofDropdownOptions = useMemo(() => {
    const syncedOptions = syncedProofs.map((proof) => `Transcript: ${proof}`);
    return Array.from(new Set([...proofSourceOptions, ...syncedOptions]));
  }, [syncedProofs]);
  const qaResults = useMemo(() => qaDesigns(designs, baselineDesign, selectedProofs), [designs, selectedProofs]);
  const qaIssues = qaResults.filter((result) => result.issues.length);
  const qaPassed = qaIssues.length === 0 && designs.length === 20;
  const proofCoverage = useMemo(
    () => selectedProofs.map((source) => ({
      client: source.client,
      count: designs.filter((design) => design["Proof Client"] === source.client).length,
    })),
    [designs, selectedProofs],
  );

  function toggleProof(label: string) {
    setSelectedProofLabels((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  function generateCanvaDesign() {
    if (qaPassed) {
      setStatus(`Generated ${designs.length} checked design directions from ${baselineDesign}`);
    } else {
      setStatus(`Generated draft set with ${qaIssues.length} checks to fix before Canva polish`);
    }
    window.open(canvaDesignUrl, "_blank", "noopener,noreferrer");
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard?.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    }
  }

  async function copyCanvaBriefs() {
    const brief = designs.map((design) => [
      `${design["Ad ID"]} - ${design["Canva Layout Type"]}`,
      `Angle: ${design["Angle Type"]}`,
      `Top: ${design["Top Text"]}`,
      `Middle: ${design["Middle Text"]}`,
      `Bottom: ${design["Bottom Text"]}`,
      `Visual: ${design["Visual Direction"]}`,
      `Asset: ${design["Asset Needed"]}`,
      `Asset used: ${design["Asset Used"]}`,
      `CTA: ${design.CTA}`,
    ].join("\n")).join("\n\n---\n\n");
    const copied = await copyText(brief);
    setStatus(copied ? "20 design briefs copied for Canva" : "Copy failed; select the briefs manually");
  }

  async function syncTranscripts() {
    setSyncStatus("Syncing Drive transcripts...");
    try {
      let synced: string[] = [];
      const localResponse = await fetch("/api/sync-transcripts/").catch(() => undefined);
      if (localResponse?.ok) {
        const data = await localResponse.json();
        synced = data.summaries ?? [];
        if (data.mode === "local-proof-library") {
          setSyncedProofs([]);
          setSyncStatus(`Loaded ${synced.length} saved proof sources; live Drive auth is not configured`);
        } else {
          setSyncedProofs(synced);
          setSyncStatus(`Synced ${synced.length} transcript files from Drive`);
        }
      } else {
        const errorData = localResponse ? await localResponse.json().catch(() => undefined) : undefined;
        throw new Error(errorData?.error ?? "Local transcript sync route is unavailable");
      }
    } catch (error) {
      setSyncStatus(`Drive sync failed: ${error instanceof Error ? error.message : "unknown error"}`);
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

          <label>Testimonials to use</label>
          <div className="testimonial-checklist">
            {testimonialSources.map((source) => (
              <label className="check-row proof-row" key={source.label}>
                <input type="checkbox" checked={selectedProofLabels.includes(source.label)} onChange={() => toggleProof(source.label)} />
                <span><b>{source.client}</b>{source.proof}</span>
              </label>
            ))}
          </div>
          <span className="hint">Every generated ad is a proof ad and uses exactly one selected testimonial. Keep only the testimonials you want in this batch.</span>

          <div className="sync-card">
            <button className="secondary-form-action" onClick={syncTranscripts}>Sync testimonial transcripts from Drive</button>
            <span>{syncStatus}</span>
            <select value="" onChange={(event) => event.target.value && setStatus(`Selected proof reference: ${event.target.value.slice(0, 90)}`)}>
              <option value="">Use proof source...</option>
              {proofDropdownOptions.map((proof) => <option key={proof} value={proof}>{proof}</option>)}
            </select>
          </div>

          <div className="baseline-card">
            <span>Baseline design</span>
            <b>{baselineDesign}</b>
            <p>Use this as the structure reference only. The generated ads are proof-first and do not depend on image assets.</p>
          </div>

          <div className="source-card">
            <b>Allowed Drive sources</b>
            <p>The generator should only reference approved material from these folders.</p>
            <ul>
              {allowedDriveFolders.map((folder) => (
                <li key={folder.url}><a href={folder.url} target="_blank" rel="noreferrer">{folder.label}</a></li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="design-panel">
          <div className="section-heading light"><span>02</span><h2>Canva design set</h2><small>{designs.length} designs</small></div>
          <div className={qaPassed ? "qa-card pass" : "qa-card check"}>
            <div>
              <b>{qaPassed ? "QA passed" : "Needs design check"}</b>
              <span>{qaPassed ? "20 / 20 designs have source, copy, CTA, disclaimer and visual direction." : `${qaIssues.length} design${qaIssues.length === 1 ? "" : "s"} need review before approval.`}</span>
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
            <div><b>{selectedProofs.length}</b><span>Testimonials In Rotation</span></div>
            <div><b>0</b><span>Image Assets Required</span></div>
          </div>
          <div className="actions-bar">
            <button className="generate" onClick={generateCanvaDesign}>Generate Canva design <span>→</span></button>
            <a className="secondary-action link-action" href={canvaDesignUrl} target="_blank" rel="noreferrer">Open Canva design</a>
            <button className="secondary-action" onClick={copyCanvaBriefs}>Copy 20 design briefs</button>
            <span>{status}</span>
          </div>
          <div className="asset-coverage proof-coverage">
            {proofCoverage.map((item) => (
              <span key={item.client}><b>{item.count}</b> {item.client}</span>
            ))}
          </div>

          <div className="design-grid">
            {designs.map((design, index) => {
              const headline = buildSampleHeadline(design);
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
                    <span>{headline.highlight}</span>
                    {headline.lineOne}
                    <em>{headline.lineTwo}</em>
                  </h3>
                  <div className="proof-slot">
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
