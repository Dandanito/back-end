import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { Connection } from '../../../utils/connection';

const verify = async (
    { client }: Omit<Connection, 'user'>,
    secret: TokenModel['secret']
): Promise<Result<TokenModel<['userID', 'role']>, Error>> => {
    // validation
    if (!TokenModel.secret.Validate(secret)) {
        return err([203]);
    }

    // verify secret
    const tokenResult = await Token.select(
        ['userID', 'role', 'expireAt'] as const,
        context => context.colCmp('secret', '=', secret)
    ).exec(client, ['get', 'one']);
    if (!tokenResult.ok) {
        return err(
            tokenResult.error === false ? [306] : [401, tokenResult.error]
        );
    }
    const now = new Date();
    if (tokenResult.value.expireAt.getTime() < now.getTime()) {
        return err([308]);
    }

    return ok({ userID: tokenResult.value.userID, role: tokenResult.value.role });
};

export default verify;
