import { inArray } from "drizzle-orm";

import { providers } from "#modules/providers/providers.model.ts";
import { services } from "#modules/services/services.model.ts";

/**
 * Seed services table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedServices(db, logger) {
  // Get all providers
  const allProviders = await db.select({ id: providers.id, name: providers.name }).from(providers);

  if (allProviders.length === 0) {
    if (logger) {
      logger.warn("No providers found for services seed, skipping");
    }
    return;
  }

  const barbershop = allProviders.find((p) => p.name.includes("Barbershop"));
  const beautySalon = allProviders.find((p) => p.name.includes("Beauty"));
  const autoDetailing = allProviders.find((p) => p.name.includes("Auto"));
  const yogaStudio = allProviders.find((p) => p.name.includes("Yoga"));
  const photography = allProviders.find((p) => p.name.includes("Photography"));

  const seedServices = [
    // Barbershop services
    ...(barbershop
      ? [
          {
            providerId: barbershop.id,
            name: "Classic Haircut",
            description: "Traditional haircut with styling",
            price: 2500,
            duration: 30,
            status: "active",
          },
          {
            providerId: barbershop.id,
            name: "Beard Trim",
            description: "Professional beard shaping and trimming",
            price: 1500,
            duration: 20,
            status: "active",
          },
          {
            providerId: barbershop.id,
            name: "Haircut & Beard Combo",
            description: "Full grooming package",
            price: 3500,
            duration: 45,
            status: "active",
          },
        ]
      : []),
    // Beauty salon services
    ...(beautySalon
      ? [
          {
            providerId: beautySalon.id,
            name: "Women's Haircut",
            description: "Professional haircut and styling",
            price: 4500,
            duration: 60,
            status: "active",
          },
          {
            providerId: beautySalon.id,
            name: "Hair Coloring",
            description: "Full hair coloring service",
            price: 8000,
            duration: 120,
            status: "active",
          },
          {
            providerId: beautySalon.id,
            name: "Manicure",
            description: "Classic manicure with polish",
            price: 2000,
            duration: 45,
            status: "active",
          },
        ]
      : []),
    // Auto detailing services
    ...(autoDetailing
      ? [
          {
            providerId: autoDetailing.id,
            name: "Basic Wash",
            description: "Exterior wash and interior vacuum",
            price: 3000,
            duration: 30,
            status: "active",
          },
          {
            providerId: autoDetailing.id,
            name: "Full Detail",
            description: "Complete interior and exterior detailing",
            price: 15_000,
            duration: 180,
            status: "active",
          },
        ]
      : []),
    // Yoga services
    ...(yogaStudio
      ? [
          {
            providerId: yogaStudio.id,
            name: "Beginner Yoga Class",
            description: "Gentle introduction to yoga",
            price: 1500,
            duration: 60,
            status: "active",
          },
          {
            providerId: yogaStudio.id,
            name: "Power Yoga",
            description: "Intensive yoga workout",
            price: 2000,
            duration: 75,
            status: "active",
          },
          {
            providerId: yogaStudio.id,
            name: "Private Session",
            description: "One-on-one yoga instruction",
            price: 5000,
            duration: 60,
            status: "active",
          },
        ]
      : []),
    // Photography services
    ...(photography
      ? [
          {
            providerId: photography.id,
            name: "Portrait Session",
            description: "Professional portrait photography",
            price: 10_000,
            duration: 60,
            status: "active",
          },
          {
            providerId: photography.id,
            name: "Event Coverage",
            description: "Full event photography coverage",
            price: 50_000,
            duration: 240,
            status: "active",
          },
        ]
      : []),
  ];

  if (seedServices.length === 0) {
    if (logger) {
      logger.warn("No services to seed");
    }
    return;
  }

  // Check for existing services by name and provider
  const existingServices = await db
    .select({ name: services.name, providerId: services.providerId })
    .from(services)
    .where(
      inArray(
        services.providerId,
        seedServices.map((s) => s.providerId),
      ),
    );

  const existingKeys = new Set(existingServices.map((s) => `${s.providerId}-${s.name}`));
  const newServices = seedServices.filter((s) => !existingKeys.has(`${s.providerId}-${s.name}`));

  if (newServices.length === 0) {
    if (logger) {
      logger.info(`All ${seedServices.length} seed services already exist, skipping insert`);
    }
    return;
  }

  await db.insert(services).values(newServices);
  if (logger) {
    logger.info(`✓ Seeded ${newServices.length} new services (${existingServices.length} already existed)`);
  }
}
