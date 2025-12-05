import { TSchema } from "@sinclair/typebox";

import type { CONFIG_SCHEMA } from "#configs/env.config";
import type * as Config from "#configs/index";

declare global {
  type Static<T extends TSchema, P extends unknown[] = []> = ({
    params: P;
  } & T)["static"];
}

export declare type Configs = typeof Config;
export declare type Env = Static<typeof CONFIG_SCHEMA>;
