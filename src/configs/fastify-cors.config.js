export const FASTIFY_CORS_CONFIG = {
  allowedHeaders:
    "Origin, Content-Type, X-Requested-With, Authorization, Accept, append, delete, entries, foreach, get, has, keys, set, values, *",
  methods: "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS",
  optionsSuccessStatus: 204,
  origin: "*",
  preflightContinue: true,
};
