type Error =
    | [201] /* invalid title */
    | [202] /* invalid description */
    | [203] /* invalid price */
    | [204] /* invalid id */
    | [205] /* at least one change is required */
    | [206] /* invalid lab id */
    | [301] /* permission denied */
    | [302] /* product does not exist */
    | [401, unknown]

export default Error;