import Error from '../error';
import { Role } from '../roles';
import { U } from '@mrnafisia/type-query';
import { User, UserModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { Product } from '../../product/schema';
import { Connection } from '../../../utils/connection';
import { Order, OrderRow } from '../../order/schema';

const vote = async (
    connection: Connection,
    { id, vote }: UserModel<['id', 'vote']>
): Promise<Result<UserModel['id'], Error>> => {
    // check user existence
    const checkUserExistenceResult = await checkUserExistence(
        connection,
        id
    );
    if (!checkUserExistenceResult.ok) {
        return checkUserExistenceResult;
    }
    if ([Role.Admin, Role.Customer].includes(checkUserExistenceResult.value.role)) {
        return err([303]);
    }
    const { vote: currVote, voteCount } = checkUserExistenceResult.value;

    // check if user has bought from this lab
    if (checkUserExistenceResult.value.role === Role.Store) {
        const checkUserPurchaseResult = await checkUserPurchase(
            connection,
            id
        );
        if (!checkUserPurchaseResult.ok) {
            return checkUserPurchaseResult;
        }
    }

    const editUserResult = await User.update({
            vote: (currVote * voteCount + vote) / (voteCount + 1),
            voteCount: voteCount + 1
        },
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!editUserResult.ok) {
        return err([401, editUserResult.error]);
    }

    return ok(editUserResult.value.id);
};

const checkUserExistence = async (
    { client }: Omit<Connection, 'user'>,
    id: UserModel['id']
): Promise<Result<UserModel<['vote', 'voteCount', 'role']>, Error>> => {
    const checkUserExistenceResult = await User.select(
        ['vote', 'voteCount', 'role'] as const,
        context => context.colCmp('id', '=', id)
    ).exec(client, ['get', 'one']);
    if (!checkUserExistenceResult.ok) {
        return err([401, checkUserExistenceResult.error]);
    }

    return checkUserExistenceResult;
};

const checkUserPurchase = async (
    { client, user }: Connection,
    userID: UserModel['id']
): Promise<Result<undefined, Error>> => {
    const checkProductExistenceResult = await OrderRow.join(
        'orderRow',
        'full',
        Order.table,
        'order',
        contexts => contexts.orderRow.colCmp('orderID', '=', contexts.order.col('id'))
    ).join(
        'full',
        Product.table,
        'product',
        contexts => contexts.orderRow.colCmp('productID', '=', contexts.product.col('id'))
    ).select(
        ['orderRow_id'] as const,
        contexts => U.andOp(
            contexts.order.colCmp('customerID', '=', user.id),
            contexts.product.colCmp('sourceID', '=', userID)
        )
    ).exec(client, []);
    if (!checkProductExistenceResult.ok) {
        return err([401, checkProductExistenceResult.error]);
    }
    if (checkProductExistenceResult.value.length === 0) {
        return err([303]);
    }

    return ok(undefined);
};

export default vote;