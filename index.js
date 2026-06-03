import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

// 🔍 DEBUG: kolla att Railway skickar env-variabler
console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY exists =", !!process.env.SUPABASE_KEY);

// ❗ Stoppa appen direkt om något saknas (så vi slipper kryptiska fel)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
}

// 🔗 Supabase client init (detta är “supabase init”)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🟢 Health check
app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// 👤 TEST: hämta players
app.get("/players", async (req, res) => {
  const { data, error } = await supabase.from("players").select("*");

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json(error);
  }

  res.json(data);
});

// 🚀 start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
