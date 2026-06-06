import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// --------------------
// SUPABASE
// --------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_KEY || ""
);

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// --------------------
// PLAYERS (optional debug)
// --------------------
app.get("/players", async (req, res) => {
  const { data, error } = await supabase
    .from("players")
    .select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});

// --------------------
// MAIN ENDPOINT (ALL ACTIVITIES)
// --------------------
app.post("/create-activity", async (req, res) => {
  try {
    console.log("🔥 REQUEST BODY:", req.body);

    const {
      activity_type,
      activity_id,
      players,
      tables,
      poolSize
    } = req.body;

    // --------------------
    // VALIDATION
    // --------------------
    if (!activity_type) {
      return res.status(400).json({
        success: false,
        message: "Missing activity_type"
      });
    }

    if (!players || !Array.isArray(players) || players.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Players must be an array with at least 2 players"
      });
    }

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tables must be provided"
      });
    }

    let matches = [];

    // --------------------
    // LEAGUE & TRAINING
    // --------------------
    if (
      activity_type === "league" ||
      activity_type === "training"
    ) {
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          matches.push({
            activity_id,
            player1_id: players[i],
            player2_id: players[j],
            table_id: tables[i % tables.length],
            status: "QUEUED"
          });
        }
      }
    }

    // --------------------
    // TOURNAMENT (POOL SYSTEM)
    // --------------------
    if (activity_type === "tournament") {
      const size = poolSize || 2;
      const pools = [];

      for (let i = 0; i < players.length; i += size) {
        pools.push(players.slice(i, i + size));
      }

      for (const pool of pools) {
        for (let i = 0; i < pool.length; i++) {
          for (let j = i + 1; j < pool.length; j++) {
            matches.push({
              activity_id,
              player1_id: pool[i],
              player2_id: pool[j],
              table_id: tables[i % tables.length],
              status: "QUEUED"
            });
          }
        }
      }
    }

    // --------------------
    // SAFETY CHECK
    // --------------------
    if (matches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No matches generated"
      });
    }

    console.log("📦 MATCHES GENERATED:", matches);

    // --------------------
    // INSERT INTO SUPABASE
    // --------------------
    const { data, error } = await supabase
      .from("matches")
      .insert(matches)
      .select();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      matches: data
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
