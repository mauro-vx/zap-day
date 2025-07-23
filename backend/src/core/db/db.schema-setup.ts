import { type Kysely, sql } from "kysely";
import type { DB } from "@/core/db/db.types";

/**
 * The SchemaSetup class is responsible for managing the creation of database tables.
 * It uses Kysely to define and execute schema operations for setting up the structure of the database.
 * The class includes methods to create tables for users, tokens, habits, habit logs, user profiles, habit tags, and reminders.
 *
 * Each method defines the schema for a specific table, including column definitions, data types, constraints, and default values.
 * Methods follow the `ifNotExists` pattern to ensure tables are only created if they do not already exist.
 *
 * @class
 */
export class SchemaSetup {
  constructor(private db: Kysely<DB>) {}

  async createUsersTable() {
    await this.db.schema
      .createTable("users")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
      .addColumn("password_hash", "text", (col) => col.notNull())
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();
  }

  async createTokensTable() {
    await this.db.schema
      .createTable("tokens")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
      .addColumn("refresh_token", "text", (col) => col.notNull())
      .addColumn("revoked", "boolean", (col) => col.defaultTo(false))
      .addColumn("issued_at", "timestamp")
      .addColumn("expires_at", "timestamp")
      .execute();
  }

  async createHabitsTable() {
    await this.db.schema
      .createTable("habits")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
      .addColumn("name", "varchar(100)", (col) => col.notNull())
      .addColumn("frequency", "varchar(20)")
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();
  }

  async createHabitsLogTable() {
    await this.db.schema
      .createTable("habit_logs")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("habit_id", "integer", (col) => col.references("habits.id").onDelete("cascade").notNull())
      .addColumn("completed_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("note", "text")
      .execute();
  }

  async createUserProfileTable() {
    await this.db.schema
      .createTable("user_profiles")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) => col.references("users.id").onDelete("cascade").unique().notNull())
      .addColumn("full_name", "varchar(100)")
      .addColumn("avatar_url", "text")
      .addColumn("bio", "text")
      .execute();
  }

  async createHabitsTagTable() {
    await this.db.schema
      .createTable("habit_tags")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("habit_id", "integer", (col) => col.references("habits.id").onDelete("cascade").notNull())
      .addColumn("tag", "varchar(50)", (col) => col.notNull())
      .execute();
  }

  async createRemindersTable() {
    await this.db.schema
      .createTable("reminders")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("habit_id", "integer", (col) => col.references("habits.id").onDelete("cascade").notNull())
      .addColumn("remind_at", "timestamp", (col) => col.notNull())
      .addColumn("method", "varchar(20)") // example: email, push
      .execute();
  }

  async run() {
    console.log("Setting up database schema...");
    await this.createUsersTable();
    await this.createTokensTable();
    await this.createHabitsTable();
    await this.createHabitsLogTable();
    await this.createUserProfileTable();
    await this.createHabitsTagTable();
    await this.createRemindersTable();

    console.log("Database schema setup complete!");
  }
}
