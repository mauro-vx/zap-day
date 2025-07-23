import { describe, expect, it, vi } from "vitest";
import { AppModule } from "@/app.module";
import { bootstrap } from "@/main";

vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit() called");
});

vi.mock("@/app.module", async () => {
  const actual = await vi.importActual<typeof import("@/app.module")>("@/app.module");
  return {
    ...actual,
    AppModule: class {
      async init() {
        console.log("Mock AppModule initialized");
      }
      listen(port: number) {
        console.log(`Mock server listening on http://localhost:${port}`);
      }
      close() {
        console.log("Mock AppModule closed");
      }
    },
  };
});

describe("App Bootstrapper", () => {
  it("should bootstrap the application and start the server", async () => {
    const consoleLogSpy = vi.spyOn(console, "log");

    await bootstrap();

    expect(consoleLogSpy).toHaveBeenCalledWith("Bootstrapping application...");
    expect(consoleLogSpy).toHaveBeenCalledWith("Mock AppModule initialized");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Mock server listening"));

    consoleLogSpy.mockRestore();
  });

  it("should handle errors during initialization", async () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: This block is intentionally left empty for future implementation.
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(AppModule.prototype, "init").mockImplementationOnce(async () => {
      throw new Error("Initialization Error");
    });

    await expect(bootstrap()).rejects.toThrow("process.exit() called");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to start application:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
