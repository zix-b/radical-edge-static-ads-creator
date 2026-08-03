"use client";

import { useMemo, useState } from "react";

type AdFormat = "Result + proof stack" | "Message-first" | "Pull-quote" | "Analytics spotlight" | "Before → after" | "Mini case study";

type AdTemplate = {
  name: AdFormat;
  note: string;
  angle: string;
  headline: string;
  support: string;
  interpretation: string;
  asset: string;
  layout: string;
  variants: string[];
};

const radicalEdgeVoice =
  "Radical Edge turns heart-and-hunger agents, educators, founders and experts into irreplaceable, heart-led symbols that inspire respect, loyalty and sales without outsourcing their voice to a soulless agency.";

const adTemplates: AdTemplate[] = [
  {
    name: "Result + proof stack",
    note: "Default · supplied Canva reference",
    angle: "Specific commercial proof, framed as a signal of authority",
    headline: "$10,000 closed in 2 days from organic leads",
    support: "When the market trusts your ideas before the call, sales conversations start warmer.",
    interpretation: "This is what content looks like when it builds recognition, trust and demand.",
    asset: "A WhatsApp message, screenshot or numeric proof asset showing the result. Redact names, phone numbers, private notes and financial details that should not be public.",
    layout: "Top 20%: oversized result headline. Middle 55%: WhatsApp screenshot or numeric proof in the supplied Canva reference style. Bottom 25%: interpretation, 1-day masterclass CTA and result disclaimer.",
    variants: [
      "$10,000 closed in 2 days from organic leads",
      "The lead did not need convincing. The content already did the work.",
      "A warm sales conversation starts before the first call.",
    ],
  },
  {
    name: "Message-first",
    note: "Evidence dominates the frame",
    angle: "Inbound demand shown through the actual message",
    headline: "“I’ve been following your content for months.”",
    support: "The strongest proof is often the way prospects describe why they came in already convinced.",
    interpretation: "Your content should make your expertise feel familiar before someone enquires.",
    asset: "A large WhatsApp, DM or email screenshot showing inbound buying language. Keep the message readable, but redact all private identity details.",
    layout: "Top 18%: short recognition or inbound headline. Middle 62%: one large message screenshot. Bottom 20%: what the message proves and the masterclass CTA.",
    variants: [
      "The enquiry arrived already convinced.",
      "This is what pre-sold attention sounds like.",
      "Your next lead should already know why you matter.",
    ],
  },
  {
    name: "Pull-quote",
    note: "Exact words create credibility",
    angle: "A client or prospect quote proves the positioning landed",
    headline: "“I already knew you were the person to speak to.”",
    support: "Authority is not just reach. It is being recognised as the obvious choice by the right people.",
    interpretation: "The goal is not louder content. It is becoming unmistakably you in the market.",
    asset: "An approved quote from a WhatsApp message, transcript or testimonial screenshot. Use first name only or anonymise unless attribution is approved.",
    layout: "Top 35%: exact quote in large type. Middle 40%: supporting screenshot, transcript excerpt or numeric context. Bottom 25%: mechanism, CTA and result disclaimer.",
    variants: [
      "“I already knew you were the person to speak to.”",
      "The right content makes you easier to choose.",
      "Recognition is when the sale starts before the call.",
    ],
  },
  {
    name: "Analytics spotlight",
    note: "One meaningful number",
    angle: "A metric becomes proof only when tied to commercial demand",
    headline: "1M views from 9 videos is not the whole story",
    support: "The useful question is whether the right people started trusting, remembering and enquiring.",
    interpretation: "Reach matters when it turns your expertise into a recognisable buying signal.",
    asset: "A cropped analytics screenshot or numeric result. Highlight one number only: views, reach, saves, profile visits, replies, leads or sales attribution.",
    layout: "Top 22%: one metric plus business relevance. Middle 53%: tightly cropped analytics proof. Bottom 25%: why the metric mattered and the masterclass CTA.",
    variants: [
      "1M views from 9 videos is not the whole story",
      "Views only matter when buyers start paying attention.",
      "The metric is reach. The win is recognition.",
    ],
  },
  {
    name: "Before → after",
    note: "Transformation sequence",
    angle: "A clear shift from invisible expert to recognised authority",
    headline: "From posting to be seen to being remembered by buyers",
    support: "Most experts do not need more content. They need a sharper identity, clearer proof and a system that turns attention into demand.",
    interpretation: "Radical Edge builds the content engine around the person, not around generic agency templates.",
    asset: "Before-and-after numbers, screenshots or message proof. Include timeframe only when it is known and approved.",
    layout: "Top 18%: transformation headline. Middle 57%: before, shift and after sequence with evidence. Bottom 25%: system change, CTA and disclaimer.",
    variants: [
      "From invisible expert to recognisable authority.",
      "The shift was not more posting. It was sharper positioning.",
      "When your edge becomes clear, the right people remember you.",
    ],
  },
  {
    name: "Mini case study",
    note: "Context + mechanism",
    angle: "A compact proof story with enough context to stay credible",
    headline: "How content turned attention into qualified conversations",
    support: "The result matters. The mechanism matters more: positioning, proof, repeated ideas and conversion paths.",
    interpretation: "See the system behind results like this in the 1-day Radical Edge masterclass.",
    asset: "A screenshot or numeric proof asset supported by starting point, intervention, result and context. Do not infer claims from filenames.",
    layout: "Top 20%: client category and observable result. Middle 55%: starting point, intervention, outcome and proof snippet. Bottom 25%: how this happened, CTA and disclaimer.",
    variants: [
      "How content turned attention into qualified conversations",
      "The result is visible. The system is what made it repeatable.",
      "A clear edge turns proof into demand.",
    ],
  },
];

