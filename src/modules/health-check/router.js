import { executionAsyncId } from "node:async_hooks";
import { exec } from "node:child_process";
import os from "node:os";
import { performance } from "node:perf_hooks";

import { sql } from "drizzle-orm";

import schemas from "#modules/health-check/schemas.js";

//const version = "1.0.0";

// Exporting a constant named `autoPrefix` will tell
// to `fastify-autoload` that this plugin must be loaded
// with the prefix option. In this way every route declared
// inside this plugin and its children will have the prefix
// as part of the path.
export const autoPrefix = "/_app";

const checkEventLoopLag = () =>
  new Promise((resolve) => {
    const start = performance.now();
    setImmediate(() => {
      const lag = performance.now() - start;
      resolve(lag);
    });
  });

const checkDiskSpace = async () =>
  new Promise((resolve, reject) => {
    if (os.platform() === "win32") {
      exec("wmic logicaldisk get size,freespace,caption", (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const lines = stdout.trim().split("\n");
        const disks = lines.slice(1).map((line) => {
          const [caption, freeSpace, size] = line.trim().split(/\s+/);
          return {
            filesystem: caption,
            free: Number.parseInt(freeSpace, 10),
            size: Number.parseInt(size, 10),
          };
        });
        resolve(disks);
      });
    } else {
      exec("df -kP", (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const lines = stdout.trim().split("\n");
        const disks = lines.slice(1).map((line) => {
          const parts = line.split(/\s+/);
          return {
            filesystem: parts[0],
            free: Number.parseInt(parts[3], 10) * 1024,
            mount: parts[5],
            size: Number.parseInt(parts[1], 10) * 1024,
          };
        });
        resolve(disks);
      });
    }
  });

/**
 * Fastify tries not to impose you any design decision, but we highly
 * recommend to use the Fastify plugin system, as it gives you some neat features,
 * such as the load orders and the guarantee that every part of your application
 * has been loaded before start listening to incoming requests.
 * See https://www.fastify.io/docs/latest/Plugins/.
 * For this reason routes and business logic should always wrapped inside plugins,
 * but you should never use `fastify-plugin` in this case, as you don't want to leak
 * your business logic or custom plugins to the rest of the application.
 *
 * As you will see the project structure is very boring™,
 * and this is on purpose. You don't need to think about how
 * anything should be done, that's simple! Do you need to declare
 * a set of routes? Plugin! Do you want to wrap each domain of your
 * application in a different folder? Plugin! Do you need to interact with the
 * request/response? Hook! And everytime the function signature will be the same.
 * Why we designed Fastify in this way? Because boring things are predictable.
 * You can have homogeneous or heterogeneous team, and the result will always
 * be the same. The entry barrier in the codebase will be low and everyone
 * will be able to undertand what's happening.
 *
 * It's always a good idea to expose a status route, so you can quickly
 * understand if your application is running and which version is deployed.
 */

/**
 * @type {import("fastify").FastifyPluginAsync}
 */
export default async (fastify) => {
  /**
   *    There are two ways of declaring routes in Fastify,
   *    the "full" declaration and the "shorthand" declaration.
   *    The "shorthand" declaration is very similar to Express.
   *    Both can do the same things, there are no differences.
   *    I prefer the "full" declaration as I like to be explicit.
   *    @see https://www.fastify.io/docs/latest/Reference/Routes/
   */
  fastify.get(
    "/healthcheck/basic",
    {
      /**
       *      Fastify does an extensive use of JSON schemas.
       *      It uses them for validating external input
       *      (thanks to https://github.com/ajv-validator/ajv)
       *      or improving the serialization speed of responses
       *      (thanks to https://github.com/fastify/fast-json-stringify).
       *      Since writing plain JSON schema is rather boring
       *      and error prone, we have created `fluent-json-schema`,
       *      a nice library to help you maintaining JSON schemas.
       *      Another reason to write your route definition with
       *      the schema configured, is that you will get automatic
       *      documentation with https://github.com/fastify/fastify-swagger
       */
      schema: schemas.basic,
    },
    async () => ({
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now(),
      uptime: process.uptime(),
    }),
  );

  fastify.get("/healthcheck/extended", {
    async handler() {
      let dbStatus;
      try {
        // @ts-ignore - db is defined in Dependencies but TypeScript can't infer it properly
        // @ts-ignore - this context is extended with diContainer but TypeScript can't infer it
        await this.diContainer.cradle.db.execute(sql`SELECT 1 + 1 as healthcheck`);
        dbStatus = true;
      } catch {
        dbStatus = false;
      }

      const eventLoopLag = await checkEventLoopLag();
      const diskSpace = await checkDiskSpace();

      const activeRequests = {
        currentAsyncId: executionAsyncId(),
      };

      return {
        activeRequests,
        database: {
          status: dbStatus ? "connected" : "disconnected",
        },
        diskSpace,
        environment: process.env.NODE_ENV || "development",
        eventLoopLag,
        memoryUsage: process.memoryUsage(),
        osLoad: os.loadavg(),
        pid: process.pid,
        timestamp: Date.now(),
        uptime: process.uptime(),
        versions: {
          application: process.env.VERSION,
          fastify: fastify.version,
          node: process.version,
        },
      };
    },
    schema: schemas.extended,
  });
};
