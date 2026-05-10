module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const problem = req.body && req.body.problem;
  if (!problem) {
    return res.status(400).json({ error: "No problem provided" });
  }

  const payload = {
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: "You are Tough Love Jesus. You quote real Bible verses and give direct, slightly snarky but loving advice. Keep it to 3-4 sentences plus one action item.",
    messages: [{ role: "user", content: problem }]
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();

  if (!response.ok) {
    return res.status(500).json({ error: raw });
  }

  const data = JSON.parse(raw);
  const text = data.content[0].text;
  return res.status(200).json({ response: text });
};
