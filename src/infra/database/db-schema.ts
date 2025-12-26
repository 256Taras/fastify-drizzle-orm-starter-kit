import { auditLogs } from "#modules/audits/audits.model.ts";
import { authPasswordResetTokens } from "#modules/auth/auth-password-reset-token.model.ts";
import { authTokens } from "#modules/auth/auth-token.model.ts";
import { bookings } from "#modules/bookings/bookings.model.ts";
import { payments } from "#modules/payments/payments.model.ts";
import { providers } from "#modules/providers/providers.model.ts";
import { reviews } from "#modules/reviews/reviews.model.ts";
import { services } from "#modules/services/services.model.ts";
import { users } from "#modules/users/users.model.ts";

export const schema = {
  auditLogs,
  authPasswordResetTokens,
  authTokens,
  bookings,
  payments,
  providers,
  reviews,
  services,
  users,
};
