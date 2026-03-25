import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'; // Match your actual driver
import { chromium } from 'playwright';
import * as schema from '../../db/schema/index.js';

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

export class BrokerSummaryService {
  private readonly baseUrl =
    'https://www.indopremier.com/module/saham/include/data-brokersummary.php';

  constructor(private db: NodePgDatabase<typeof schema>) {}

  async fetchDaily(stockCode: string, tradeDate: string) {
    const dbDatalist = await this.fetchFromDb(stockCode, tradeDate);
    if (dbDatalist && dbDatalist.length > 0) {
      return dbDatalist;
    }

    const websiteDatalist = await this.fetchFromWebsite(stockCode, tradeDate);
    const summaryDatalist = await this.summarizeDailyData(stockCode, tradeDate, websiteDatalist);
    await this.saveToDb(summaryDatalist);

    return summaryDatalist;
  }

  async fetchFromDb(stockCode: string, tradeDate: string) {
    return this.db
      .select({
        stockCode: schema.brokerSummaryDaily.stockCode,
        brokerCode: schema.brokerSummaryDaily.brokerCode,
        tradeDate: schema.brokerSummaryDaily.dailyDate,
        volume: schema.brokerSummaryDaily.volume,
        averagePrice: schema.brokerSummaryDaily.averagePrice,
      })
      .from(schema.brokerSummaryDaily)
      .where(
        and(
          eq(schema.brokerSummaryDaily.stockCode, stockCode),
          eq(schema.brokerSummaryDaily.dailyDate, tradeDate),
        ),
      );
  }

  async fetchFromWebsite(stockCode: string, tradeDate: string) {
    const [year, month, day] = tradeDate.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    const url = `${this.baseUrl}?code=${stockCode}&start=${formattedDate}&end=${formattedDate}&fd=all&board=all`;

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

  async summarizeDailyData(stockCode: string, tradeDate: string, websiteDatalist: WebsiteData[]) {
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

  async saveToDb(websiteDatalist: WebsiteData[]) {
    const dataToInsert = websiteDatalist.map((websiteData) => websiteData.toDatabase());
    return this.db
      .insert(schema.brokerSummaryDaily)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [
          schema.brokerSummaryDaily.stockCode,
          schema.brokerSummaryDaily.brokerCode,
          schema.brokerSummaryDaily.dailyDate,
        ],
        set: { volume: sql`excluded.volume`, averagePrice: sql`excluded.average_price` },
      });
  }
}
