type Error =
    | [301] /* permission denied for role */
    | [401, unknown]

export default Error