import Error from '../error';
import { UserModel } from '../../user/schema';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { Connection } from '../../../utils/connection';

const logoutAll = async (
    connection: Omit<Connection, 'user'>,
    id: UserModel['id']
): Promise<Result<{
    ids: TokenModel['id'][];
    userID: TokenModel['userID'];
},
    Error>> => {
    // validation
    if (!UserModel.id.Validate(id)) {
        return err([205]);
    }

    // remove tokens
    const removeTokensResult = await removeTokens({
            client: connection.client
        },
        id);
    if (!removeTokensResult.ok) {
        return removeTokensResult;
    }

    return ok(removeTokensResult.value);
};

const removeTokens = async ({
                                client
                            }: Omit<Connection, 'user'>, userID: UserModel['id']): Promise<Result<{
    ids: TokenModel['id'][];
    userID: TokenModel['userID'];
},
    Error>> => {
    const removedTokensResult = await Token.delete(
        context => context.colCmp('userID', '=', userID),
        ['id'] as const
    ).exec(client, []);
    if (!removedTokensResult.ok) {
        return err([401, removedTokensResult.error]);
    }

    return ok({
        ids: removedTokensResult.value.map(v => v.id),
        userID
    });
};

export default logoutAll;
export { removeTokens };
