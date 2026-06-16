export interface Schema<T> {
  safeParse(data: unknown):
    | { success: true; data: T }
    | {
        success: false;
        error: {
          issues: ReadonlyArray<Issue>;
        };
      };
}

export interface Issue {
  path: ReadonlyArray<PropertyKey>;
  message: string;
}

export class ConfigValidationError extends Error {
  public readonly issues: readonly Issue[];

  constructor(configPath: string, issues: readonly Issue[]) {
    super(
      `Error validating config ${configPath}:\n${prettyFormatIssues(issues)}`,
    );

    this.issues = issues;
  }
}

export function prettyFormatIssues(issues: readonly Issue[]) {
  return issues
    .map((issue) => {
      const path = issue.path.length
        ? issue.path.map(String).join(".")
        : "(root)";

      return `  • ${path}: ${issue.message}`;
    })
    .join("\n");
}
