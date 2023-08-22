type Error =
    | [201] /* invalid title */
    | [202] /* invalid description */
    | [203] /* invalid price */
    | [204] /* invalid productGroup */
    | [205] /* at least one change is required */
    | [206] /* invalid lab id */
    | [207] /* invalid file uuid */
    | [208] /* discount and discountType should be both defined or undefined */
    | [209] /* invalid product group */
    | [210] /* invalid discount */
    | [211] /* invalid discount type */
    | [212] /* invalid product id */
    | [301] /* permission denied */
    | [302] /* product does not exist */
    | [303] /* edit order row does not exist */
    | [304] /* edit order row does not exist */
    | [401, unknown]

export default Error;