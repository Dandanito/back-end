type Error =
    | [201] /* invalid title */
    | [202] /* invalid description */
    | [203] /* invalid price */
    | [301] /* permission denied */
    | [401, unknown]

export default Error;