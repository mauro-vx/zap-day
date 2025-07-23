import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "@/core/db/db.types";

/**
 * Represents the database connection instance using Kysely for type-safe SQL queries.
 * The `db` variable may either contain a `Kysely<DB>` instance to perform database operations
 * or be `null` to indicate that the database connection has not been initialized.
 *
 * The `DB` refers to the database schema type that defines the structure of the connected database.
 */
let db: Kysely<DB> | null = null;

/**
 * Creates and returns a new instance of the database connection pool. The pool
 * configuration is determined based on the presence of the DATABASE_URL
 * environment variable. If DATABASE_URL is defined, it uses the connection string
 * provided; otherwise, it utilizes individual environment variables to configure
 * the connection pool.
 *
 * @return {Pool} An instance of the connection pool.
 */
function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  return url
    ? new Pool({ connectionString: url })
    : new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      });
}

/**
 * Initializes the database connection. If a custom connection pool is provided, it uses that; otherwise, it creates a default connection pool.
 *
 * @param {Pool} [customPool] - An optional custom connection pool for database connections.
 * @return {void} This function does not return a value; it initializes the database connection.
 */
export function initDb(customPool?: Pool): void {
  if (db) return;
  const pool = customPool ?? getPool();
  db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });
}

/**
 * Retrieves the initialized database instance.
 *
 * @return {Kysely<DB>} The Kysely database instance.
 * @throws {Error} If the database has not been initialized through `initDb()`.
 */
export function getDb(): Kysely<DB> {
  if (!db) {
    console.error("Database access error: `initDb()` has not been called.");
    throw new Error("❌ DB not initialized. Call initDb() first.");
  }
  return db;
}

/**
 * Tests the database connection by querying system catalogs for table names
 * and user records. Logs the list of tables and users if the connection is
 * successful, otherwise logs an error message in case of failure.
 *
 * @return {Promise<void>} A promise that resolves when the database connection
 *         test completes successfully or fails with an error message logged.
 */
export async function testConnection(): Promise<void> {
  try {
    const conn = getDb();

    const tables = await conn
      // @ts-expect-error: system catalog unsupported in types
      .selectFrom("pg_catalog.pg_tables")
      // @ts-expect-error: system catalog unsupported in types
      .select(["tablename"])
      .where("schemaname", "!=", "pg_catalog")
      .where("schemaname", "!=", "information_schema")
      .execute();

    console.log(
      "🟢 Tables:",
      tables.map((row: { tablename: string }) => row.tablename),
    );

    const users = await conn.selectFrom("users").selectAll().execute();
    console.log("🟢 Users found:", users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔴 Database connection failed:", message);
  }
}

/**
 * Closes the database connection if it exists and frees associated resources.
 *
 * @return {Promise<void>} A promise that resolves when the database connection has been successfully closed.
 */
export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
