import * as bcryptjs from 'bcryptjs';
import { User, UserModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import Error from '../error';
import { ClientBase } from '@mrnafisia/type-query';

const signup = async (
    client: ClientBase,
    {
        role,
        firstName,
        lastName,
        address,
        emailAddress,
        password,
        phoneNumber,
        nationalCode,
        hasDelivery
    }: UserModel<['firstName', 'lastName', 'address', 'nationalCode', 'password', 'hasDelivery', 'role'], ['emailAddress', 'phoneNumber']>
): Promise<Result<UserModel['id'], Error>> => {
    // validation
    if (emailAddress === undefined && phoneNumber === undefined){
        return err([201])
    }

    // check user existence
    const checkUserExistenceResult = await checkUserExistence(
        client,
        {
            emailAddress,
            phoneNumber
        }
    )
    if (!checkUserExistenceResult.ok){
        return checkUserExistenceResult
    }

    // insert user
    const addUserResult = await User.insert(
        [
            {
                role,
                emailAddress: emailAddress === undefined ? '' : emailAddress,
                phoneNumber: phoneNumber === undefined ? '' : phoneNumber,
                password: bcryptjs.hashSync(password, 8),
                address,
                firstName,
                lastName,
                hasDelivery,
                nationalCode,
                serialConfirmation: false,
                vote: 0,
                voteCount: 0
            }
        ],
        ['id'] as const,
        {
            nullableDefaultColumns: ['serial']
        }
    ).exec(client, ['get', 'one']);
    if (!addUserResult.ok){
        return err([401, addUserResult.error])
    }

    return ok(addUserResult.value.id)
};

const checkUserExistence = async (
    client: ClientBase,
    {phoneNumber, emailAddress}: UserModel<[], ['emailAddress', 'phoneNumber']>
): Promise<Result<undefined, Error>> => {
    const checkUserExistenceResult = await User.select(
        ['id'] as const,
        context => context.colsOr({
            phoneNumber: ['=', phoneNumber],
            emailAddress: ['=', emailAddress]
        }),
        {
            ignoreInWhere: true
        }
    ).exec(client, [])
    if (!checkUserExistenceResult.ok){
        return err([401, checkUserExistenceResult.error])
    }
    if (checkUserExistenceResult.value.length !== 0){
        return err([302])
    }

    return ok(undefined)
}

export default signup