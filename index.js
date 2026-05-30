import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Backend kör på port", PORT);
});
