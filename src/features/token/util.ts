import Error from './error';
import * as bcryptjs from 'bcryptjs';
import { Constants } from './constant';
import { err, ok, Result } from 'never-catch';
import { User, UserModel } from '../user/schema';
import { Connection } from '../../utils/connection';
import { Token, TOKEN_SECRET_LENGTH, TokenModel } from './schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Crypto = require('crypto');

const checkCredentialAndGetUserID = async (
    { client }: Omit<Connection, 'user'>,
    { emailAddress, phoneNumber, password }: UserModel<['password'], ['emailAddress', 'phoneNumber']>
): Promise<Result<UserModel<['id', 'role']>, Error>> => {
    const userResult = await User.select(['id', 'password', 'role'] as const, context =>
        context.colsOr({
            phoneNumber: ['=', phoneNumber],
            emailAddress: ['=', emailAddress]
        }),
        {
            ignoreInWhere: true
        }
    ).exec(client, ['get', 'one']);
    if (!userResult.ok) {
        return err(
            userResult.error === false ? [301] : [401, userResult.error]
        );
    }
    if (!bcryptjs.compareSync(password, userResult.value.password)) {
        return err([302]);
    }
    return ok(userResult.value);
};

const removeExpiredTokensAndCountTheRest = async ({
                                                      client
                                                  }: Omit<Connection, 'user'>, userID: UserModel['id']): Promise<
    Result<{ number: number }, Error>
    > => {

    const currentTokensResult = await Token.select(
        ['id', 'expireAt'] as const,
        context => context.colCmp('userID', '=', userID)
    ).exec(client, []);
    if (!currentTokensResult.ok) {
        return err([401, currentTokensResult.error]);
    }
    let number = 0;
    const now = new Date();
    const deletingIDs: TokenModel['id'][] = [];
    currentTokensResult.value.forEach(currentToken => {
        if (currentToken.expireAt.getTime() < now.getTime()) {
            deletingIDs.push(currentToken.id);
        } else {
            number++;
        }
    });
    if (deletingIDs.length > 0) {
        const removeResult = await Token.delete(
            context => context.colList('id', 'in', deletingIDs),
            ['id'] as const
        ).exec(client, ['get', deletingIDs.length]);
        if (!removeResult.ok) {
            return err([401, removeResult.error]);
        }
    }

    return ok({ number });
};

const generateUniqueSecret = async ({
                                        client
                                    }: Omit<Connection, 'user'>): Promise<
    Result<TokenModel<['secret']>, Error>
    > => {
    const secret = (await Crypto.randomBytes(TOKEN_SECRET_LENGTH / 2)).toString(
        'hex'
    );
    const checkTokenResult = await Token.select(['id'] as const, context =>
        context.colCmp('secret', '=', secret)
    ).exec(client, ['count', 0]);
    if (!checkTokenResult.ok) {
        return generateUniqueSecret({ client });
    }
    return ok({ secret });
};

const generateToken = async ({
                                 client
                             }: Omit<Connection, 'user'>, user: UserModel<['id', 'role']>): Promise<
    Result<TokenModel<['userID', 'secret', 'createdAt', 'expireAt', 'role']>, Error>
    > => {
    const uniqueSecretResult = await generateUniqueSecret({ client });
    if (!uniqueSecretResult.ok) {
        return uniqueSecretResult;
    }
    const secret = uniqueSecretResult.value.secret;
    const createdAt = new Date();

    return ok({
        userID: user.id,
        role: user.role,
        secret,
        createdAt,
        expireAt: new Date(createdAt.getTime() + Constants.TokenLife)
    });
};

export {
    checkCredentialAndGetUserID,
    removeExpiredTokensAndCountTheRest,
    generateUniqueSecret,
    generateToken
};
