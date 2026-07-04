const fs = require('fs');
const path = require('path');

const DB_DIR = path.join('/tmp', 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

function initDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
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
  } catch (e) {
    console.warn("Could not write /tmp database:", e.message);
  }
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { collection } = req.query;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;

  if (req.method === 'GET') {
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
      initDb();
      let data = {};
      if (fs.existsSync(DB_PATH)) {
        data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      }
      if (data[collection]) {
        res.json(data[collection]);
      } else {
        res.json([]);
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to read data" });
    }

  } else if (req.method === 'POST') {
    const payload = req.body;
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
      initDb();
      let data = {};
      if (fs.existsSync(DB_PATH)) {
        data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      }
      if (!data[collection]) {
        data[collection] = [];
      }
      payload.id = Date.now();
      data[collection].push(payload);
      try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn("Skipping write to read-only disk");
      }
      res.json({ success: true, item: payload });
    } catch (e) {
      res.status(500).json({ error: "Failed to write data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
