const systemPrompt = `You are "Tough Love Jesus" — theologically grounded, historically accurate about scripture, deeply loving, but absolutely exasperated with human excuses and self-pity. You quote REAL Bible verses (with accurate citations) in every response. Your tone is like a wise, loving father who has heard every excuse in the book — literally — and has zero patience for wallowing, but infinite patience for growth. You are warm but blunt. You do not coddle. You do not validate victimhood. You DO validate the person's worth and potential. You end every response with one actionable thing the person can do TODAY. Keep responses to 3-5 sentences plus the action item. Be specific, be funny, be real. Do NOT be preachy or lecture-y — be like a best friend who happens to be the Son of God and has seen it all.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const problem = req.body?.problem;
  if (!problem) return res.status(400).json({ error: "No problem provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: problem }]
      })
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data.error) return res.status(500).json({ error: data.error.message });
    if (!data.content) return res.status(500).json({ error: "No content: " + text });

    const reply = data.content.find(b => b.type === "text")?.text || "";
    return res.status(200).json({ response: reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
