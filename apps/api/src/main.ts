import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", (_req, res) => {
  res.json({ app: "api", status: "ok" });
});

app.listen(port, () => {
  console.log(`@metascope/api listening on :${port}`);
});
