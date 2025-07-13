import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "@/core/db/db.types";

let db: Kysely<DB> | null = null;

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

export function initDb(): void {
	if (db) return;
	db = new Kysely<DB>({ dialect: new PostgresDialect({ pool: getPool() }) });
}

export function getDb(): Kysely<DB> {
	if (!db) throw new Error("❌ DB not initialized. Call initDb() first.");
	return db;
}

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
