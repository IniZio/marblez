import { ApolloServer } from "apollo-server";
import dotenv from 'dotenv';
import { ObjectId } from "mongodb";
import { connect } from "mongoose";
import cron from 'node-cron';
import * as path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { User } from "./entities/user";
import { seedDatabase } from "./helpers";
import { syncGoogleForms } from './jobs/sync-google-forms';
import { ObjectIdScalar } from "./object-id.scalar";
import { NotificationResolver } from './resolvers/notification-resolver';
import { OrderResolver } from './resolvers/order-resolver ';
import { RateResolver } from "./resolvers/rate-resolver";
import { RecipeResolver } from "./resolvers/recipe-resolver";
import { TypegooseMiddleware } from "./typegoose-middleware";


export interface Context {
  user: User;
}

dotenv.config();

// replace with your value if needed
const { MONGO_HOST, PORT = '4000' } = process.env;

async function bootstrap() {
  try {
    // create mongoose connection
    const mongoose = await connect(MONGO_HOST);

    // clean and seed database with some data
    // await mongoose.connection.db.dropDatabase();
    const { defaultUser } = await seedDatabase();

    // build TypeGraphQL executable schema
    const schema = await buildSchema({
      resolvers: [RecipeResolver, RateResolver, OrderResolver, NotificationResolver],
      emitSchemaFile: path.resolve(__dirname, "schema.gql"),
      // use document converting middleware
      globalMiddlewares: [TypegooseMiddleware],
      // use ObjectId scalar mapping
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      dateScalarMode: 'isoDate',
    });

    // create mocked context
    const context: Context = { user: defaultUser };

    // Create GraphQL server
    const server = new ApolloServer({ schema, context });

    // Start the server
    const { url } = await server.listen(PORT);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
  } catch (err) {
    console.error('???', JSON.stringify(err));
  }
}

bootstrap();

cron.schedule('*/10 * * * *', syncGoogleForms)
syncGoogleForms()
