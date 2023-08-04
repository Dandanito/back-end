type Error =
    | [201] /* invalid title */
    | [202] /* invalid id */
    | [203] /* invalid file uuid */
    | [204] /* at least one change is required */
    | [301] /* permission denied */
    | [302] /* product group does not exist */
    | [303] /* file uuid is the same */
    | [401, unknown]

export default Error;