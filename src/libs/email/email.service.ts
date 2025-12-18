import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { passwordChangedTemplate, passwordResetTemplate } from "./templates/index.ts";

interface SendPasswordChangedEmailInput {
  email: string;
}

interface SendPasswordResetEmailInput {
  email: string;
  resetToken: string;
  resetUrl: string;
}

const sendPasswordResetEmail = ({ logger }: Cradle, { email, resetToken, resetUrl }: SendPasswordResetEmailInput): void => {
  const template = passwordResetTemplate({ resetUrl });

  logger.info(
    { email, resetToken, resetUrl, subject: template.subject },
    "[EmailService] [MOCK] Password reset email would be sent",
  );
};

const sendPasswordChangedEmail = ({ logger }: Cradle, { email }: SendPasswordChangedEmailInput): void => {
  const template = passwordChangedTemplate();

  logger.info({ email, subject: template.subject }, "[EmailService] [MOCK] Password changed email would be sent");
};

export interface EmailService {
  sendPasswordChangedEmail: (input: SendPasswordChangedEmailInput) => void;
  sendPasswordResetEmail: (input: SendPasswordResetEmailInput) => void;
}

export default function emailService(deps: Cradle): EmailService {
  return {
    sendPasswordChangedEmail: partial(sendPasswordChangedEmail, [deps]),
    sendPasswordResetEmail: partial(sendPasswordResetEmail, [deps]),
  };
}
