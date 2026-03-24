import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { fetchDaily } from '../../services/indoPremier/brokerSummary.js';

const BrokerSummaryPayload = z.object({
  stockCode: z.string().regex(/^[A-Z]{4}$/, {
    message: 'Stock code must be exactly 4 uppercase letters (e.g., BBCA, BBRI)',
  }),
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  }),
});

export async function brokerSummaryRoutes(app: FastifyInstance) {
  app.get('/broker-summary/daily', async (request, _) => {
    const payload = BrokerSummaryPayload.parse(request.params);
    return fetchDaily(payload.stockCode, payload.tradeDate);
  });
}
