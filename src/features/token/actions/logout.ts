import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { Connection } from '../../../utils/connection';

const logout = async (
    { client }: Omit<Connection, 'user'>,
    secret: TokenModel['secret']
): Promise<
    Result<
        {
            id: TokenModel['id'];
            userID: TokenModel['userID'];
        },
        Error
        >
    > => {
    // validation
    if (!TokenModel.secret.Validate(secret)) {
        return err([203]);
    }

    // remove
    const removeToken = await Token.delete(
        context => context.colCmp('secret', '=', secret),
        ['id', 'userID'] as const
    ).exec(client, ['get', 'one']);
    if (!removeToken.ok) {
        return err(
            removeToken.error === false ? [306] : [401, removeToken.error]
        );
    }

    return ok({
        id: removeToken.value.id,
        userID: removeToken.value.userID
    });
};

export default logout;
