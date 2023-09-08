import { Express } from 'express';
import client_log_message from '../middlewares/client_log_message';
const axios = require('axios');
import { err, ok } from 'never-catch';
import { FEATURES } from '../../utils/features';
import { UserModel } from '../../features/user/schema';
import signup from '../../features/user/actions/signup';

const UserRoute = '/signup';

const user = (app: Express) => {
    /**
     * @swagger
     * /signup:
     *   post:
     *     summary: Login with provided data.
     *     description: Login with provided data.
     *     tags:
     *      - User
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               captcha:
     *                 type: string
     *               user:
     *                 type: json
     *             example:
     *               user: {
     *                  firstName: "example first name",
     *                  lastName: "example last name",
     *                  address: "example address",
     *                  nationalCode: "example national code",
     *                  hasDelivery: "example has delivery",
     *                  role: 1,
     *                  password: "12345678",
     *                  emailAddress: "example email address",
     *                  phoneNumber: "example phone number"
     *               }
     *               captcha: "03ADUVZwAHn1K5Z0p8QP7_IjBN_C9UOI15XQicLKUOjZpa1QTqpDiojxE8w9oC7C6TiZw6gA-gu3RjmKuLGOajA77ZwixcV3YFyiyw_0bIz8XR2cqSEs2SQGGngsUaTAwb44XsIcfePzZmIdwzwLlvDQlg5WXpbb0Id-AoQ9Dd_fNHcbIpe4L_8_70ONCWW0ZyZxhZ9lY2g5KLdyiyZ7u7MbZRFE8gnBMhH2MsteOu6tkOrl8chWMdJ2_Rn5b4p4MTw7Q5WC82GdoN_eGWK-QrjLiWbPVYuz_PSFsRqHq2VkXx4PIR6jxuy2yN0k1Qhe1xSXKHVFGcBr6byS_8JtsoTDVszSq3PKjk6LzYzoSkryOpbdpteYHV2kMBAeVbot2be3DY1I_H2C_xvlcSHSFKWVwsXr7DJyMyU7Wrsr_B2AAHsr0TY_5RFZ46agwjmiNSXO3s6VeoC2pbHd-pWSEen6LyXo9T_QAlY7YKrdCw0jWV9r7UGVmmuZsYoezdvay4FInugAYKI4c0mqldonnYekpXyGtfHoTXG719SlK75W9mB4Fl3F1sJb4HDseDUOlbI9rYuH0l5LvFCHc2nGL_uaRWK8kPMAo-1OdoxY2uOMVeW6xfY6TsrNgAuUlJ6H3-SDZuo-ItH1m12j8qbKClrlPVPEIq8Z6HiB5PQc3KsSv9Cvms7aO-1aLEKTBJGBtd9lCgVgPdlhnTHwt7okv-HcU1vua6qCcIaAviuYKXTnAphqHXhkpuj4avV7cmaM_ZKJEABx8_vKLTc5cmhFEVdQEnNagyx64u9UMnHM-BJBUsw8Q092QiuO-Vd9_GYFTjO8p_R3UVNzUSzfTHSHwSXbKZhT_R0u8Uz4PfyCubLGzsLAWslC_2PKCCw_Wn-fBljzU7OFX_W-q-A2FAEx_LYJXa4hH0U7tFvDi7EJkMqli-NMo4kOW2UzQzTttStzNFUsUI7sUCq7Tg51Tevx26hdy2l_3KNO06FuUJB5Cq0inUiAEl2nNSJCW5E4mLkUSWPsQcDPKWfnFvMSHpLtqweROXnm4vVt6PWnjx67mT54Js-mcchl9sBo4m2nGpBSjkgPGyJ5m8GdrG--hqxyvAHXjhzdzTF3-wjXQsU1MJB8g7f1DVFFpiJ-xMWaeCJ7nbrFFTqvMkUagM83jnsTunU7hsguMcjmkYK4mMIqJ-A9yGNAkvW5j4SLIM6L_XzT5PNIlEoiyNp-wimccncK1z48o6ClAgy9X7c3B7el5eq2_89TWMiu7jOtZTuPLhhZy6k2X89fNf6EiggeJ_ww-6i_Wi12UhL-SgShETVypb4Iqghx5HfDpKlj9cgVRj_adtjM5TLHOuNoRMsMjyao2MmyXWQHSjrMZaru7SlJtbro3ojXFSeQn8Ftf1SNRv5vymSoo3iNMh6bzDxlvHlxqo6qUtCjQGzGpWgmqyD_mHF17oPCnzyoBxaFmxKWLT3bKlkDSVx6802YCw-x4yisXqtuWxH-tOURENzaCXJlf0-ceXgqvicbYVqnfECA9i48fiDFGtHdyurFL3Ck9IMrTr7FBNiTOfsiqEzrgqLMKYd3fB9pBhunr6HMQ0BcMCXcw-bMwpKMTS4vZBS4sQ5dn2Ww8554RhGW6EPO7cF0XxsltEGUjlxgEzuzs-Fs3dbW0MKVebBq5ALS8VqNCZXWA8nUlbTtbgvWJuJLHo_2QRi8tsaRWgelH_bb9ZaBW2dfYdhdfiFKpk_jTbQS-hti2-qWVjK7Zg0p08Bw"
     *     responses:
     *       '100':
     *         description: User logged in successfully.
     */
    app.post(
        UserRoute,
        client_log_message(
            UserRoute + ':signup',
            async (req, _res, client) => {
                // captcha
                try{
                    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
                        params: {
                            secret: process.env.DANDANITO_CAPTCHA_SECRET_KEY,
                            response: req.body.captcha
                        }
                    });

                    if (response.data.success === undefined || !response.data.success || response.data.score <= 0.5) {
                        return err({
                            feature: FEATURES.User,
                            code: 402,
                            data: JSON.stringify(response)
                        });
                    }
                }catch (e){
                    return err({
                        feature: FEATURES.User,
                        code: 402,
                        data: JSON.stringify(e)
                    })
                }

                const parsedUserResult = await UserModel.Parse(
                    req.body.user,
                    ['firstName', 'lastName', 'address', 'nationalCode', 'password', 'hasDelivery', 'role'] as const,
                    ['emailAddress', 'phoneNumber'] as const,
                    true
                );
                if (!parsedUserResult.ok) {
                    return err({
                        feature: FEATURES.User,
                        code: ({
                            firstName: 202,
                            lastName: 203,
                            address: 204,
                            nationalCode: 205,
                            password: 206,
                            hasDelivery: 207,
                            role: 208,
                            emailAddress: 209,
                            phoneNumber: 210
                        }[parsedUserResult.error])
                    });
                }

                const actionResult = await signup(
                    client,
                    parsedUserResult.value
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.User,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.User,
                    code: 100,
                    data: {
                        id: actionResult.value
                    },
                    userID: actionResult.value
                });
            }
        )
    );
};

export default user;