"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type AngleType = "Pain / Problem" | "Contrarian Belief" | "Proof / Result" | "Mechanism / Framework" | "Founder POV";
type BatchMode = "Balanced mix" | "Proof-heavy" | "Pain-heavy" | "Contrarian-heavy" | "Mechanism-heavy";
type VisualMode = "Use Assets image" | "Text / proof only";
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
  "Pain / Desire": string;
  "Core Message": string;
  Hook: string;
  Subhook: string;
  "Proof / Evidence": string;
  CTA: string;
  "Visual Direction": string;
  "Asset Needed": string;
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
const proofOptions = proofDatabase.clients.map((client) => client.proofSummary);
const conversionOptions = proofDatabase.conversionFiles.map((file) => `${file.title} (${file.type})`);
const assetOptions = proofDatabase.assetFiles.map((file) => `${file.title} (${file.type})`);
const proofSourceOptions = [
  ...proofOptions.map((proof) => `Transcript: ${proof}`),
  ...conversionOptions.map((proof) => `Conversion: ${proof}`),
];

const anglePlans: Record<BatchMode, AngleType[]> = {
  "Balanced mix": [
  ...Array<AngleType>(5).fill("Pain / Problem"),
  ...Array<AngleType>(5).fill("Contrarian Belief"),
  ...Array<AngleType>(5).fill("Proof / Result"),
  ...Array<AngleType>(3).fill("Mechanism / Framework"),
  ...Array<AngleType>(2).fill("Founder POV"),
  ],
  "Proof-heavy": [
    ...Array<AngleType>(3).fill("Pain / Problem"),
    ...Array<AngleType>(3).fill("Contrarian Belief"),
    ...Array<AngleType>(10).fill("Proof / Result"),
    ...Array<AngleType>(2).fill("Mechanism / Framework"),
    ...Array<AngleType>(2).fill("Founder POV"),
  ],
  "Pain-heavy": [
    ...Array<AngleType>(10).fill("Pain / Problem"),
    ...Array<AngleType>(3).fill("Contrarian Belief"),
    ...Array<AngleType>(3).fill("Proof / Result"),
    ...Array<AngleType>(2).fill("Mechanism / Framework"),
    ...Array<AngleType>(2).fill("Founder POV"),
  ],
  "Contrarian-heavy": [
    ...Array<AngleType>(3).fill("Pain / Problem"),
    ...Array<AngleType>(10).fill("Contrarian Belief"),
    ...Array<AngleType>(3).fill("Proof / Result"),
    ...Array<AngleType>(2).fill("Mechanism / Framework"),
    ...Array<AngleType>(2).fill("Founder POV"),
  ],
  "Mechanism-heavy": [
    ...Array<AngleType>(3).fill("Pain / Problem"),
    ...Array<AngleType>(3).fill("Contrarian Belief"),
    ...Array<AngleType>(4).fill("Proof / Result"),
    ...Array<AngleType>(8).fill("Mechanism / Framework"),
    ...Array<AngleType>(2).fill("Founder POV"),
  ],
};

const layoutByAngle: Record<AngleType, string[]> = {
  "Pain / Problem": ["Problem / Solution", "Checklist", "Big Claim + Small Proof", "Message Screenshot", "Before / After"],
  "Contrarian Belief": ["Myth vs Truth", "Big Claim + Small Proof", "Quote Card", "Problem / Solution", "Founder POV"],
  "Proof / Result": ["Result + Proof Stack", "Message Screenshot", "Quote Card", "Analytics Spotlight", "Before / After"],
  "Mechanism / Framework": ["Framework Diagram", "Checklist", "Problem / Solution"],
  "Founder POV": ["Founder POV", "Quote Card"],
};

const painPrompts = [
  "Your content sounds competent, but forgettable.",
  "You are good at what you do, but the market does not remember you yet.",
  "Posting more will not fix a weak point of view.",
  "Your best prospects still need too much convincing before the call.",
  "You are outsourcing content, but losing the voice that makes people trust you.",
];

