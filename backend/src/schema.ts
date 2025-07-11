import { type Kysely, sql } from "kysely";
import type { DB } from "../types/database";

export async function setupSchema(db: Kysely<DB>) {
	await db.schema
		.createTable("users")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("email", "varchar(255)", (col) => col.notNull().unique())
		.addColumn("password_hash", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	await db.schema
		.createTable("tokens")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) =>
			col.references("users.id").onDelete("cascade").notNull(),
		)
		.addColumn("refresh_token", "text", (col) => col.notNull())
		.addColumn("revoked", "boolean", (col) => col.defaultTo(false))
		.addColumn("issued_at", "timestamp")
		.addColumn("expires_at", "timestamp")
		.execute();

	await db.schema
		.createTable("habits")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) =>
			col.references("users.id").onDelete("cascade").notNull(),
		)
		.addColumn("name", "varchar(100)", (col) => col.notNull())
		.addColumn("frequency", "varchar(20)")
		.addColumn("created_at", "timestamp", (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	await db.schema
		.createTable("habit_logs")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("habit_id", "integer", (col) =>
			col.references("habits.id").onDelete("cascade").notNull(),
		)
		.addColumn("completed_at", "timestamp", (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("note", "text")
		.execute();

	await db.schema
		.createTable("user_profiles")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) =>
			col.references("users.id").onDelete("cascade").unique().notNull(),
		)
		.addColumn("full_name", "varchar(100)")
		.addColumn("avatar_url", "text")
		.addColumn("bio", "text")
		.execute();

	await db.schema
		.createTable("habit_tags")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("habit_id", "integer", (col) =>
			col.references("habits.id").onDelete("cascade").notNull(),
		)
		.addColumn("tag", "varchar(50)", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("reminders")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("habit_id", "integer", (col) =>
			col.references("habits.id").onDelete("cascade").notNull(),
		)
		.addColumn("remind_at", "timestamp", (col) => col.notNull())
		.addColumn("method", "varchar(20)") // e.g. email, push
		.execute();
}
