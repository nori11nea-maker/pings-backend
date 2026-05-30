import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

// VIKTIGT: Railway kräver denna
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend kör på port", PORT);
});
