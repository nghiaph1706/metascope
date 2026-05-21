import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get("/health", (_req, res) => {
  res.json({ app: "cms", status: "ok" });
});

app.get("/", (_req, res) => {
  res.send("MetaScope cms bootstrap is running");
});

app.listen(port, () => {
  console.log(`@metascope/cms listening on :${port}`);
});
