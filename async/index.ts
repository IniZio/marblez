import dotenv from 'dotenv';
import { connect } from 'mongoose';
import createFastify from "fastify"
import cron from 'node-cron';
import "reflect-metadata";
import 'source-map-support/register';
import { syncGoogleForms } from './jobs/sync-google-forms';

dotenv.config();

const { MONGO_URL, PORT = 4000 } = process.env;

const fastify = createFastify({ logger: true });

fastify.get('/', async () => {
  return { hello: 'world' }
})

const start = async () => {
  try {
    await connect(MONGO_URL)
    cron.schedule('*/5 * * * *', syncGoogleForms)
    await fastify.listen(PORT, "0.0.0.0")
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
