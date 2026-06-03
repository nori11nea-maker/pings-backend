import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// ========================
// ENV CHECK (Railway)
// ========================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_KEY exists =", !!SUPABASE_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_KEY in Railway env");
}

// ========================
// SUPABASE INIT
// ========================
const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

// ========================
// HEALTH CHECK
// ========================
app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// ========================
// GET PLAYERS
// ========================
app.get("/players", async (req, res) => {
  try {
    const { data, error } = await supabase.from("players").select("*");

    if (error) {
      console.error("Supabase error (/players):", error);
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error("Server error (/players):", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// START TOURNAMENT
// ========================
app.post("/start-tournament", async (req, res) => {
  try {
    // 1. Hämta players
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*");

    if (playersError) {
      return res.status(500).json(playersError);
    }

    if (!players || players.length < 2) {
      return res.status(400).json({ error: "Not enough players" });
    }

    // 2. Skapa matcher (enkel 1v1 pairing)
    const matches = [];

    for (let i = 0; i < players.length; i += 2) {
      const p1 = players[i];
      const p2 = players[i + 1];

      if (!p2) break;

      matches.push({
        player1_id: p1.id,
        player2_id: p2.id,
        status: "waiting",
      });
    }

    // 3. Spara matcher i Supabase
    const { data: inserted, error: insertError } = await supabase
      .from("matches")
      .insert(matches)
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json(insertError);
    }

    res.json({
      message: "Tournament created",
      matches: inserted,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server crashed", details: err.message });
  }
});

// 🚀 Start server (VIKTIGT för Railway)
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
