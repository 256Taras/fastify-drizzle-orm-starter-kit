import { Type } from "@sinclair/typebox";

import { TypeDateTimeString, TypeUuid } from "#libs/utils/schemas.ts";

const TimestampSchema = {
  createdAt: Type.Object({ createdAt: TypeDateTimeString() }),
  updatedAt: Type.Object({ updatedAt: TypeDateTimeString() }),
};

const HeaderSchema = {
  authorization: Type.Object({
    Authorization: Type.String(),
  }),
  authorizationApiKey: Type.Object({
    apiKey: Type.String(),
  }),
};

const StatusSchema = Type.Object({ status: Type.Boolean() }, { additionalProperties: false });
const IdSchema = Type.Object({ id: TypeUuid() }, { additionalProperties: false });

export const headers = HeaderSchema;
export const id = IdSchema;
export const status = StatusSchema;
export const timestamp = Type.Intersect([TimestampSchema.createdAt, TimestampSchema.updatedAt]);
