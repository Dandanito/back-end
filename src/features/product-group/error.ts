type Error =
    | [201] /* invalid title */
    | [301] /* permission denied */
    | [401, unknown]

export default Error;