export const TEST_PASSWORD = "Password123";
export const TEST_NEW_PASSWORD = "NewPassword789";
export const TEST_EMAIL = "test@example.com";

export function generateUniqueEmail(): string {
  const uniqueId = crypto.randomUUID().slice(0, 8);
  return `test-${uniqueId}@example.com`;
}
