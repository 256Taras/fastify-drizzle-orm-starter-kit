export interface PasswordResetTemplateResult {
  html: string;
  subject: string;
  text: string;
}

export function passwordResetTemplate({ resetUrl }: { resetUrl: string }): PasswordResetTemplateResult {
  return {
    subject: "Password Reset Request",
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `
Reset Your Password

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `.trim(),
  };
}
