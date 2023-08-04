import Error from '../error';
import { UserModel } from '../../user/schema';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { Connection } from '../../../utils/connection';
import {
    checkCredentialAndGetUserID,
    generateToken,
    removeExpiredTokensAndCountTheRest
} from '../util';
import { Constants } from '../constant';

const login = async (
    connection: Omit<Connection, 'user'>,
    user: UserModel<['password'], ['emailAddress', 'phoneNumber']>
): Promise<Result<TokenModel<['id', 'userID', 'createdAt', 'expireAt', 'secret']>,
    Error>> => {

    // validation
    const checkValidationResult = checkValidation(user);
    if (!checkValidationResult.ok) {
        return checkValidationResult;
    }

    // credential
    const checkCredentialAndGetUserIDResult = await checkCredentialAndGetUserID(
        connection,
        user
    );
    if (!checkCredentialAndGetUserIDResult.ok) {
        return checkCredentialAndGetUserIDResult;
    }
    const userID = checkCredentialAndGetUserIDResult.value;

    // current tokens
    const removeExpiredTokensAndCountTheRestResult =
        await removeExpiredTokensAndCountTheRest({
            client: connection.client
        }, userID);
    if (!removeExpiredTokensAndCountTheRestResult.ok) {
        return removeExpiredTokensAndCountTheRestResult;
    }
    const remainTokenCount =
        removeExpiredTokensAndCountTheRestResult.value.number;

    if (remainTokenCount >= Constants.MaxSessionNumber) {
        return err([305]);
    }

    // add token
    const addTokenResult = await addToken({
        client: connection.client
    }, userID);
    if (!addTokenResult.ok) {
        return addTokenResult;
    }

    return ok(addTokenResult.value);
};

const checkValidation = (
    user: UserModel<['password'], ['emailAddress', 'phoneNumber']>
): Result<undefined, Error> => {
    const userValidation = UserModel.Validate(user);
    if (!userValidation.ok) {
        switch (userValidation.error) {
            case 'emailAddress':
                return err([201]);
            case 'phoneNumber':
                return err([204]);
            case 'password':
                return err([202]);
        }
    }

    if (user.phoneNumber === undefined && user.emailAddress === undefined) {
        return err([206]);
    }

    return ok(undefined);
};

const addToken = async ({
                            client
                        }: Omit<Connection, 'user'>, userID: UserModel['id']): Promise<Result<TokenModel<['id', 'userID', 'secret', 'createdAt', 'expireAt']>,
    Error>> => {
    const tokenResult = await generateToken({ client }, userID);
    if (!tokenResult.ok) {
        return tokenResult;
    }

    const addTokenResult = await Token.insert(
        [tokenResult.value],
        ['id', 'userID', 'secret', 'createdAt', 'expireAt'] as const,
        { nullableDefaultColumns: ['createdAt'] as const }
    ).exec(client, ['get', 'one']);
    if (!addTokenResult.ok) {
        return err([401, addTokenResult.error]);
    }

    return ok(addTokenResult.value);
};

export default login;
export { checkValidation, addToken };
