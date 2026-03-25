import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { db } from './db/index.js'; // Ensure correct path
import { registerRoutes } from './routes/index.js';
import { BrokerSummaryService } from './services/indoPremier/brokerSummary.js';

declare module 'fastify' {
  interface FastifyInstance {
    brokerSummaryService: BrokerSummaryService;
  }
}

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

const brokerSummaryService = new BrokerSummaryService(db);
app.decorate('brokerSummaryService', brokerSummaryService);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(registerRoutes);

const start = async () => {
  try {
    await app.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
