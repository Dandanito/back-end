type Error =
    | [201] /* invalid lab id */
    | [202] /* invalid product id */
    | [203] /* invalid description */
    | [204] /* at least 1 property should be edited */
    | [301] /* permission denied */
    | [302] /* lab does not exist */
    | [303] /* product does not exist */
    | [304] /* order does not exist */
    | [305] /* order is not editable */
    | [401, unknown]

export default Error;