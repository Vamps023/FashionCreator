import { ProjectDocumentSchema, ProjectDocumentValidated } from './zodSchemas';

export interface MigrationResult {
  success: boolean;
  document?: ProjectDocumentValidated;
  error?: string;
  migrated: boolean;
  fromVersion?: number;
}

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Validates and migrates raw JSON project payloads safely.
 */
export function validateAndMigrateProject(raw: unknown): MigrationResult {
  if (!raw || typeof raw !== 'object') {
    return {
      success: false,
      error: 'Invalid project format: document must be an object',
      migrated: false
    };
  }

  const obj = raw as Record<string, unknown>;
  const version = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;

  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      error: `Unsupported future schema version (${version}). Please update 3D Fashion Studio to open this project.`,
      migrated: false,
      fromVersion: version
    };
  }

  // Currently at version 1 baseline
  const parseResult = ProjectDocumentSchema.safeParse(raw);

  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
      .slice(0, 3)
      .join('; ');
    return {
      success: false,
      error: `Project validation failed (${errorDetails})`,
      migrated: false
    };
  }

  return {
    success: true,
    document: parseResult.data,
    migrated: false,
    fromVersion: version
  };
}
