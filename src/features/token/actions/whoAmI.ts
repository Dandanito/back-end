import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Token, TokenModel } from '../schema';
import { User, UserModel } from '../../user/schema';
import { Connection } from '../../../utils/connection';

const whoAmI = async (
    { client }: Omit<Connection, 'userID'>,
    secret: TokenModel['secret']
): Promise<
    Result<
        {
            user: UserModel<
                ['id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'emailAddress',
                    'address',
                    'nationalCode',
                    'serial',
                    'serialConfirmation',
                    'vote',
                    'voteCount',
                    'password',
                    'hasDelivery',
                    'role']
                >;
            token: TokenModel<
                ['id', 'userID', 'secret', 'createdAt', 'expireAt']
                >;
        },
        Error
        >
    > => {
    // validation
    if (!TokenModel.secret.Validate(secret)) {
        return err([203]);
    }

    // get info
    const infoResult = await Token.join(
        't',
        'inner',
        User.table,
        'u',
        ({ t, u }) => t.colCmp('userID', '=', u.col('id'))
    )
        .select(
            [
                'u_id',
                'u_firstName',
                'u_lastName',
                'u_phoneNumber',
                'u_emailAddress',
                'u_address',
                'u_nationalCode',
                'u_serial',
                'u_serialConfirmation',
                'u_vote',
                'u_voteCount',
                'u_password',
                'u_hasDelivery',
                'u_role',
                't_id',
                't_userID',
                't_secret',
                't_createdAt',
                't_expireAt'
            ] as const,
            ({ t }) => t.colCmp('secret', '=', secret)
        )
        .exec(client, ['get', 'one']);
    if (!infoResult.ok) {
        return err(
            infoResult.error === false ? [306] : [401, infoResult.error]
        );
    }

    // check secret
    const now = new Date();
    if (infoResult.value.t_expireAt.getTime() < now.getTime()) {
        return err([308]);
    }

    return ok({
        user: {
            id: infoResult.value.u_id,
            firstName: infoResult.value.u_firstName,
            lastName: infoResult.value.u_lastName,
            phoneNumber: infoResult.value.u_phoneNumber,
            emailAddress: infoResult.value.u_emailAddress,
            address: infoResult.value.u_address,
            nationalCode: infoResult.value.u_nationalCode,
            serial: infoResult.value.u_serial,
            serialConfirmation: infoResult.value.u_serialConfirmation,
            vote: infoResult.value.u_vote,
            voteCount: infoResult.value.u_voteCount,
            password: infoResult.value.u_password,
            hasDelivery: infoResult.value.u_hasDelivery,
            role: infoResult.value.u_role,
        },
        token: {
            id: infoResult.value.t_id,
            userID: infoResult.value.t_userID,
            secret: infoResult.value.t_secret,
            createdAt: infoResult.value.t_createdAt,
            expireAt: infoResult.value.t_expireAt
        }
    });
};

export default whoAmI;
