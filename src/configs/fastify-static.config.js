import path from "node:path";

export const FASTIFY_STATIC_CONFIG = {
  root: path.resolve("public"),
  setHeaders(res) {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};
