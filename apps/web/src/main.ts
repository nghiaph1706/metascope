import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get("/health", (_req, res) => {
  res.json({ app: "web", status: "ok" });
});

app.get("/", (_req, res) => {
  res.send("MetaScope web bootstrap is running");
});

app.listen(port, () => {
  console.log(`@metascope/web listening on :${port}`);
});
