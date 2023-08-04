type ValidationError =
    | [200] /* general */
    | [201] /* invalid uuid */
    | [202] /* invalid feature */
    | [203] /* invalid file */;

type RuleError =
    | [301] /* file not found */
    | [302] /* upload is not enabled for this feature */
    | [303] /* size limit */
    | [304] /* extension limit */;

type Error = Readonly<
    | ValidationError
    | RuleError
    | [401, unknown] /* db error */
    | [402, unknown] /* io error */
    | [403] /* limits constant not found */
>;

export type { Error };
