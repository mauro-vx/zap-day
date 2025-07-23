import { AppModule } from "@/app.module";

const PORT = Number(process.env.PORT) || 5000;

/**
 * Initializes and starts the application by bootstrapping the necessary modules.
 *
 * This method creates an instance of the application's main module, initializes it,
 * and starts the server listening on the specified port. If an error occurs during
 * initialization or startup, the process will exit with an error code.
 *
 * @return A promise that resolves when the application is successfully initialized and listening, or rejects if an error occurs.
 */
export async function bootstrap() {
  const app = new AppModule();

  try {
    console.log("Bootstrapping application...");
    await app.init();
    app.listen(PORT);
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
