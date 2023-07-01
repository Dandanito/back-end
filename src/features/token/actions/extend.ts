import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { Connection } from '../../../utils/connection';
import { generateToken } from '../util';
import { Constants } from '../constant';

const extend = async (
    connection: Omit<Connection, 'userID'>,
    secret: TokenModel['secret']
): Promise<
    Result<TokenModel<
                ['id', 'userID', 'secret', 'createdAt', 'expireAt']
                >,
        Error
        >
    > => {

    // validation
    const checkValidationResult = checkValidation(secret);
    if (!checkValidationResult.ok) {
        return checkValidationResult;
    }

    // expire and remained time
    const checkExpireAndRemainedTimeResult = await checkExpireAndRemainedTime(
        connection,
        secret
    );
    if (!checkExpireAndRemainedTimeResult.ok) {
        return checkExpireAndRemainedTimeResult;
    }
    const userID = checkExpireAndRemainedTimeResult.value.userID;
    const tokenID = checkExpireAndRemainedTimeResult.value.id;

    // extend
    const extendTokenResult = await extendToken(
        { client: connection.client, userID },
        tokenID
    );
    if (!extendTokenResult.ok) {
        return extendTokenResult;
    }

    return ok(extendTokenResult.value.token);
};

const checkValidation = (
    secret: TokenModel['secret']
): Result<undefined, Error> => {
    if (!TokenModel.secret.Validate(secret)) {
        return err([203]);
    }

    return ok(undefined);
};

const checkExpireAndRemainedTime = async (
    { client }: Omit<Connection, 'userID'>,
    secret: TokenModel['secret']
): Promise<Result<TokenModel<['id', 'userID']>, Error>> => {
    // get token
    const tokenResult = await Token.select(
        ['id', 'userID', 'createdAt', 'expireAt'] as const,
        context => context.colCmp('secret', '=', secret)
    ).exec(client, ['get', 'one']);
    if (!tokenResult.ok) {
        return err(
            tokenResult.error === false ? [306] : [401, tokenResult.error]
        );
    }

    // expire time
    const now = new Date();
    if (tokenResult.value.expireAt < now) {
        return err([308]);
    }

    if (
        now.getTime() - tokenResult.value.createdAt.getTime() <
        Constants.ExtendMinimumLife
    ) {
        return err([307]);
    }

    return ok({ id: tokenResult.value.id, userID: tokenResult.value.userID });
};

const extendToken = async (
    { client, userID }: Connection,
    id: TokenModel['id']
): Promise<
    Result<
        {
            token: TokenModel<
                ['id', 'userID', 'secret', 'createdAt', 'expireAt']
                >;
        },
        Error
        >
    > => {
    const tokenResult = await generateToken({ client, userID });
    if (!tokenResult.ok) {
        return tokenResult;
    }
    const sets = {
        secret: tokenResult.value.secret,
        createdAt: tokenResult.value.createdAt,
        expireAt: tokenResult.value.expireAt
    };

    const extendedToken = await Token.update(
        sets,
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(client, ['get', 'one']);
    if (!extendedToken.ok) {
        return err([401, extendedToken.error]);
    }

    return ok({
        token: {
            id: extendedToken.value.id,
            ...tokenResult.value
        }
    });
};

export default extend;
export { checkValidation, checkExpireAndRemainedTime, extendToken };
