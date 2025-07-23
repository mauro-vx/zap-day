import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { DbModule } from "@/core/db/db.module";
import { authModule } from "@/features/auth/auth.module";
import { createServer } from "@/server/server.module";
import { AppModule } from "./app.module";

vi.mock("@/server/server.module", () => ({
  createServer: vi.fn().mockReturnValue({ listen: vi.fn() }),
}));

vi.mock("@/core/db/db.module", () => ({
  DbModule: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    getDb: vi.fn().mockReturnValue("mockDb"),
  })),
}));

vi.mock("@/features/auth/auth.module", () => ({
  authModule: vi.fn().mockReturnValue({
    routes: [
      // biome-ignore lint/suspicious/noEmptyBlockStatements: Placeholder handler for mock routes during testing.
      { method: "GET", path: "/auth/test", handler: () => {} },
      // biome-ignore lint/suspicious/noEmptyBlockStatements: Placeholder handler for mock routes during testing.
      { method: "POST", path: "/auth/login", handler: () => {} },
    ],
  }),
}));

describe("App Module", () => {
  let app: AppModule;
  let dbInit: Mock;
  let dbGet: Mock;
  let mockAuthModule: Mock;
  let mockCreateServer: Mock;

  beforeEach(() => {
    app = new AppModule();

    const dbInstance = (DbModule as Mock).mock.results[0].value;
    dbInit = dbInstance.init;
    dbGet = dbInstance.getDb;

    mockAuthModule = authModule as Mock;
    mockCreateServer = createServer as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("init()", () => {
    it("inits DB and loads routes from authModule", async () => {
      await app.init();

      expect(dbInit).toHaveBeenCalledTimes(1);
      expect(dbGet).toHaveBeenCalledTimes(1);

      expect(mockAuthModule).toHaveBeenCalledWith("mockDb");

      expect(app.routes).toEqual([
        { method: "GET", path: "/auth/test", handler: expect.any(Function) },
        { method: "POST", path: "/auth/login", handler: expect.any(Function) },
      ]);
    });
  });

  describe("listen()", () => {
    it("creates HTTP server and calls listen(port)", () => {
      const port = 5000;
      app.listen(port);

      expect(mockCreateServer).toHaveBeenCalledTimes(1);
      expect(mockCreateServer).toHaveBeenCalledWith(app);

      const serverInst = mockCreateServer.mock.results[0].value;
      expect(serverInst.listen).toHaveBeenCalledTimes(1);
      expect(serverInst.listen).toHaveBeenCalledWith(port);
    });
  });
});
