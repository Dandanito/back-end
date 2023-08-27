type Error =
    | [201] /* emailAddress or phoneNumber are required */
    | [301] /* permission denied for role */
    | [302] /* user already exists */
    | [401, unknown]

export default Error