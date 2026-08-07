import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProofExtraction = {
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
  suggestedTreatment: "Copy-only proof" | "Screenshot proof" | "Narrative proof";
  approvedForAds: false;
};

const maxUploadBytes = 18 * 1024 * 1024;
const allowedFileTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function extractOutputText(response: unknown) {
  if (typeof response !== "object" || response === null) return "";
  const outputText = (response as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") return outputText;

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      if (typeof content !== "object" || content === null) return "";
      const text = (content as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n");
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI did not return JSON.");
    return JSON.parse(match[0]);
  }
}

function normaliseExtraction(value: unknown): ProofExtraction {
  const object = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  const list = (key: string) => Array.isArray(object[key])
    ? (object[key] as unknown[]).filter((item): item is string => typeof item === "string").slice(0, 8)
    : [];

  return {
    proofName: typeof object.proofName === "string" ? object.proofName : "Proof source",
    sourceType: ["Conversion screenshot", "Analytics PDF", "Transcript", "Manual text"].includes(String(object.sourceType))
      ? object.sourceType as ProofExtraction["sourceType"]
      : "Manual text",
    clientName: typeof object.clientName === "string" ? object.clientName : "Unknown / anonymise",
    rawExtractedText: typeof object.rawExtractedText === "string" ? object.rawExtractedText : "",
    privateDetailsFound: list("privateDetailsFound"),
    publicClaim: typeof object.publicClaim === "string" ? object.publicClaim : "",
    proofMeaning: typeof object.proofMeaning === "string" ? object.proofMeaning : "",
    headlineOptions: list("headlineOptions").slice(0, 10),
    riskNotes: list("riskNotes"),
    needsBlur: list("needsBlur"),
    suggestedTreatment: ["Copy-only proof", "Screenshot proof", "Narrative proof"].includes(String(object.suggestedTreatment))
      ? object.suggestedTreatment as ProofExtraction["suggestedTreatment"]
      : "Copy-only proof",
    approvedForAds: false,
  };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return jsonError("OPENAI_API_KEY is missing. Add it to .env.local, then restart the dev server.", 500);
  }

  const formData = await request.formData();
  const sourceName = safeString(formData.get("sourceName")) || "Uploaded proof";
  const notes = safeString(formData.get("notes"));
  const manualText = safeString(formData.get("manualText"));
  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

  if (!file && !manualText) {
    return jsonError("Upload a screenshot/PDF or paste proof text first.");
  }

  const content: Array<Record<string, string>> = [{
    type: "input_text",
    text: [
      "You are reading proof for Radical Edge Meta static ads.",
      "Extract facts only. Do not invent claims. Do not write hype.",
      "Radical Edge helps founders, coaches, consultants, experts, advisers, educators and service providers turn content into client acquisition.",
      "Write like a sharp founder/operator who has spoken to founders whose content gets attention but does not convert.",
      "Use short, punchy, concrete lines. Make the business pain obvious.",
      "Do not sound like a marketer. Do not write motivational copy.",
      "Avoid these words and patterns: unlock, transform, elevate, skyrocket, ultimate, dominate, secrets, game-changing, effortless, guaranteed, proven system, unleash, potential.",
      "Do not use em dashes.",
      "Do not write vague claims like build authority, create demand, get more leads, or attract clients unless the proof specifically supports the exact claim.",
      "Never approve proof automatically. Always return approvedForAds as false.",
      "If the proof is weak, unclear, private, or needs context, say that in riskNotes.",
      "For screenshots, identify what must be blurred before publishing.",
      "For transcripts, use the transcript to shape the headline only. Do not expose private transcript text.",
      "For conversion screenshots, the screenshot can be used as center proof only after manual redaction.",
      "",
      `Source name: ${sourceName}`,
      notes ? `Operator notes: ${notes}` : "",
      manualText ? `Manual text:\n${manualText}` : "",
      "",
      "Return JSON only with this exact shape:",
      JSON.stringify({
        proofName: "short proof name from filename/context",
        sourceType: "Conversion screenshot | Analytics PDF | Transcript | Manual text",
        clientName: "known client name or Unknown / anonymise",
        rawExtractedText: "verbatim OCR/extracted text, redact nothing here because this is internal review",
        privateDetailsFound: ["names", "phone numbers", "profile photos", "sensitive revenue details"],
        publicClaim: "one safe public claim using concrete proof language, no guarantee language",
        proofMeaning: "what this proves in plain business terms, not marketing language",
        headlineOptions: ["3-8 word image headline, plain English", "3-8 word image headline, plain English"],
        riskNotes: ["what needs checking before use"],
        needsBlur: ["what to blur in Canva"],
        suggestedTreatment: "Copy-only proof | Screenshot proof | Narrative proof",
        approvedForAds: false,
      }, null, 2),
    ].filter(Boolean).join("\n"),
  }];

  if (file) {
    if (!allowedFileTypes.has(file.type)) {
      return jsonError("Use PNG, JPG, WEBP, or PDF for proof reading.");
    }
    if (file.size > maxUploadBytes) {
      return jsonError("File is too large. Keep proof uploads under 18MB for this first backend version.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    if (file.type.startsWith("image/")) {
      content.push({
        type: "input_image",
        image_url: `data:${file.type};base64,${base64}`,
        detail: "high",
      });
    } else {
      content.push({
        type: "input_file",
        filename: file.name,
        file_data: base64,
      });
    }
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_PROOF_MODEL || "gpt-5-mini",
      input: [{ role: "user", content }],
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "OpenAI proof extraction failed.";
    return jsonError(message, response.status);
  }

  const outputText = extractOutputText(data);
  if (!outputText) return jsonError("OpenAI returned no readable proof output.", 502);

  try {
    const extraction = normaliseExtraction(parseJsonObject(outputText));
    return NextResponse.json({ extraction, sourceName, fileName: file?.name ?? null });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Could not parse OpenAI proof output.",
      rawOutput: outputText,
    }, { status: 502 });
  }
}
