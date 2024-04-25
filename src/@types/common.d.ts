import { TSchema } from "@sinclair/typebox";

import type { CONFIG_SCHEMA } from "#configs/env.config";
import type * as Config from "#configs/index";

declare global {
  type Static<T extends TSchema, P extends unknown[] = []> = (T & {
    params: P;
  })["static"];
}

export declare type Env = Static<typeof CONFIG_SCHEMA>;
export declare type Configs = typeof Config;
