"use client";

import { useMemo, useState } from "react";

type ProofType = "WhatsApp" | "Testimonial" | "Analytics" | "Revenue" | "Call notes" | "Case study";

const proofTypes: ProofType[] = ["WhatsApp", "Testimonial", "Analytics", "Revenue", "Call notes", "Case study"];

const proofFrames: Record<ProofType, { angle: string; headline: string; support: string; asset: string; interpretation: string }> = {
  WhatsApp: {
    angle: "The inbound message that proves authority compounds",
    headline: "“I’ve been following your content for months.”",
    support: "The best sales conversations often start before the first call.",
    asset: "A blurred WhatsApp screenshot showing an unsolicited inbound enquiry, with names and sensitive details removed.",
    interpretation: "This is what happens when your ideas do the pre-selling.",
  },
  Testimonial: {
    angle: "A client’s words become the credibility layer",
    headline: "The content finally sounded like them — and clients noticed.",
    support: "Authority grows when the market can recognise your thinking.",
    asset: "A concise testimonial with one specific change, outcome or moment of recognition; anonymise if required.",
    interpretation: "Not louder content. A sharper point of view.",
  },
  Analytics: {
    angle: "Visible demand, interpreted beyond vanity metrics",
    headline: "One idea. 42,800 views. The right people paying attention.",
    support: "Reach matters when it creates recognition with your actual buyers.",
    asset: "An analytics screenshot showing reach, saves, profile visits or qualified response. Highlight the relevant metric only.",
    interpretation: "The signal isn’t the view count. It’s who leans in next.",
  },
  Revenue: {
    angle: "Commercial proof without turning it into a promise",
    headline: "A $24K client — traced back to one piece of content.",
    support: "Proof that a clear point of view can create serious commercial conversations.",
    asset: "A redacted payment, CRM or call-note screenshot that credibly connects content to a sale. Add timeframe and context.",
    interpretation: "See the system behind results like this.",
  },
  "Call notes": {
    angle: "The sales call reveals that the content already did the work",
    headline: "“I already knew you were the person to speak to.”",
    support: "A strong body of content compresses trust before the call begins.",
    asset: "A redacted discovery-call note with the prospect’s exact buying-language and source attribution.",
    interpretation: "Your content should make the first half of the sales call unnecessary.",
  },
  "Case study": {
    angle: "A short before-and-after story with a clear mechanism",
    headline: "From inconsistent posting to qualified inbound conversations.",
    support: "The shift came from a repeatable authority system — not more content for content’s sake.",
    asset: "An anonymised case-study snippet with starting point, intervention, observable result and timeframe.",
    interpretation: "Learn how this happened — and what made the difference.",
  },
};

function copyText(text: string) {
  navigator.clipboard?.writeText(text);
}

