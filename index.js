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

app.post("/auto-assign", async (req, res) => {
  try {
    // 1. Hitta nästa QUEUED match
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "QUEUED")
      .order("created_at", { ascending: true })
      .limit(1);

    if (matchError) return res.status(500).json(matchError);
    if (!matches || matches.length === 0) {
      return res.json({ message: "No queued matches" });
    }

    const match = matches[0];

    // 2. Hitta ledigt bord
    const { data: tables, error: tableError } = await supabase
      .from("tables")
      .select("*")
      .eq("status", "FREE")
      .limit(1);

    if (tableError) return res.status(500).json(tableError);
    if (!tables || tables.length === 0) {
      return res.json({ message: "No free tables" });
    }

    const table = tables[0];

    // 3. Uppdatera match → PLAYING + table_id
    const { data: updatedMatch, error: updateError } = await supabase
      .from("matches")
      .update({
        status: "PLAYING",
        table_id: table.id
      })
      .eq("id", match.id)
      .select();

    if (updateError) return res.status(500).json(updateError);

    // 4. Markera bord som upptaget
    const { error: tableUpdateError } = await supabase
      .from("tables")
      .update({
        status: "OCCUPIED"
      })
      .eq("id", table.id);

    if (tableUpdateError) return res.status(500).json(tableUpdateError);

    res.json({
      message: "Match assigned to table",
      match: updatedMatch,
      table
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
