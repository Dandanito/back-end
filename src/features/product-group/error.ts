type Error =
    | [201] /* invalid title */
    | [202] /* invalid id */
    | [301] /* permission denied */
    | [302] /* product group does not exist */
    | [401, unknown]

export default Error;