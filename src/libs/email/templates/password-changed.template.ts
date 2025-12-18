export interface PasswordChangedTemplateResult {
  html: string;
  subject: string;
  text: string;
}

export function passwordChangedTemplate(): PasswordChangedTemplateResult {
  return {
    subject: "Password Changed Successfully",
    html: `
      <h1>Password Changed</h1>
      <p>Your password has been successfully changed.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `,
    text: `
Password Changed

Your password has been successfully changed.

If you didn't make this change, please contact support immediately.
    `.trim(),
  };
}
