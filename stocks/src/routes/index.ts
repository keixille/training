import type { FastifyInstance } from 'fastify';
import { brokerSummaryRoutes } from '../routes/indoPremier/brokerSummary.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(brokerSummaryRoutes, { prefix: '/indo-premier' });
}