function copyText(text: string) {
  navigator.clipboard?.writeText(text);
}

export default function Home() {
  const [adFormat, setAdFormat] = useState<AdFormat>("Result + proof stack");
  const [audience, setAudience] = useState("Founders & experts");
  const [proofDetail, setProofDetail] = useState("An inbound lead said they had followed the content for months before reaching out.");

  const concept = useMemo(() => {
    const template = adTemplates.find((item) => item.name === adFormat) ?? adTemplates[0];
    const cta = "Join the 1-day Radical Edge masterclass";
    const caption = `${proofDetail}\n\nThat is the difference between posting for visibility and becoming a recognised authority people already trust.\n\n${radicalEdgeVoice}\n\nAt the 1-day Radical Edge masterclass, we break down the system behind results like this: how to crystallise your point of view, turn proof into demand and convert attention into qualified conversations.\n\nFor ${audience.toLowerCase()} in Singapore. Results vary; this is an example, not a promise of identical outcomes.\n\n${cta}.`;
    return {
      ...template,
      cta,
      caption,
      ctas: [cta, "See the system behind this", "Build authority that creates inbound demand"],
    };
  }, [adFormat, audience, proofDetail]);

  const fullOutput = `AD FORMAT\n${adFormat}\n\nRADICAL EDGE VOICE LAYER\n${radicalEdgeVoice}\n\nAD ANGLE\n${concept.angle}\n\nMAIN HEADLINE\n${concept.headline}\n\nSUPPORTING LINE\n${concept.support}\n\nCTA\n${concept.cta}\n\nVISUAL LAYOUT\n${concept.layout} 1080×1350, generous margins, high contrast.\n\nPROOF ASSET NEEDED\n${concept.asset}\n\nCAPTION\n${concept.caption}\n\nHEADLINE VARIANTS\n${concept.variants.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nCTA VARIANTS\n${concept.ctas.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nWHY IT SHOULD WORK\nIt leads with proof, interprets the evidence through Radical Edge’s heart-led authority positioning, avoids identical-result promises, and invites a Singapore-based expert audience to learn the underlying system.`;

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

          <label>Reusable ad format</label>
          <div className="format-grid">
            {adTemplates.map((format) => (
              <button
                className={adFormat === format.name ? "active" : ""}
                onClick={() => setAdFormat(format.name)}
                key={format.name}
              >
                <strong>{format.name}</strong>
                <span>{format.note}</span>
              </button>
            ))}
          </div>

          <label htmlFor="audience">Audience</label>
          <select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option>Founders & experts</option><option>Coaches & educators</option><option>Advisers & agents</option><option>All authority-led businesses</option>
          </select>

          <label htmlFor="proof">What does the proof show?</label>
          <textarea id="proof" rows={5} value={proofDetail} onChange={(e) => setProofDetail(e.target.value)} />
          <span className="hint">Use WhatsApp messages, screenshots or numbers. Remove names or sensitive details.</span>

          <div className="voice-card">
            <b>Permanent voice layer</b>
            <p>{radicalEdgeVoice}</p>
          </div>

          <button className="generate" onClick={() => copyText(fullOutput)}>Copy selected ad concept <span>↗</span></button>
          <p className="guardrail">No identical-result promises. No client photos unless provided.</p>
        </aside>

        <div className="canvas-panel">
          <div className="section-heading light"><span>02</span><h2>Canva-ready preview</h2><small>1080 × 1350</small></div>
          <div className="ad-shell">
            <div className="ad-card">
              <div className="ad-top">
                <span className="ad-kicker">{adFormat.toUpperCase()} / PROOF AD</span>
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
          <article><b>Visual layout · {adFormat}</b><p>{concept.layout}</p></article>
          <article><b>Proof asset needed</b><p>{concept.asset}</p></article>
          <article className="wide"><b>Radical Edge voice layer</b><p>{radicalEdgeVoice}</p></article>
          <article className="wide"><b>Caption copy</b><p className="caption">{concept.caption}</p><button onClick={() => copyText(concept.caption)}>Copy caption</button></article>
          <article><b>3 headline variants</b><ol>{concept.variants.map((v) => <li key={v}>{v}</li>)}</ol></article>
          <article><b>3 CTA variants</b><ol>{concept.ctas.map((v) => <li key={v}>{v}</li>)}</ol></article>
          <article className="wide rationale"><b>Why this should work</b><p>It leads with proof, interprets the evidence through Radical Edge’s heart-led authority positioning, avoids identical-result promises, and invites a Singapore-based expert audience to learn the underlying system.</p></article>
        </div>
      </section>

      <footer><span>RADICAL EDGE</span><p>Make your expertise the obvious choice.</p></footer>
    </main>
  );
}
