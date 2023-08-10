type Error =
    | [201] /* invalid lab id */
    | [202] /* invalid product id */
    | [203] /* invalid description */
    | [301] /* permission denied */
    | [302] /* lab does not exist */
    | [303] /* product does not exist */
    | [401, unknown]

export default Error;