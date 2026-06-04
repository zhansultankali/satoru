export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  
  const { messages } = req.body
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Sen AI komekshi botsyng. Qazaqsha, oryssha, agylshynsha soileshe alasyn. Paidalanushy qai tilde jazsa, sol tilde zhaup ber.' },
        ...messages
      ],
      max_tokens: 1000
    })
  })
  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content || 'Qate boldy.'
  res.status(200).json({ content: [{ text: reply }] })
}