const contrarianPrompts = [
  "The goal is not to go viral. The goal is to become the obvious choice.",
  "A content agency cannot manufacture your conviction for you.",
  "More content is not the same as more demand.",
  "A personal brand is not aesthetics. It is repeated trust.",
  "If your content could come from anyone, it will convert like everyone else.",
];

const proofPrompts = [
  "Proof that content can pre-sell before the first call.",
  "Proof that recognition compounds when the message is sharp.",
  "Proof that the right audience can arrive already convinced.",
  "Proof that views matter only when they create commercial conversations.",
  "Proof that authority makes selling feel less like chasing.",
];

const mechanismPrompts = [
  "The Radical Edge system: identity, content, proof, conversion.",
  "Turn attention into demand by giving every post a commercial job.",
  "Build a content engine around the person, not around generic templates.",
];

const founderPrompts = [
  "Kevin’s POV: the market does not need another polished expert. It needs a recognisable one.",
  "Radical Edge exists because soulless content makes strong founders look average.",
];

const promptBank: Record<AngleType, string[]> = {
  "Pain / Problem": painPrompts,
  "Contrarian Belief": contrarianPrompts,
  "Proof / Result": proofPrompts,
  "Mechanism / Framework": mechanismPrompts,
  "Founder POV": founderPrompts,
};

function buildRows({
  audience,
  mainPromise,
  proofAvailable,
  visualMode,
  selectedAsset,
  batchName,
  anglePlan,
}: {
  audience: string;
  mainPromise: string;
  proofAvailable: string;
  visualMode: VisualMode;
  selectedAsset: string;
  batchName: string;
  anglePlan: AngleType[];
}): AdRow[] {
  return anglePlan.map((angleType, index) => {
    const angleIndex = anglePlan.slice(0, index + 1).filter((angle) => angle === angleType).length - 1;
    const prompt = promptBank[angleType][angleIndex] ?? promptBank[angleType][0];
    const layout = layoutByAngle[angleType][angleIndex % layoutByAngle[angleType].length];
    const id = `RE-${String(index + 1).padStart(2, "0")}`;
    const hook =
      angleType === "Proof / Result"
        ? prompt
        : angleType === "Contrarian Belief"
          ? prompt
          : `${audience}: ${prompt}`;
    const subhook = `Build a personal brand that attracts high-ticket clients without outsourcing your voice.`;
    const cta = "Join the masterclass";
    const topText = hook;
    const middleText = angleType === "Proof / Result" ? proofAvailable : visualMode === "Use Assets image" ? selectedAsset : mainPromise;
    const bottomText = `${cta}. Results vary.`;
    const visualDirection =
      angleType === "Proof / Result"
        ? `${visualMode === "Use Assets image" ? `Use ${selectedAsset} from Assets with a redacted Conversion screenshot or transcript pull-quote.` : "Use a redacted Conversion screenshot, transcript pull-quote, or proof number as the middle evidence layer."}`
        : angleType === "Mechanism / Framework"
          ? `${visualMode === "Use Assets image" ? `Use ${selectedAsset} from Assets beside a simple 3-4 step framework.` : "Use a simple 3-4 step framework layout with one strong phrase per step."}`
          : angleType === "Founder POV"
            ? `${visualMode === "Use Assets image" ? `Use ${selectedAsset} from Assets with direct founder POV copy.` : "Use founder-led styling, direct POV headline, and minimal proof support."}`
            : `${visualMode === "Use Assets image" ? `Use ${selectedAsset} from Assets as the visual anchor.` : "Use bold top text, one strong middle statement, and a clean CTA band."}`;
    const assetNeeded =
      visualMode === "Use Assets image"
        ? `${selectedAsset} from Assets, plus proof from testimonial transcripts or Conversion where relevant.`
        : angleType === "Proof / Result"
          ? "Redacted proof screenshot from Conversion or approved pull-quote/number from testimonial transcripts."
          : "No image required; use text-first Canva layout.";

    return {
      "Ad ID": id,
      "Campaign Name": `Masterclass - ${audience}`,
      "Batch Name": batchName,
      "Target Audience": audience,
      "Angle Type": angleType,
      "Pain / Desire": prompt,
      "Core Message": mainPromise,
      Hook: hook,
      Subhook: subhook,
      "Proof / Evidence": angleType === "Proof / Result" ? proofAvailable : "Support with transcript or Conversion proof only if available.",
      CTA: cta,
      "Visual Direction": visualDirection,
      "Asset Needed": assetNeeded,
      "Canva Layout Type": layout,
      "Top Text": topText,
      "Middle Text": middleText,
      "Bottom Text": bottomText,
      "Meta Primary Text": `${hook}\n\n${subhook}\n\n${mainPromise}\n\n${cta}. Example only. Results vary.`,
      "Meta Headline": hook.length > 52 ? hook.slice(0, 49).trimEnd() + "..." : hook,
      "Meta Description": `${offer} for ${audience}.`,
      Hypothesis: `If ${audience.toLowerCase()} resonate with the ${angleType.toLowerCase()} angle, then this creative should improve qualified attention for the masterclass.`,
      Status: angleType === "Proof / Result" ? "Needs proof" : "Ready for Canva",
      Notes: `Canva page direction. Layout: ${layout}.`,
    };
  });
}

