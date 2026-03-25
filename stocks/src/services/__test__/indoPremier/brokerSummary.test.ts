import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '../../../db/schema/index.js';
import { BrokerSummaryService } from '../../indoPremier/brokerSummary.js';

describe('BrokerSummaryService Integration', () => {
  let container: StartedPostgreSqlContainer;
  let pool: pg.Pool;
  let service: BrokerSummaryService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18-alpine').start();

    pool = new pg.Pool({
      connectionString: container.getConnectionUri(),
    });

    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: './drizzle' });

    service = new BrokerSummaryService(db);
  }, 60000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  it('should fetch from website and save to Testcontainer PG', async () => {
    const stockCode = 'BBCA';
    const tradeDate = '2024-01-10';

    const result = await service.fetchDaily(stockCode, tradeDate);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const dbData = await service.fetchFromDb(stockCode, tradeDate);
    expect(dbData.length).toBe(result.length);
  }, 30000);
});
