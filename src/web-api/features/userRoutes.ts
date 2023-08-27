import { Express } from 'express';
import client_log_message from '../middlewares/client_log_message';
const axios = require('axios');
import { err, ok } from 'never-catch';
import { FEATURES } from '../../utils/features';
import { UserModel } from '../../features/user/schema';
import signup from '../../features/user/actions/signup';

const UserRoute = '/signup';

const user = (app: Express) => {
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
                            response: req.headers.captcha
                        }
                    });

                    if (response.data.score <= 0.5) {
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