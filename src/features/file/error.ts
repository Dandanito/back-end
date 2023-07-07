type ValidationError =
    | [200] /* general */
    | [201] /* invalid id */
    | [202] /* invalid file type */;

type RuleError = [301] /* file not found */;

type Error = Readonly<ValidationError | RuleError | [401, unknown]>;

export type { Error };
