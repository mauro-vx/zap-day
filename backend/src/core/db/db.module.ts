import type { Kysely } from "kysely";
import { SchemaSetup } from "./db.schema-setup";
import { getDb, initDb, testConnection } from "./db.service";
import type { DB } from "./db.types";

/**
 * DbModule is responsible for initializing, managing, and tearing down the database connection.
 * It acts as a wrapper to handle database operations with the Kysely library.
 */
export class DbModule {
  private db: Kysely<DB> | null = null;

  public async init(): Promise<void> {
    console.log("Initializing the database connection...");
    initDb();
    this.db = getDb();

    console.log("Verifying database connectivity...");
    await testConnection();

    console.log("Running schema setup...");
    await new SchemaSetup(this.db).run();

    console.log("Database ready.");
  }

  public getDb(): Kysely<DB> {
    if (!this.db) throw new Error("DbModule not initialized. Call init() first.");
    return this.db;
  }

  public async teardown(): Promise<void> {
    if (this.db) {
      console.log("Tearing down database connection...");
      await this.db.destroy();
      this.db = null;
    }
  }
}
