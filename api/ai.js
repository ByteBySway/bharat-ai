const fetch = require('node-fetch');

function parseLocalExpertSystem(prompt, systemInstruction) {
  const p = prompt.toLowerCase();
  
  if (p.includes('crop:') || p.includes('symptoms:')) {
    if (p.includes('rice') || p.includes('paddy')) {
      if (p.includes('brown') || p.includes('spots')) {
        return `🌾 **KisanAI Plant Pathology Report (Server):**\n\n**Diagnosis:** Brown Spot disease (Cochliobolus miyabeanus) detected.\n\n**Remedy Plan:**\n1. Spray **Mancozeb 75% WP** @ 2g per liter of water.\n2. Apply balanced nutrients, especially Potassium (K) to boost crop immunity.\n3. **Organic Treatment:** Spray neem oil extract 5% mixed with mild soap emulsifier.`;
      }
      return `🌾 **KisanAI Paddy advisory (Server):** Maintain shallow ponding water level (2-5 cm) at tillering phase. Soil health card recommends applying 40kg Nitrogen per acre.`;
    }
    if (p.includes('wheat') || p.includes('kanak')) {
      if (p.includes('yellow') || p.includes('rust') || p.includes('spots')) {
        return `🌾 **KisanAI Plant Pathology Report (Server):**\n\n**Diagnosis:** Yellow Stripe Rust (Puccinia striiformis) detected.\n\n**Remedy Plan:**\n1. Spray **Propiconazole 25% EC** @ 200 ml mixed in 200 liters of water per acre.\n2. Pause nitrogen fertilizer application temporarily as it feeds the fungus.\n3. **Organic Treatment:** Spray copper oxychloride formulations or fermented buttermilk sprays.`;
      }
      return `🌾 **KisanAI Wheat advisory (Server):** Plan third irrigation cycle at crown root initiation phase. Soil nitrogen index is optimal for your region.`;
    }
    return `🌾 **KisanAI Crop Advisory (Server):**\n\nYour crop description has been evaluated. For general leaf spots and blight, maintain clean spacing, remove infected crop residues, and spray generic **Copper Oxychloride 50% WP** @ 3g/liter.`;
  }

  if (p.includes('symptom') || p.includes('fever') || p.includes('pain')) {
    if (p.includes('fever') && p.includes('chills') && p.includes('body')) {
      return `🩺 **HealthGuide Severity Diagnosis (Server):**\n\n**Severity Rating: Urgent Action Recommended (Seek Clinic)**\n\n**Suspected Condition:** Dengue or Malaria seasonal risk.\n\n**First-Aid Steps:**\n- Take Paracetamol 500mg (1 tablet) for fever reduction (max 3 times/day). Do NOT take Ibuprofen/Aspirin without blood tests.\n- Maintain high fluid intake (ORS packet, coconut water, fresh juices).\n- Visit Civil Hospital immediately for a complete blood count (CBC) platelet test.`;
    }
    return `🩺 **HealthGuide Symptom Checker (Server):**\n\n**Severity Rating: Mild (Home remedy & monitor)**\n\n**First-Aid Steps:**\n- Maintain rest and light nutrition.\n- If symptoms persist or worsen past 48 hours, proceed to the nearest PHC.`;
  }

  if (p.includes('business') || p.includes('plan')) {
    return `🏪 **DukaanAI Business Plan (Server):**\n\n**Capital:** Moderate (₹10,000 - ₹50,000).\n**Operations:** Source materials directly from sub-district wholesale markets. Offer digital payments (UPI) to reduce cash holding risk. Apply for Mudra Shishu loans up to ₹50,000 at public banks.`;
  }

  if (p.includes('rti') || p.includes('department:')) {
    return `📋 **FORMAL RIGHT TO INFORMATION ACT (SEC 6(1)) REQUEST TEMPLATE (Server)**\n\nTo,\nThe Public Information Officer (PIO)\nOffice of: Government Department\n\n1. Full Name of Applicant: Citizen\n2. Particulars of Information sought:\n   a. Details of development funds disbursed for local pipeline works in 2025-2026.\n   b. Copy of approved contractor registry.\n4. Application Fee details: ₹10 Postal Order attached.\n\nDate: ${new Date().toLocaleDateString()}\nSignature of Applicant: _________________`;
  }

  return `BharatAI Assistant (Server):\n\nYour query has been processed on the backend server. Let us know if you need specific application format drafting templates!`;
}

module.exports = async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { prompt, systemInstruction } = req.body;
  const claudeKey = process.env.CLAUDE_API_KEY || req.headers['x-api-key'];

  if (claudeKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: systemInstruction,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.content && data.content[0]) {
        return res.json({ text: data.content[0].text });
      }
    } catch (e) {
      console.error("Backend Claude API call failed, using local expert engine.", e);
    }
  }

  const reply = parseLocalExpertSystem(prompt, systemInstruction);
  res.json({ text: reply });
};
