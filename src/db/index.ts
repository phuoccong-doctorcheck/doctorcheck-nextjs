import 'server-only';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'CRITICAL: DATABASE_URL environment variable is not defined. Ensure .env.local is configured with valid PostgreSQL connection parameters.'
  );
}

// Global declaration for connection singleton across hot reloads in development
declare global {
  var __db_client: postgres.Sql | undefined;
  var __db_instance: PostgresJsDatabase<typeof schema> | undefined;
}

const client =
  global.__db_client ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__db_client = client;
}

export const db =
  global.__db_instance ??
  drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') {
  global.__db_instance = db;
}

export { client };
export type Database = typeof db;
