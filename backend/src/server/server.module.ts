import http, { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AppModule } from "@/app.module";

/**
 * Asynchronously parses the request body of an incoming HTTP request.
 *
 * Listens to the "data" event to accumulate chunks of data from the request body
 * and then parses it as JSON when the request ends. Returns a Promise that resolves
 * to the parsed JSON object or an empty object if no data is present. If an error
 * occurs during parsing, the Promise is rejected with the error.
 *
 * @param  req - The incoming HTTP request object.
 * @returns A Promise that resolves to the parsed JSON object or an empty object.
 */
const parseRequestBody = (req: IncomingMessage): Promise<object> =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });

/**
 * Handles incoming HTTP requests and routes them based on the application's defined routes.
 *
 * This function processes the request by matching it against the registered routes in the app module.
 * If a match is found, it executes the corresponding route handler.
 * Handles parsing the request body and sends appropriate HTTP responses for success, errors, or unmatched routes.
 *
 * @param app - The application module containing route definitions.
 * @returns A middleware function taking an HTTP request and response object for processing.
 */
const handleRequest = (app: AppModule): ((req: IncomingMessage, res: ServerResponse) => Promise<void>) => {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;
    const match = app.routes.find((r) => r.method === method && r.path === url);

    if (!match) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
      return;
    }

    try {
      const body = await parseRequestBody(req);
      const result = await match.handler(body, res);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  };
};

/**
 * Creates and returns a new HTTP server using the provided application module.
 *
 * @param app - The application module containing the necessary configuration and logic for request handling.
 * @returns The newly created HTTP server instance.
 */
export const createServer = (app: AppModule): Server => http.createServer(handleRequest(app));
