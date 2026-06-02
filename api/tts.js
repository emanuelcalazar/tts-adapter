import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { input, voice, model, instructions } = req.body || {};
    if (!input) {
      return res.status(400).json({ error: "Campo input e obrigatorio." });
    }
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini-tts",
        voice: voice || "alloy",
        input: input,
        instructions: instructions || undefined,
        response_format: "mp3"
      })
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: errText });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const filename = "fala-" + Date.now() + ".mp3";
    const blob = await put(filename, buf, {
            addRandomSuffix: true,
      contentType: "audio/mpeg"
    });
    return res.status(200).json({
      url: blob.url,
      name: filename,
      mime_type: "audio/mpeg"
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
