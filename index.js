import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_KEY exists =", !!SUPABASE_KEY);

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

app.get("/players", async (req, res) => {
  const { data, error } = await supabase.from("players").select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.post("/start-tournament", async (req, res) => {
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*");

  if (playersError) return res.status(500).json(playersError);

  const matches = [];

  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1];
    if (!p2) break;

    matches.push({
      player1_id: p1.id,
      player2_id: p2.id,
      table_id: null,
      status: "QUEUED",
      current_set: 1,
      p1_sets: 0,
      p2_sets: 0,
      winner_id: null
    });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("matches")
    .insert(matches)
    .select();

  if (insertError) return res.status(500).json(insertError);

  res.json({ message: "Tournament created", matches: inserted });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
