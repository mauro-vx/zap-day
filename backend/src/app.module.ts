import { DbModule } from "@/core/db/db.module";
import { authModule } from "@/features/auth/auth.module";
import { createServer } from "@/server/server.module";

export type Route<ReqBody = unknown, ResBody = unknown> = {
  method: string;
  path: string;
  handler: (reqBody: ReqBody, res: import("node:http").ServerResponse) => Promise<ResBody>;
};

/**
 * Represents a configurable route used in an HTTP server.
 *
 * @param method - The HTTP method (e.g., GET, POST).
 * @param path - The endpoint URL pattern.
 * @param handler - Function that processes the request body and returns a response.
 */
export class AppModule {
  private dbModule = new DbModule();
  public routes: Route[] = [];

  /**
   * Represents the main application module which initializes the database,
   * sets up application routes.
   */
  public async init(): Promise<void> {
    console.log("1) Initializing database…");
    await this.dbModule.init();

    console.log("2) Building application routes…");
    const db = this.dbModule.getDb();

    this.routes = [...authModule(db).routes];
  }

  /**
   * Start listening on given port HTTP server.
   */
  public listen(port: number): void {
    console.log(`3) Starting HTTP server on http://localhost:${port}`);
    const server = createServer(this);
    server.listen(port);
  }
}
