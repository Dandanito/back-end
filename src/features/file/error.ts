type Error =
    | [200] /* general */
    | [201] /* invalid uuid */
    | [202] /* invalid feature */
    | [203] /* invalid file */
    | [204] /* no files to update */
    | [301] /* file not found */
    | [302] /* upload is not enabled for this feature */
    | [303] /* size limit */
    | [304] /* extension limit */
    | [401, unknown] /* db error */
    | [402, unknown] /* io error */
    | [403] /* limits constant not found */

export default Error;
