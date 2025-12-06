import { Type } from "@sinclair/typebox";

const TimestampSchema = {
  createdAt: Type.Object({ createdAt: Type.String({ format: "date-time" }) }),
  updatedAt: Type.Object({ updatedAt: Type.String({ format: "date-time" }) }),
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
const IdSchema = Type.Object({ id: Type.String({ format: "uuid" }) }, { additionalProperties: false });

export const headers = HeaderSchema;
export const id = IdSchema;
export const status = StatusSchema;
export const timestamp = Type.Intersect([TimestampSchema.createdAt, TimestampSchema.updatedAt]);
