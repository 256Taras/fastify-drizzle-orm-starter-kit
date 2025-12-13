import { partial } from "rambda";

import { passwordChangedTemplate, passwordResetTemplate } from "./templates/index.js";

/** @type {(deps: Dependencies, input: { email: string; resetToken: string; resetUrl: string }) => Promise<void>} */
const sendPasswordResetEmail = async ({ logger }, { email, resetToken, resetUrl }) => {
  const template = passwordResetTemplate({ resetUrl });

  logger.info(
    { email, resetToken, resetUrl, subject: template.subject },
    "[EmailService] [MOCK] Password reset email would be sent",
  );
};

/**
 * @type {(deps: Dependencies, input: { email: string }) => Promise<void>}
 */
const sendPasswordChangedEmail = async ({ logger }, { email }) => {
  const template = passwordChangedTemplate();

  logger.info({ email, subject: template.subject }, "[EmailService] [MOCK] Password changed email would be sent");
};

/** @type {(deps: Dependencies) => EmailService} */
export default function emailService(deps) {
  return {
    sendPasswordChangedEmail: partial(sendPasswordChangedEmail, [deps]),
    sendPasswordResetEmail: partial(sendPasswordResetEmail, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/**
 * @typedef {object} EmailService
 * @property {(input: { email: string; resetToken: string; resetUrl: string }) => Promise<void>} sendPasswordResetEmail
 * @property {(input: { email: string }) => Promise<void>} sendPasswordChangedEmail
 */
