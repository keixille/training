import { and, eq, sql } from 'drizzle-orm';
import { chromium } from 'playwright';
import { db } from '../../db/index.js';
import { brokerSummaryDaily } from '../../db/schema/index.js';

class WebsiteData {
  constructor(
    public readonly stockCode: string,
    public readonly brokerCode: string,
    public readonly tradeDate: string,
    public readonly volume: number,
    public readonly averagePrice: number,
  ) {}

  static fromRow(row: string[], stockCode: string, tradeDate: string): WebsiteData[] {
    const parseFinance = (val: string) => Number(val.replace(/,/g, '')) || 0;

    return [
      new WebsiteData(stockCode, row[0], tradeDate, parseFinance(row[1]), parseFinance(row[3])),
      new WebsiteData(
        stockCode,
        row[5],
        tradeDate,
        -1 * parseFinance(row[6]),
        -1 * parseFinance(row[8]),
      ),
    ];
  }

  toDatabase() {
    return {
      stockCode: this.stockCode,
      brokerCode: this.brokerCode,
      dailyDate: this.tradeDate,
      volume: this.volume.toString(),
      averagePrice: this.averagePrice.toPrecision(2),
    };
  }
}

const baseUrl = 'https://www.indopremier.com/module/saham/include/data-brokersummary.php';

export async function fetchDaily(stockCode: string, tradeDate: string) {
  const dbDatalist = await _fetchFromDb(stockCode, tradeDate);
  if (dbDatalist && dbDatalist.length > 0) {
    return dbDatalist;
  }

  const websiteDatalist = await _fetchFromWebsite(stockCode, tradeDate);
  const summaryDatalist = await _summarizeDailyData(stockCode, tradeDate, websiteDatalist);
  await _saveToDb(summaryDatalist);

  return summaryDatalist;
}

async function _fetchFromDb(stockCode: string, tradeDate: string) {
  return db
    .select({
      stockCode: brokerSummaryDaily.stockCode,
      brokerCode: brokerSummaryDaily.brokerCode,
      tradeDate: brokerSummaryDaily.dailyDate,
      volume: brokerSummaryDaily.volume,
      averagePrice: brokerSummaryDaily.averagePrice,
    })
    .from(brokerSummaryDaily)
    .where(
      and(eq(brokerSummaryDaily.stockCode, stockCode), eq(brokerSummaryDaily.dailyDate, tradeDate)),
    );
}

async function _fetchFromWebsite(stockCode: string, tradeDate: string) {
  const [year, month, day] = tradeDate.split('-');
  const formattedDate = `${month}/${day}/${year}`;
  const url = `${baseUrl}?code=${stockCode}&start=${formattedDate}&end=${formattedDate}&fd=all&board=all`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    const rows = await page.$$eval('table tr', (tableRows) => {
      return tableRows
        .map((row) => {
          const columns = Array.from(row.querySelectorAll('td'));
          return columns.map((col) => col.innerText.trim());
        })
        .filter((row) => row.length > 0);
    });

    return rows.flatMap((row) => WebsiteData.fromRow(row, tradeDate, stockCode));
  } finally {
    await browser.close();
  }
}

async function _summarizeDailyData(
  stockCode: string,
  tradeDate: string,
  websiteDatalist: WebsiteData[],
) {
  const summaryMap = new Map<string, WebsiteData>();

  for (const data of websiteDatalist) {
    const existingData =
      summaryMap.get(data.brokerCode) ||
      new WebsiteData(stockCode, data.brokerCode, tradeDate, 0, 0);

    const newPrice =
      existingData.volume * existingData.averagePrice + data.volume * data.averagePrice;
    const newVolume = existingData.volume + data.volume;
    summaryMap.set(
      data.brokerCode,
      new WebsiteData(stockCode, data.brokerCode, tradeDate, newVolume, newPrice / newVolume),
    );
  }
  return [...summaryMap.values()];
}

async function _saveToDb(websiteDatalist: WebsiteData[]) {
  const dataToInsert = websiteDatalist.map((websiteData) => websiteData.toDatabase());
  return db
    .insert(brokerSummaryDaily)
    .values(dataToInsert)
    .onConflictDoUpdate({
      target: [
        brokerSummaryDaily.stockCode,
        brokerSummaryDaily.brokerCode,
        brokerSummaryDaily.dailyDate,
      ],
      set: { volume: sql`excluded.volume`, averagePrice: sql`excluded.averagePrice` },
    });
}
