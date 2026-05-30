import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// VIKTIGT: fallback så den ALDRIG kraschar
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
