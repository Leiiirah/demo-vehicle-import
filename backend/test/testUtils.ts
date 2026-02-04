import { randomUUID } from 'crypto';

/**
 * Generates a valid UUID that should not exist in the database.
 * Useful for 404 tests without triggering Postgres UUID parsing errors.
 */
export function nonExistingUuid(): string {
  return randomUUID();
}
