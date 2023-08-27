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

const LoginRoute = '/login';
const LogoutRoute = '/logout';
const ExtendRoute = '/extend';
const WhoAmIRoute = '/whoAmI';
const VerifyRoute = '/verify';

const token = (app: Express) => {
    app.post(
        LoginRoute,
        client_log_message(LoginRoute, async (req, _res, client) => {
            // parse
            const parsedLoginInfoResult = UserModel.Parse(
                {
                    username: req.body.username,
                    password: req.body.password
                },
                ['password'],
                ['emailAddress', 'phoneNumber']
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
                code: 7898,
                data: {
                    token: actionResult.value
                },
                userID: actionResult.value.userID
            });
        })
    );
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
                code: 7898,
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
                code: 7898,
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
                code: 7898,
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
                code: 7898,
                histories: [],
                userID: actionResult.value.userID
            });
        })
    );
};

export default token;
