import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get(
  '/health',
  {
    schema: {
      response: { 200: z.object({ status: z.string() }) },
    },
  },
  async () => {
    return { status: 'ok' };
  },
);

async function run() {
  try {
    await app.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

run();
