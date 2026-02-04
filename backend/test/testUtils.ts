import { randomUUID } from 'crypto';

/**
 * Generates a valid UUID that should not exist in the database.
 * Useful for 404 tests without triggering Postgres UUID parsing errors.
 */
export function nonExistingUuid(): string {
  return randomUUID();
}

/**
 * Generates a highly-unique code string for test data (prevents collisions across
 * parallel Jest workers and repeated runs against the same DB).
 */
export function uniqueCode(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
