import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { and, eq } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '../../../db/schema/index.js';
import { fetchDaily } from '../../../services/indoPremier/brokerSummary.js';

describe('Broker Sync Integration', () => {
  let container: StartedPostgreSqlContainer;
  let client: pg.Client;
  let db: NodePgDatabase<typeof schema>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    client = new pg.Client({ connectionString: container.getConnectionUri() });
    await client.connect();

    await client.query('CREATE SCHEMA IF NOT EXISTS "indo_premier";');

    db = drizzle(client, { schema });

    await migrate(db, { migrationsFolder: './drizzle' });
  }, 60000);

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it('should scrape from website and save to DB on first call', async () => {
    const stockCode = 'CUAN';
    const tradeDate = '2026-03-17';

    const result = await fetchDaily(stockCode, tradeDate);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].stockCode).toBe(stockCode);

    const dbRecords = await _fetchFromDb(stockCode, tradeDate); // Call your internal helper
    expect(dbRecords.length).toBe(result.length);
  });

  it('should handle upsert correctly on duplicate calls', async () => {
    const stock = 'CUAN';
    const date = '2026-03-17';

    // First call saves
    await fetchDaily(stock, date);

    // Second call should trigger onConflictDoUpdate without crashing
    const result = await fetchDaily(stock, date);
    expect(result).toBeDefined();
  });

  const _fetchFromDb = async (stockCode: string, tradeDate: string) => {
    const { brokerSummaryDaily } = schema;

    return db
      .select({
        tradeDate: brokerSummaryDaily.dailyDate,
        stockCode: brokerSummaryDaily.stockCode,
        brokerCode: brokerSummaryDaily.brokerCode,
        volume: brokerSummaryDaily.volume,
        averagePrice: brokerSummaryDaily.averagePrice,
      })
      .from(brokerSummaryDaily)
      .where(
        and(
          eq(brokerSummaryDaily.stockCode, stockCode),
          eq(brokerSummaryDaily.dailyDate, tradeDate),
        ),
      );
  };
});