export default function Home() {
  const [proofType, setProofType] = useState<ProofType>("WhatsApp");
  const [audience, setAudience] = useState("Founders & experts");
  const [proofDetail, setProofDetail] = useState("An inbound lead said they had followed the content for months before reaching out.");
  const [tone, setTone] = useState("Sharp & direct");
  const [generated, setGenerated] = useState(1);

  const concept = useMemo(() => {
    const frame = proofFrames[proofType];
    const cta = "Join the 1-day Radical Edge masterclass";
    const caption = `${proofDetail}\n\nThat’s the difference between posting for visibility and building authority that creates demand.\n\nAt the 1-day Radical Edge masterclass, we’ll break down the system behind results like this — so your content sounds like you, sharpens your market position and turns attention into qualified conversations.\n\nFor ${audience.toLowerCase()} in Singapore. Results vary; this is an example, not a promise of identical outcomes.\n\n${cta}.`;
    return {
      ...frame,
      cta,
      caption,
      variants: [
        frame.headline,
        proofType === "WhatsApp" ? "The enquiry arrived already convinced." : `What ${proofType.toLowerCase()} proof looks like when authority is working.`,
        "Your content should create conversations like this.",
      ],
      ctas: [cta, "See the system behind this", "Build authority that creates inbound demand"],
    };
  }, [proofType, audience, proofDetail, generated]);

  const fullOutput = `AD ANGLE\n${concept.angle}\n\nMAIN HEADLINE\n${concept.headline}\n\nSUPPORTING LINE\n${concept.support}\n\nCTA\n${concept.cta}\n\nVISUAL LAYOUT\nTop 20%: proof headline. Middle 55%: ${proofType} evidence. Bottom 25%: interpretation and CTA. 1080×1350, generous margins, high contrast.\n\nPROOF ASSET NEEDED\n${concept.asset}\n\nCAPTION\n${concept.caption}\n\nHEADLINE VARIANTS\n${concept.variants.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nCTA VARIANTS\n${concept.ctas.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nWHY IT SHOULD WORK\nIt opens with credible evidence, gives the proof visual dominance, interprets the result without promising identical outcomes, and invites a Singapore-based expert audience to learn the underlying system.`;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Radical Edge home">
          <span className="brand-mark">R/</span>
          <span>RADICAL EDGE</span>
        </a>
        <span className="product-label">STATIC ADS CREATOR</span>
      </header>

      <section className="hero" id="top">
        <div>
          <span className="eyebrow">PROOF, MADE IMPOSSIBLE TO IGNORE.</span>
          <h1>Turn real proof into<br /><em>high-converting ads.</em></h1>
        </div>
        <p>Generate premium, direct Meta ad concepts for the 1-day Radical Edge masterclass. Built for 1080×1350. Ready for Canva.</p>
      </section>

      <section className="studio">
        <aside className="brief-panel">
          <div className="section-heading"><span>01</span><h2>Build the brief</h2></div>

          <label>Proof type</label>
          <div className="proof-grid">
            {proofTypes.map((item) => (
              <button className={proofType === item ? "active" : ""} onClick={() => setProofType(item)} key={item}>{item}</button>
            ))}
          </div>

          <label htmlFor="audience">Audience</label>
          <select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option>Founders & experts</option><option>Coaches & educators</option><option>Advisers & agents</option><option>All authority-led businesses</option>
          </select>

          <label htmlFor="proof">What does the proof show?</label>
          <textarea id="proof" rows={5} value={proofDetail} onChange={(e) => setProofDetail(e.target.value)} />
          <span className="hint">Use specifics. Remove names or sensitive details.</span>

          <label htmlFor="tone">Tone</label>
          <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Sharp & direct</option><option>Premium & measured</option><option>Provocative & credible</option>
          </select>

          <button className="generate" onClick={() => setGenerated((n) => n + 1)}>Generate proof ad <span>↗</span></button>
          <p className="guardrail">No identical-result promises. No client photos unless provided.</p>
        </aside>

        <div className="canvas-panel">
          <div className="section-heading light"><span>02</span><h2>Canva-ready preview</h2><small>1080 × 1350</small></div>
          <div className="ad-shell">
            <div className="ad-card">
              <div className="ad-top">
                <span className="ad-kicker">REAL PROOF / {proofType.toUpperCase()}</span>
                <h3>{concept.headline}</h3>
              </div>
              <div className="proof-window">
                <div className="proof-chrome"><i></i><i></i><i></i><span>PROOF ASSET</span></div>
                <div className="blur-line wide"></div><div className="blur-line"></div><div className="blur-line short"></div>
                <p>{proofDetail}</p>
                <div className="redaction"></div>
              </div>
              <div className="ad-bottom">
                <p>{concept.interpretation}</p>
                <div><strong>RADICAL EDGE</strong><span>{concept.cta} →</span></div>
                <small>Example only. Results vary.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="output-section">
        <div className="output-head">
          <div className="section-heading"><span>03</span><h2>Your complete concept</h2></div>
          <button className="copy-all" onClick={() => copyText(fullOutput)}>Copy full concept</button>
        </div>
        <div className="output-grid">
          <article><b>Ad angle</b><p>{concept.angle}</p></article>
          <article><b>Main headline</b><p>{concept.headline}</p></article>
          <article><b>Supporting line</b><p>{concept.support}</p></article>
          <article><b>CTA line</b><p>{concept.cta}</p></article>
          <article><b>Visual layout</b><p>Top 20%: proof headline. Middle 55%: evidence. Bottom 25%: interpretation + CTA.</p></article>
          <article><b>Proof asset needed</b><p>{concept.asset}</p></article>
          <article className="wide"><b>Caption copy</b><p className="caption">{concept.caption}</p><button onClick={() => copyText(concept.caption)}>Copy caption</button></article>
          <article><b>3 headline variants</b><ol>{concept.variants.map((v) => <li key={v}>{v}</li>)}</ol></article>
          <article><b>3 CTA variants</b><ol>{concept.ctas.map((v) => <li key={v}>{v}</li>)}</ol></article>
          <article className="wide rationale"><b>Why this should work</b><p>It opens with credible evidence, gives the proof visual dominance, interprets the result without promising identical outcomes, and invites a Singapore-based expert audience to learn the underlying system.</p></article>
        </div>
      </section>

      <footer><span>RADICAL EDGE</span><p>Make your expertise the obvious choice.</p></footer>
    </main>
  );
}
