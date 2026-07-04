const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to local JSON database for offline/zero-setup persistence
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Initialize database file
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}
if (!fs.existsSync(DB_PATH)) {
  const initialDb = {
    ledger: [
      { id: 1, desc: "Sold 5 Liters Milk", amount: 300, type: "income" },
      { id: 2, desc: "Seeds purchase", amount: 120, type: "expense" }
    ],
    shg: [
      { id: 1, name: "Kusum Devi", amount: 500 },
      { id: 2, name: "Renu Sharma", amount: 500 }
    ],
    notices: [
      { id: 1, text: "Village Gram Panchayat meeting on water conservation this Friday at 4 PM.", user: "Sarpanch", tag: "Event", time: "2 hours ago" },
      { id: 2, text: "Lost brown leather wallet near primary school. Contact Satish.", user: "Satish Kumar", tag: "Lost & Found", time: "1 day ago" }
    ],
    crm: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
}

// Serve static frontend files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper for local rule-based expert AI system
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

// 1. AI API Proxy Endpoint
app.post('/api/ai', async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  const claudeKey = process.env.CLAUDE_API_KEY || req.headers['x-api-key'];

  if (claudeKey) {
    try {
      // Direct Node.js fetch call to Anthropic API (bypassing browser CORS)
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

  // Fallback to local rule-based expert parser on the server
  const reply = parseLocalExpertSystem(prompt, systemInstruction);
  res.json({ text: reply });
});

// 2. Local Database GET Endpoint
app.get('/api/data/:collection', async (req, res) => {
  const collection = req.params.collection;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnon) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${collection}?select=*`, {
        method: "GET",
        headers: {
          "apikey": supabaseAnon,
          "Authorization": `Bearer ${supabaseAnon}`
        }
      });
      if (response.ok) {
        const rows = await response.json();
        return res.json(rows);
      }
    } catch (e) {
      console.error("Supabase GET proxy failed. Falling back to local file database.", e);
    }
  }

  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (data[collection]) {
      res.json(data[collection]);
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// 3. Local Database POST Endpoint
app.post('/api/data/:collection', async (req, res) => {
  const collection = req.params.collection;
  const payload = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnon) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${collection}`, {
        method: "POST",
        headers: {
          "apikey": supabaseAnon,
          "Authorization": `Bearer ${supabaseAnon}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const items = await response.json();
        return res.json({ success: true, item: items[0] || payload });
      }
    } catch (e) {
      console.error("Supabase POST proxy failed. Falling back to local file database.", e);
    }
  }

  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (!data[collection]) {
      data[collection] = [];
    }
    
    payload.id = Date.now();
    data[collection].push(payload);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    res.json({ success: true, item: payload });
  } catch (e) {
    res.status(500).json({ error: "Failed to write data" });
  }
});

app.listen(PORT, () => {
  console.log(`BharatAI Server running on port ${PORT}`);
});
