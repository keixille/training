import { date, numeric, pgSchema, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const indoPremierSchema = pgSchema('indo_premier');

const commonBrokerSummary = {
  id: serial('id').primaryKey(),
  stockCode: text('stock_code').notNull(),
  brokerCode: text('broker_code').notNull(),
  volume: numeric('volume', { precision: 20, scale: 2 }).notNull().default('0'),
  averagePrice: numeric('average_price', { precision: 20, scale: 2 }).notNull().default('0'),
};

export const brokerSummaryDaily = indoPremierSchema.table(
  'broker_summary_daily',
  {
    ...commonBrokerSummary,
    dailyDate: date('daily_date').notNull(),
  },
  (table) => [
    uniqueIndex('broker_summary_daily_idx').on(table.stockCode, table.dailyDate, table.brokerCode),
  ],
);

export const brokerSummaryMonthly = indoPremierSchema.table(
  'broker_summary_monthly',
  {
    ...commonBrokerSummary,
    monthlyDate: date('monthly_date').notNull(),
  },
  (table) => [
    uniqueIndex('broker_summary_monthly_idx').on(
      table.stockCode,
      table.monthlyDate,
      table.brokerCode,
    ),
  ],
);

export const brokerSummaryYearly = indoPremierSchema.table(
  'broker_summary_yearly',
  {
    ...commonBrokerSummary,
    yearlyDate: date('yearly_date').notNull(),
  },
  (table) => [
    uniqueIndex('broker_summary_yearly_idx').on(
      table.stockCode,
      table.yearlyDate,
      table.brokerCode,
    ),
  ],
);
