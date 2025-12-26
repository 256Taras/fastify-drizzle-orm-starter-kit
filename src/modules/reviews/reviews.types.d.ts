import type { Static } from "@sinclair/typebox";

import type {
  REVIEW_CREATE_INPUT_CONTRACT,
  REVIEW_INSERT_CONTRACT,
  REVIEW_OUTPUT_CONTRACT,
  REVIEW_OUTPUT_LIST,
} from "./reviews.contracts.ts";
import type reviewsMutations from "./reviews.mutations.ts";
import type reviewsQueries from "./reviews.queries.ts";
import type reviewsRepository from "./reviews.repository.ts";

import type { User } from "#modules/users/users.contracts.ts";

export type Review = Static<typeof REVIEW_OUTPUT_CONTRACT>;
export type ReviewCreateInput = Static<typeof REVIEW_CREATE_INPUT_CONTRACT>;

export interface ReviewEventPayload {
  review: Review;
  user: User;
}
export type ReviewInsert = Static<typeof REVIEW_INSERT_CONTRACT>;

export type ReviewsListResponse = Static<typeof REVIEW_OUTPUT_LIST>;

declare module "@fastify/awilix" {
  interface Cradle {
    reviewsMutations: ReturnType<typeof reviewsMutations>;
    reviewsQueries: ReturnType<typeof reviewsQueries>;
    reviewsRepository: ReturnType<typeof reviewsRepository>;
  }
}
