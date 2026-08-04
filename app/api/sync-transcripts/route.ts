import proofDatabase from "../../../content/proof-library.json";

export const dynamic = "force-static";

function transcriptUrl(fileId: string) {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

function summarizeTranscript(client: string, title: string, content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  const signals = [
    compact.match(/(?:hundred|100)\s*x\s*views/i)?.[0],
    compact.match(/highest ever month in sales[^.]{0,70}/i)?.[0],
    compact.match(/\$?\d+[kK]\+?[^.]{0,80}/)?.[0],
    compact.match(/\d+\s*(?:million|m)\s*views[^.]{0,70}/i)?.[0],
  ].filter(Boolean);
  const signal = signals[0] ?? compact.slice(0, 160);
  return `${client} (${title}): ${signal}. Verify exact wording, context and attribution before publishing.`;
}

export async function GET() {
  const bearerToken = process.env.GOOGLE_DRIVE_BEARER_TOKEN;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!bearerToken && !apiKey) {
    return Response.json(
      {
        error: "Google Drive auth is not configured for the website runtime.",
        required: "Set GOOGLE_DRIVE_BEARER_TOKEN for private/shared Drive files, or GOOGLE_DRIVE_API_KEY for public files.",
      },
      { status: 501 },
    );
  }

  const transcripts = await Promise.all(
    proofDatabase.transcriptFiles.map(async (file) => {
      const url = apiKey ? `${transcriptUrl(file.fileId)}&key=${apiKey}` : transcriptUrl(file.fileId);
      const response = await fetch(url, {
        headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
      });
      if (!response.ok) {
        throw new Error(`${file.title} returned ${response.status}`);
      }
      const content = await response.text();
      if (content.includes("<!doctype html") || content.includes("accounts.google.com")) {
        throw new Error(`${file.title} returned a Google sign-in page instead of transcript text`);
      }
      return {
        client: file.client,
        title: file.title,
        fileId: file.fileId,
        content,
        summary: summarizeTranscript(file.client, file.title, content),
      };
    }),
  );

  return Response.json({
    syncedAt: new Date().toISOString(),
    count: transcripts.length,
    transcripts,
    summaries: transcripts.map((item) => item.summary),
  });
}
