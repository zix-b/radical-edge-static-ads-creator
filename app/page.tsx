"use client";

import { useMemo, useState } from "react";
import proofDatabase from "../content/proof-library.json";

type ProofTreatment = "Copy-only proof" | "Screenshot proof" | "Narrative proof";
type ProofSource = {
  label: string;
  client: string;
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

type ProofInventory = {
  id: string;
  client: string;
  role: string;
  sourceType: "Transcript" | "Conversion";
  treatment: ProofTreatment;
  startingProblem: string;
  whatChanged: string;
  concreteWin: string;
  softWin: string;
  whatThisProves: string;
  bestAngles: string[];
  risk: string;
  publicUse: string;
  canvaNotes: string;
  rawProof: string;
  status: string;
};

const radicalEdgeVoice =
  "Proof first. Separate hard claims from interpretation. Build ads only after the proof is clean.";

const offer = "One-day Radical Edge masterclass";
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
const sourceTypes = ["All", "Transcript", "Conversion"];
const hiddenPublicNames = [
  ...proofDatabase.clients.filter((client) => client.name !== "Custom proof").map((client) => client.name),
  "Kev",
  "Kevin",
];

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

  const usable = cleaned || "Use the verified proof source here.";
  if (usable.length <= maxLength) return usable;

  const sliced = usable.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 60 ? lastSpace : maxLength - 1).trimEnd()}...`;
}

function strongestClaim(source: ProofSource) {
  return publicProofCopy(source.publicClaim || source.displayProof || source.proof, 140);
}

function proofText(source: ProofSource) {
  return `${source.proof} ${source.publicClaim ?? ""} ${source.proofMeaning ?? ""} ${source.extractedText ?? ""}`;
}

function clientRole(source: ProofSource) {
  if (source.sourceType === "Conversion") return source.fileType === "analytics PDF" ? "Analytics proof" : "Conversion screenshot";
  return proofDatabase.clients.find((client) => client.name === source.client)?.role ?? "Testimonial";
}

function startingProblem(source: ProofSource) {
  const text = proofText(source);
  if (/views|followers|attention/i.test(text)) return "Had attention signals, but the useful question is whether that attention created trust, enquiries or buying context.";
  if (/\$|closed|revenue|bootcamp/i.test(text)) return "Needed demand to show up before the call, not rely on cold convincing during the sales conversation.";
  if (/competitors|chosen/i.test(text)) return "Prospects were comparing options, so the content had to make the person safer and clearer to choose.";
  if (/enquiry|referral|viewing|lead|call/i.test(text)) return "The sales path depended on whether the buyer had enough context before reaching out.";
  return "The content needed to do more than fill the feed. It had to create a clearer reason to enquire.";
}

function changedState(source: ProofSource) {
  const text = proofText(source);
  if (/views|followers/i.test(text)) return "The content created stronger visibility and gave the audience clearer reasons to pay attention.";
  if (/\$|closed|revenue/i.test(text)) return "The proof points to warmer demand and a sales conversation that did not start from zero.";
  if (/competitors|chosen/i.test(text)) return "The content made the choice easier by building trust before the prospect compared providers.";
  if (/enquiry|referral|viewing|lead|call/i.test(text)) return "The prospect arrived with more context before the direct sales conversation.";
  return "The positioning became easier for prospects to understand and act on.";
}

function softWin(source: ProofSource) {
  const text = proofText(source);
  if (/views|followers/i.test(text)) return "More recognition, clearer recall and a stronger reason for the right people to keep watching.";
  if (/enquiry|referral|viewing|lead/i.test(text)) return "The conversation felt less cold because trust had already started forming.";
  if (/competitors|chosen/i.test(text)) return "The client was not just another option in the market.";
  if (/attractive character|topics|editing/i.test(text)) return "The content became less random and easier to believe in.";
  return "The offer had more context before the sales ask.";
}

function proofAnglesFor(source: ProofSource) {
  const text = proofText(source);
  if (/\$|closed|revenue/i.test(text)) {
    return ["The sale was not cold", "Trust came before payment", "Content did the pre-selling", "The call had less work to do", "Demand showed up before the pitch"];
  }
  if (/views|followers/i.test(text)) {
    return ["Views only matter when they move buyers", "Attention came from sharper content", "The content had a job", "More posting was not the fix", "Recognition came before enquiry"];
  }
  if (/competitors|chosen/i.test(text)) {
    return ["Trust beat the bigger name", "The content made him safer to pick", "Authority changed the comparison", "They knew why him", "The buyer had context before choosing"];
  }
  if (/enquiry|referral|viewing|lead|call/i.test(text)) {
    return ["The lead was already warm", "The enquiry came from trust", "The sales conversation started earlier", "The DM was not random", "The referral had context"];
  }
  return ["The offer became easier to understand", "The brand felt less random", "The proof did the selling", "The buyer came in closer", "Specific content created better conversations"];
}

function publicUseStatus(source: ProofSource) {
  if (/pending|verify|needs|awaiting/i.test(source.status)) return "Not yet. Use as internal proof until wording, timeframe, consent and attribution are checked.";
  if (source.treatment === "Screenshot proof") return "Yes, after blur and final approval.";
  return "Yes, if anonymised and the claim is accurate.";
}

function canvaNotes(source: ProofSource) {
  if (source.treatment === "Screenshot proof") return "Use as screenshot proof. Paste the approved blurred screenshot into the centre frame.";
  if (/pdf/i.test(source.fileType ?? "")) return "Use as analytics proof. Pull one clean metric and avoid showing internal analysis unless approved.";
  return "Use as copy-only proof. Let the testimonial shape the headline and do not paste private transcript text into the ad.";
}

function buildInventory(source: ProofSource): ProofInventory {
  return {
    id: source.label,
    client: proofSourceTitle(source),
    role: clientRole(source),
    sourceType: source.sourceType,
    treatment: source.treatment,
    startingProblem: startingProblem(source),
    whatChanged: changedState(source),
    concreteWin: strongestClaim(source),
    softWin: softWin(source),
    whatThisProves: source.proofMeaning || changedState(source),
    bestAngles: proofAnglesFor(source),
    risk: source.needsBlur || "Verify exact wording, timeframe, consent and attribution before using this in an ad.",
    publicUse: publicUseStatus(source),
    canvaNotes: source.visualUse ? `${canvaNotes(source)} ${source.visualUse}` : canvaNotes(source),
    rawProof: source.extractedText || source.proof,
    status: source.status,
  };
}

export default function Home() {
  const [activeSourceId, setActiveSourceId] = useState(proofSources[0]?.label ?? "");
  const [sourceType, setSourceType] = useState("All");
  const [search, setSearch] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofSourceName, setProofSourceName] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [manualProofText, setManualProofText] = useState("");
  const [extractedProof, setExtractedProof] = useState<ExtractedProof | null>(null);
  const [extractError, setExtractError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const inventory = useMemo(() => proofSources.map(buildInventory), []);
  const filteredInventory = useMemo(
    () => inventory.filter((item) => {
      const matchesType = sourceType === "All" || item.sourceType === sourceType;
      const haystack = `${item.client} ${item.role} ${item.concreteWin} ${item.whatThisProves} ${item.bestAngles.join(" ")}`.toLowerCase();
      return matchesType && haystack.includes(search.toLowerCase());
    }),
    [inventory, search, sourceType],
  );
  const activeInventory = inventory.find((item) => item.id === activeSourceId) ?? filteredInventory[0] ?? inventory[0];
  const sourceCounts = {
    all: inventory.length,
    transcript: inventory.filter((item) => item.sourceType === "Transcript").length,
    conversion: inventory.filter((item) => item.sourceType === "Conversion").length,
  };

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
        <span className="product-label">PROOF INVENTORY</span>
      </header>

      <section className="hero compact" id="top">
        <p>Use this to turn testimonials, screenshots and proof notes into a clean inventory before writing ads.</p>
      </section>

      <section className="batch-studio inventory-studio">
        <aside className="brief-panel">
          <div className="section-heading"><span>01</span><h2>Proof sources</h2></div>

          <div className="fixed-offer">
            <span>Offer</span>
            <b>{offer}</b>
          </div>

          <div className="inventory-stats">
            <div><b>{sourceCounts.all}</b><span>Total sources</span></div>
            <div><b>{sourceCounts.transcript}</b><span>Testimonials</span></div>
            <div><b>{sourceCounts.conversion}</b><span>Conversion proof</span></div>
          </div>

          <label htmlFor="source-type">Source type</label>
          <select id="source-type" value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
            {sourceTypes.map((type) => <option key={type}>{type}</option>)}
          </select>

          <label htmlFor="proof-search">Search proof</label>
          <input
            id="proof-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, result, angle or proof meaning"
          />

          <label>Proof library</label>
          {metadataDoc ? (
            <a className="metadata-link" href={metadataDoc.url} target="_blank" rel="noreferrer">
              Open proof metadata doc
            </a>
          ) : null}
          <div className="proof-source-list">
            {filteredInventory.map((item) => (
              <button
                className={item.id === activeInventory?.id ? "source-card active" : "source-card"}
                key={item.id}
                onClick={() => setActiveSourceId(item.id)}
              >
                <span>{item.sourceType}</span>
                <b>{item.client}</b>
                <small>{item.concreteWin}</small>
              </button>
            ))}
          </div>
          <span className="hint">Select one source to see what it proves, what can be public, and what ad angles it can support.</span>

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
            <span>Build order</span>
            <b>Inventory first. Ads second.</b>
            <p>Use this page to clean the proof before turning it into Canva ads.</p>
          </div>

        </aside>

        <section className="design-panel inventory-panel">
          <div className="section-heading light"><span>02</span><h2>Proof inventory</h2><small>{activeInventory?.sourceType}</small></div>

          {activeInventory ? (
            <article className="inventory-detail">
              <div className="inventory-hero-card">
                <span>{activeInventory.role}</span>
                <h1>{activeInventory.client}</h1>
                <p>{activeInventory.concreteWin}</p>
              </div>

              <div className="inventory-grid">
                <div className="inventory-box">
                  <span>Starting problem</span>
                  <p>{activeInventory.startingProblem}</p>
                </div>
                <div className="inventory-box">
                  <span>What changed</span>
                  <p>{activeInventory.whatChanged}</p>
                </div>
                <div className="inventory-box">
                  <span>Soft win</span>
                  <p>{activeInventory.softWin}</p>
                </div>
                <div className="inventory-box">
                  <span>What this proves</span>
                  <p>{activeInventory.whatThisProves}</p>
                </div>
              </div>

              <div className="angle-board">
                <div className="inventory-box wide">
                  <span>Best ad angles</span>
                  <div className="angle-list">
                    {activeInventory.bestAngles.map((angle) => <b key={angle}>{angle}</b>)}
                  </div>
                </div>
                <div className="inventory-box">
                  <span>Can this be public?</span>
                  <p>{activeInventory.publicUse}</p>
                </div>
                <div className="inventory-box">
                  <span>Risk / verification</span>
                  <p>{activeInventory.risk}</p>
                </div>
                <div className="inventory-box wide">
                  <span>Canva notes</span>
                  <p>{activeInventory.canvaNotes}</p>
                </div>
              </div>

              <details className="raw-proof">
                <summary>Raw proof / source notes</summary>
                <p>{activeInventory.rawProof}</p>
                <small>{activeInventory.status}</small>
              </details>
            </article>
          ) : (
            <div className="empty-state">No proof source selected.</div>
          )}
        </section>
      </section>

      <footer><span>RADICAL EDGE</span><p>{radicalEdgeVoice}</p></footer>
    </main>
  );
}
