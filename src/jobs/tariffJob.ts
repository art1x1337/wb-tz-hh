import cron from "node-cron";
import axios from "axios";
import { db } from "../db/knex";
import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

const WB_API_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";
const WB_TOKEN = process.env.WB_API_TOKEN;
const SHEET_IDS = (process.env.GOOGLE_SHEET_IDS || "").split(",");

async function fetchWBData() {
  const res = await axios.get(WB_API_URL, {
    headers: { "Authorization": `Bearer ${WB_TOKEN}` }
  });
  return res.data; 
}

async function saveToDB(tariffs: any[]) {
  const today = new Date().toISOString().slice(0, 10);

  for (const t of tariffs) {
    
    await db("tariffs")
      .insert({
        warehouse_name: t.warehouseName,
        coefficient: t.coefficient,
        date: today
      })
      .onConflict(["warehouse_name", "date"])
      .merge();
  }

  console.log("DB updated", tariffs.length, "tariffs");
}

async function updateSheets(tariffs: any[]) {
  if (!SHEET_IDS.length) return;

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const sorted = tariffs.sort((a, b) => a.coefficient - b.coefficient);

  for (const sheetId of SHEET_IDS) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "stocks_coefs!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: sorted.map(t => [t.warehouseName, t.coefficient])
      }
    });
  }

  console.log("Sheets updated:", SHEET_IDS.length);
}

export function startTariffJob() {
  cron.schedule("0 * * * *", async () => { 
    try {
      console.log("Tariff job started");

      const data = await fetchWBData();

      await saveToDB(data);
      await updateSheets(data);

      console.log("Tariff job finished");
    } catch (err) {
      console.error("Tariff job error:", err);
    }
  });

  console.log("Tariff cron scheduled (hourly)");
}