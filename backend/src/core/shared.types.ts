import type { ServerResponse } from "node:http";

export type Route<Res = unknown> = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: (reqBody: unknown, res: ServerResponse) => Promise<Res> | Res;
};
