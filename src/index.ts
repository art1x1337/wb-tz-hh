import express from "express";
import { db } from "./db/knex";
import { migrate } from "./db/migrate";
import { startTariffJob } from "./jobs/tariffJob";

const app = express();
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await db.raw("select 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

app.get("/tariffs", async (_req, res) => {
  const tariffs = await db("tariffs").select("*");
  res.json(tariffs);
});

app.post("/tariffs", async (req, res) => {
  const { warehouse_name, coefficient } = req.body;

  const [created] = await db("tariffs")
    .insert({
      warehouse_name,
      coefficient,
      date: new Date()
    })
    .returning("*");

  res.json(created);
});

async function start() {
  try {
    await migrate();
    
    startTariffJob();

    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();