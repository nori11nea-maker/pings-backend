import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

// --------------------
// HEALTH
// --------------------
app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// --------------------
// PLAYERS
// --------------------
app.get("/players", async (req, res) => {
  const { data, error } = await supabase
    .from("players")
    .select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

// --------------------
// CREATE ACTIVITY (MAIN ENDPOINT)
// --------------------
app.post("/create-activity", async (req, res) => {
  try {
    console.log("🔥 BODY:", req.body);

    const {
      activity_type,
      activity_id,
      players,
      tables,
      poolSize
    } = req.body;

    if (!activity_type || !players || players.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Missing activity_type or players"
      });
    }

    let matches = [];

    // --------------------
    // TRAINING / LEAGUE (same logic)
    // --------------------
    if (
      activity_type === "training" ||
      activity_type === "league"
    ) {
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          matches.push({
            activity_id,
            player1_id: players[i],
            player2_id: players[j],
            table_id: tables?.[0] || null,
            status: "QUEUED"
          });
        }
      }
    }

    // --------------------
    // TOURNAMENT (POOLS)
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
              table_id: tables?.[0] || null,
              status: "QUEUED"
            });
          }
        }
      }
    }

    if (matches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No matches generated"
      });
    }

    const { data, error } = await supabase
      .from("matches")
      .insert(matches)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      matches: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
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
