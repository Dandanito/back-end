type Error =
    | [200] /* general */
    | [201] /* invalid source id */
    | [202] /* invalid product id */
    | [203] /* invalid description */
    | [204] /* at least 1 property should be edited */
    | [205] /* invalid id */
    | [206] /* invalid count */
    | [207] /* invalid getOptions */
    | [208] /* invalid customer id */
    | [209] /* invalid status */
    | [210] /* invalid order id */
    | [211] /* invalid discount type */
    | [212] /* invalid source type */
    | [213] /* invalid status */
    | [301] /* permission denied */
    | [302] /* lab does not exist */
    | [303] /* product does not exist */
    | [304] /* order does not exist */
    | [305] /* order is not editable */
    | [401, unknown]

export default Error;