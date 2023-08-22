import { pool } from '../../db';
import logError from '../utils/logError';
import { Request, Response } from 'express';
import { err, ok, Result } from 'never-catch';
import { FEATURES } from '../../utils/features';
import addLog from '../../features/log/actions/add';
import { Connection } from '../../utils/connection';
import evalClientData from '../utils/evalClientData';
import { UserModel } from '../../features/user/schema';

const client_log_message =
    (
        api: string,
        action: (
            req: Request,
            res: Response,
            client: Connection['client']
        ) => Promise<
            Result<
                {
                    feature: keyof typeof FEATURES | null;
                    code: number;
                    data?: unknown;
                    userID?: UserModel['id'];
                },
                {
                    feature: keyof typeof FEATURES | null;
                    code: number;
                    data?: unknown;
                }
            >
        >
    ) =>
    async (req: Request, res: Response) => {
        const response = await pool
            .transaction(async client => {
                // action
                const actionResult = await action(req, res, client);
                if (!actionResult.ok) {
                    return actionResult;
                }
                const response = actionResult.value;

                const now = new Date();
                // log
                const addLogResult = await addLog(
                    { client },
                    {
                        api,
                        createdAt: now,
                        headers: JSON.stringify(req.headers),
                        body: JSON.stringify(req.body),
                        response: JSON.stringify(response)
                    }
                );
                if (!addLogResult.ok) {
                    const [code, data] = addLogResult.error;
                    return err({
                        feature: FEATURES.Log,
                        code,
                        data
                    });
                }

                return actionResult.ok ? ok(response) : err(response);
            }, 'serializable')
            .catch(e => err({ feature: null, code: 0, data: e }));

        if (!response.ok) {
            await logError({
                headers: req.headers,
                body: req.body,
                response
            });
        }
        const { feature, code, data } = response.ok
            ? response.value
            : response.error;
        res.send({ feature, code, data: evalClientData(feature, code, data) });
    };

export default client_log_message;
