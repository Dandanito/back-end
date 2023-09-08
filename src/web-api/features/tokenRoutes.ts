import { Express } from 'express';
import { err, ok } from 'never-catch';
import { FEATURES } from '../../utils/features';
import login from '../../features/token/actions/login';
import { UserModel } from '../../features/user/schema';
import logout from '../../features/token/actions/logout';
import extend from '../../features/token/actions/extend';
import whoAmI from '../../features/token/actions/whoAmI';
import { TokenModel } from '../../features/token/schema';
import verify from '../../features/token/actions/verify';
import client_log_message from '../middlewares/client_log_message';
const axios = require('axios');

const LoginRoute = '/login';
const LogoutRoute = '/logout';
const ExtendRoute = '/extend';
const WhoAmIRoute = '/whoAmI';
const VerifyRoute = '/verify';

const token = (app: Express) => {
    /**
     * @swagger
     * /login:
     *   post:
     *     summary: Login with provided data.
     *     description: Login with provided data.
     *     tags:
     *      - Token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *               emailAddress:
     *                 type: string
     *               password:
     *                 type: string
     *               captcha:
     *                 type: string
     *             example:
     *               username: "testUserName"
     *               password: "12345678"
     *               captcha: "03ADUVZwAHn1K5Z0p8QP7_IjBN_C9UOI15XQicLKUOjZpa1QTqpDiojxE8w9oC7C6TiZw6gA-gu3RjmKuLGOajA77ZwixcV3YFyiyw_0bIz8XR2cqSEs2SQGGngsUaTAwb44XsIcfePzZmIdwzwLlvDQlg5WXpbb0Id-AoQ9Dd_fNHcbIpe4L_8_70ONCWW0ZyZxhZ9lY2g5KLdyiyZ7u7MbZRFE8gnBMhH2MsteOu6tkOrl8chWMdJ2_Rn5b4p4MTw7Q5WC82GdoN_eGWK-QrjLiWbPVYuz_PSFsRqHq2VkXx4PIR6jxuy2yN0k1Qhe1xSXKHVFGcBr6byS_8JtsoTDVszSq3PKjk6LzYzoSkryOpbdpteYHV2kMBAeVbot2be3DY1I_H2C_xvlcSHSFKWVwsXr7DJyMyU7Wrsr_B2AAHsr0TY_5RFZ46agwjmiNSXO3s6VeoC2pbHd-pWSEen6LyXo9T_QAlY7YKrdCw0jWV9r7UGVmmuZsYoezdvay4FInugAYKI4c0mqldonnYekpXyGtfHoTXG719SlK75W9mB4Fl3F1sJb4HDseDUOlbI9rYuH0l5LvFCHc2nGL_uaRWK8kPMAo-1OdoxY2uOMVeW6xfY6TsrNgAuUlJ6H3-SDZuo-ItH1m12j8qbKClrlPVPEIq8Z6HiB5PQc3KsSv9Cvms7aO-1aLEKTBJGBtd9lCgVgPdlhnTHwt7okv-HcU1vua6qCcIaAviuYKXTnAphqHXhkpuj4avV7cmaM_ZKJEABx8_vKLTc5cmhFEVdQEnNagyx64u9UMnHM-BJBUsw8Q092QiuO-Vd9_GYFTjO8p_R3UVNzUSzfTHSHwSXbKZhT_R0u8Uz4PfyCubLGzsLAWslC_2PKCCw_Wn-fBljzU7OFX_W-q-A2FAEx_LYJXa4hH0U7tFvDi7EJkMqli-NMo4kOW2UzQzTttStzNFUsUI7sUCq7Tg51Tevx26hdy2l_3KNO06FuUJB5Cq0inUiAEl2nNSJCW5E4mLkUSWPsQcDPKWfnFvMSHpLtqweROXnm4vVt6PWnjx67mT54Js-mcchl9sBo4m2nGpBSjkgPGyJ5m8GdrG--hqxyvAHXjhzdzTF3-wjXQsU1MJB8g7f1DVFFpiJ-xMWaeCJ7nbrFFTqvMkUagM83jnsTunU7hsguMcjmkYK4mMIqJ-A9yGNAkvW5j4SLIM6L_XzT5PNIlEoiyNp-wimccncK1z48o6ClAgy9X7c3B7el5eq2_89TWMiu7jOtZTuPLhhZy6k2X89fNf6EiggeJ_ww-6i_Wi12UhL-SgShETVypb4Iqghx5HfDpKlj9cgVRj_adtjM5TLHOuNoRMsMjyao2MmyXWQHSjrMZaru7SlJtbro3ojXFSeQn8Ftf1SNRv5vymSoo3iNMh6bzDxlvHlxqo6qUtCjQGzGpWgmqyD_mHF17oPCnzyoBxaFmxKWLT3bKlkDSVx6802YCw-x4yisXqtuWxH-tOURENzaCXJlf0-ceXgqvicbYVqnfECA9i48fiDFGtHdyurFL3Ck9IMrTr7FBNiTOfsiqEzrgqLMKYd3fB9pBhunr6HMQ0BcMCXcw-bMwpKMTS4vZBS4sQ5dn2Ww8554RhGW6EPO7cF0XxsltEGUjlxgEzuzs-Fs3dbW0MKVebBq5ALS8VqNCZXWA8nUlbTtbgvWJuJLHo_2QRi8tsaRWgelH_bb9ZaBW2dfYdhdfiFKpk_jTbQS-hti2-qWVjK7Zg0p08Bw"
     *     responses:
     *       '100':
     *         description: User logged in successfully.
     */
    app.post(
        LoginRoute,
        client_log_message(LoginRoute, async (req, _res, client) => {
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

            // parse
            const parsedLoginInfoResult = UserModel.Parse(
                {
                    emailAddress: req.body.emailAddress,
                    phoneNumber: req.body.phoneNumber,
                    password: req.body.password,
                },
                ['password'] as const,
                ['emailAddress', 'phoneNumber'] as const
            );
            if (!parsedLoginInfoResult.ok) {
                let code;
                switch (parsedLoginInfoResult.error) {
                    case 'emailAddress':
                        code = 201;
                        break;
                    case 'password':
                        code = 202;
                        break;
                    case 'phoneNumber':
                        code = 204;
                        break;
                }
                return err({
                    feature: FEATURES.Token,
                    code
                });
            }
            // action
            const actionResult = await login(
                { client: client },
                parsedLoginInfoResult.value
            );
            if (!actionResult.ok) {
                const [code, data] = actionResult.error;
                return err({
                    feature: FEATURES.Token,
                    code,
                    data
                });
            }

            return ok({
                feature: FEATURES.Token,
                code: 100,
                data: {
                    token: actionResult.value
                },
                userID: actionResult.value.userID
            });
        })
    );

    /**
     * @swagger
     * /logout:
     *   post:
     *     summary: Logout with provided data.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Logout with provided data.
     *     tags:
     *      - Token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *             example:
     *     responses:
     *       '100':
     *         description: User logged in successfully.
     */
    app.post(
        LogoutRoute,
        client_log_message(LogoutRoute, async (req, _res, client) => {
            // parse
            const secret = TokenModel.secret.Parse(req.headers.secret);
            if (secret === undefined) {
                return err({
                    feature: FEATURES.Token,
                    code: 101,
                    data: undefined
                });
            }

            // action
            const actionResult = await logout({ client }, secret);
            if (!actionResult.ok) {
                const [code, data] = actionResult.error;
                return err({
                    feature: FEATURES.Token,
                    code,
                    data
                });
            }

            return ok({
                feature: FEATURES.Token,
                code: 100,
                data: {
                    id: actionResult.value.id
                },
                userID: actionResult.value.userID
            });
        })
    );
    app.patch(
        ExtendRoute,
        client_log_message(ExtendRoute, async (req, _res, client) => {
            // parse
            const secret = TokenModel.secret.Parse(req.headers.secret);
            if (secret === undefined) {
                return err({
                    feature: FEATURES.Token,
                    code: 101,
                    data: undefined
                });
            }

            //action
            const actionResult = await extend({ client }, secret);
            if (!actionResult.ok) {
                const [code, data] = actionResult.error;
                return err({
                    feature: FEATURES.Token,
                    code,
                    data
                });
            }

            return ok({
                feature: FEATURES.Token,
                code: 100,
                data: {
                    token: actionResult.value
                },
                userID: actionResult.value.userID
            });
        })
    );
    app.get(
        WhoAmIRoute,
        client_log_message(WhoAmIRoute, async (req, _res, client) => {
            // parse
            const secret = TokenModel.secret.Parse(req.headers.secret);
            if (secret === undefined) {
                return err({
                    feature: FEATURES.Token,
                    code: 101
                });
            }

            // action
            const actionResult = await whoAmI({ client: client }, secret);
            if (!actionResult.ok) {
                const [code, data] = actionResult.error;
                return err({
                    feature: FEATURES.Token,
                    code,
                    data
                });
            }

            return ok({
                feature: FEATURES.Token,
                code: 100,
                histories: [],
                data: actionResult.value,
                userID: actionResult.value.user.id
            });
        })
    );
    app.get(
        VerifyRoute,
        client_log_message(VerifyRoute, async (req, _res, client) => {
            // parse
            const secret = TokenModel.secret.Parse(req.headers.secret);
            if (secret === undefined) {
                return err({
                    feature: FEATURES.Token,
                    code: 101
                });
            }

            // action
            const actionResult = await verify({ client }, secret);
            if (!actionResult.ok) {
                const [code, data] = actionResult.error;
                return err({
                    feature: FEATURES.Token,
                    code,
                    data
                });
            }

            return ok({
                feature: FEATURES.Token,
                code: 100,
                histories: [],
                userID: actionResult.value.userID
            });
        })
    );
};

export default token;
