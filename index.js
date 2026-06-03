import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// 🔍 Debug (visar om Railway skickar env)
console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY exists =", !!process.env.SUPABASE_KEY);

// ⚠️ Viktigt: servern KRASCHAR INTE längre
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.log("❌ Missing env vars (SUPABASE_URL or SUPABASE_KEY)");
}

// 🔗 Supabase init (OBS: kan fortfarande skapa client även om något är fel)
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

// 🟢 Health check (testar att servern lever)
app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// 👤 TEST: hämta players från Supabase
app.get("/players", async (req, res) => {
  try {
    const { data, error } = await supabase.from("players").select("*");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json(error);
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
