export const FASTIFY_CORS_CONFIG = {
  origin: "*",
  methods: "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS",
  allowedHeaders:
    "Origin, Content-Type, X-Requested-With, Authorization, Accept, append, delete, entries, foreach, get, has, keys, set, values, *",
  preflightContinue: true,
  optionsSuccessStatus: 204,
};
