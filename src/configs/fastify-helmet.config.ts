export const FASTIFY_HELMET_CONFIG = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" as const },
  crossOriginResourcePolicy: { policy: "same-origin" as const },
  hsts: {
    includeSubDomains: true,
    maxAge: 31_536_000,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" as const },
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: false },
  xDownloadOptions: true,
  xFrameOptions: { action: "deny" as const },
  xPermittedCrossDomainPolicies: { permittedPolicies: "none" as const },
  xXssProtection: true,
} as const;
