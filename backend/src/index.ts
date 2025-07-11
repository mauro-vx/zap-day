import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "../types/database";

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
		}),
	}),
});

const testConnection = async () => {
	const tables = await db
		// @ts-expect-error: Kysely types do not recognize system catalogs by default(not part of DB interface)
		.selectFrom("pg_catalog.pg_tables")
		// @ts-expect-error:  Kysely types do not recognize system catalogs by default(not part of DB interface)
		.select(["tablename"])
		.where("schemaname", "!=", "pg_catalog")
		.where("schemaname", "!=", "information_schema")
		.execute();
	console.log(
		"Tables:",
		tables.map((row: { tablename: string }) => row.tablename),
	);

	const users = await db.selectFrom("users").selectAll().execute();
	console.log("Users found:", users);
};

testConnection();
