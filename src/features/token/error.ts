type Error =
    | [101] /* can not parse secret */
    | [102] /* can not parse username */
    | [103] /* can not parse password */
    | [104] /* can not parse id */
    | [105] /* can not parse user id */
    | [201] /* invalid emailAddress */
    | [202] /* invalid password */
    | [203] /* invalid secret */
    | [204] /* invalid phone number */
    | [205] /* invalid user id */
    | [206] /* at least 1 logon input is required (email/phone) */
    | [301] /* email or phone not found */
    | [302] /* password not match */
    | [305] /* max_session_number limit reached */
    | [306] /* token not found */
    | [307] /* extend_minimum_life limit */
    | [308] /* token expired */
    | [401, unknown] /* db error */

export default Error;