function qaDesigns(designs: AdRow[], visualMode: VisualMode): QaResult[] {
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
    if (design["Top Text"].length > 120) issues.push("Top text may be too long for 1080 x 1350");
    if (middleText.length > 260) issues.push("Middle proof may need trimming in Canva");
    if (design["Angle Type"] === "Proof / Result" && !/Transcript|Conversion/i.test(proofText)) {
      issues.push("Proof ad must cite testimonial transcript or Conversion source");
    }
    if (visualMode === "Use Assets image" && !/Assets/i.test(design["Asset Needed"])) {
      issues.push("Image-backed design must use Assets folder");
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
  const [proofAvailable, setProofAvailable] = useState(proofSourceOptions[0] ?? "");
  const [visualMode, setVisualMode] = useState<VisualMode>("Use Assets image");
  const [selectedAsset, setSelectedAsset] = useState(assetOptions[0] ?? "Kevin 1 (founder image)");
  const [batchName, setBatchName] = useState("Masterclass Batch 01");
  const [batchMode, setBatchMode] = useState<BatchMode>("Balanced mix");
  const [status, setStatus] = useState("Connected to a 20-page editable Canva design");
  const [syncedProofs, setSyncedProofs] = useState<string[]>(proofOptions);
  const [syncStatus, setSyncStatus] = useState("Not synced this session");

  const designs = useMemo(
    () => buildRows({ audience, mainPromise, proofAvailable, visualMode, selectedAsset, batchName, anglePlan: anglePlans[batchMode] }),
    [audience, mainPromise, proofAvailable, visualMode, selectedAsset, batchName, batchMode],
  );
  const qaResults = useMemo(() => qaDesigns(designs, visualMode), [designs, visualMode]);
  const qaIssues = qaResults.filter((result) => result.issues.length);
  const qaPassed = qaIssues.length === 0 && designs.length === 20;

  function copyCanvaBriefs() {
    const brief = designs.map((design) => [
      `${design["Ad ID"]} - ${design["Canva Layout Type"]}`,
      `Angle: ${design["Angle Type"]}`,
      `Top: ${design["Top Text"]}`,
      `Middle: ${design["Middle Text"]}`,
      `Bottom: ${design["Bottom Text"]}`,
      `Visual: ${design["Visual Direction"]}`,
      `Asset: ${design["Asset Needed"]}`,
      `CTA: ${design.CTA}`,
    ].join("\n")).join("\n\n---\n\n");
    navigator.clipboard?.writeText(brief);
    setStatus("20 design briefs copied for Canva");
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
          setSyncStatus(`Loaded ${synced.length} saved proof sources; live Drive auth is not configured`);
        } else {
          setSyncStatus(`Synced ${synced.length} transcript files from Drive`);
        }
      } else {
        const errorData = localResponse ? await localResponse.json().catch(() => undefined) : undefined;
        throw new Error(errorData?.error ?? "Local transcript sync route is unavailable");
      }
      setSyncedProofs(synced);
      setProofAvailable(`Transcript: ${synced[0] ?? ""}`);
    } catch (error) {
      setSyncStatus(`Drive sync failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  const counts = designs.reduce<Record<string, number>>((acc, design) => {
    acc[design["Angle Type"]] = (acc[design["Angle Type"]] ?? 0) + 1;
    return acc;
  }, {});

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

          <label>Ad concept focus</label>
          <div className="mode-grid">
            {(Object.keys(anglePlans) as BatchMode[]).map((mode) => (
              <button className={batchMode === mode ? "active" : ""} key={mode} onClick={() => setBatchMode(mode)}>
                {mode}
              </button>
            ))}
          </div>

          <label htmlFor="promise">Main promise</label>
          <textarea id="promise" rows={4} value={mainPromise} onChange={(event) => setMainPromise(event.target.value)} />

          <label htmlFor="proof">Proof source</label>
          <textarea id="proof" rows={5} value={proofAvailable} onChange={(event) => setProofAvailable(event.target.value)} />
          <span className="hint">Generate testimonials from a mix of testimonial transcripts and Conversion proof. Assets are for visuals, with or without an image.</span>

          <div className="sync-card">
            <button className="secondary-form-action" onClick={syncTranscripts}>Sync testimonial transcripts from Drive</button>
            <span>{syncStatus}</span>
            <select value="" onChange={(event) => event.target.value && setProofAvailable(event.target.value)}>
              <option value="">Use proof source...</option>
              {proofSourceOptions.map((proof) => <option key={proof} value={proof}>{proof}</option>)}
              {syncedProofs.map((proof) => <option key={proof} value={`Transcript: ${proof}`}>{`Transcript: ${proof}`}</option>)}
            </select>
          </div>

          <label>Canva visual</label>
          <div className="mode-grid">
            {(["Use Assets image", "Text / proof only"] as VisualMode[]).map((mode) => (
              <button className={visualMode === mode ? "active" : ""} key={mode} onClick={() => setVisualMode(mode)}>
                {mode}
              </button>
            ))}
          </div>

          {visualMode === "Use Assets image" && (
            <>
              <label htmlFor="asset">Asset from Drive</label>
              <select id="asset" value={selectedAsset} onChange={(event) => setSelectedAsset(event.target.value)}>
                {assetOptions.map((asset) => <option key={asset}>{asset}</option>)}
              </select>
              <span className="hint">Use images/design references from the Assets folder inside the Canva design.</span>
            </>
          )}

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
            {Object.entries(counts).map(([label, count]) => (
              <div key={label}><b>{count}</b><span>{label}</span></div>
            ))}
          </div>
          <div className="actions-bar">
            <a className="generate" href={canvaDesignUrl} target="_blank" rel="noreferrer">Open Canva design <span>→</span></a>
            <button className="secondary-action" onClick={copyCanvaBriefs}>Copy 20 design briefs</button>
            <span>{status}</span>
          </div>

          <div className="design-grid">
            {designs.map((design, index) => (
              <article className={`design-card design-${(index % 5) + 1}`} key={design["Ad ID"]}>
                <div className="design-meta">
                  <span>{design["Ad ID"]}</span>
                  <b>{design["Canva Layout Type"]}</b>
                </div>
                <div className="mock-static-ad">
                  <small>{design["Angle Type"]}</small>
                  <h3>{design["Top Text"]}</h3>
                  <div className="proof-slot">
                    <span>{design["Middle Text"]}</span>
                  </div>
                  <p>{design["Bottom Text"]}</p>
                  <strong>RADICAL EDGE</strong>
                </div>
                <p>{design["Visual Direction"]}</p>
                <span className={qaResults[index].status === "Pass" ? "design-qa pass" : "design-qa check"}>
                  {qaResults[index].status === "Pass" ? "QA pass" : "Needs check"}
                </span>
              </article>
            ))}
          </div>
        </section>
      </section>

      <footer><span>RADICAL EDGE</span><p>{radicalEdgeVoice}</p></footer>
    </main>
  );
}
