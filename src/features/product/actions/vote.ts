import Error from '../error';
import { getProduct } from '../utils';
import { U } from '@mrnafisia/type-query';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Order, OrderRow } from '../../order/schema';
import { Connection } from '../../../utils/connection';

const vote = async (
    connection: Connection,
    { id, vote }: ProductModel<['id', 'vote']>
): Promise<Result<ProductModel['id'], Error>> => {
    // check product existence
    const getProductResult = await getProduct(
        connection,
        id
    );
    if (!getProductResult.ok) {
        return getProductResult;
    }
    const { vote: currVote, voteCount } = getProductResult.value;

    // check if user has bought this product
    const checkProductExistenceResult = await checkProductExistence(
        connection,
        id
    );
    if (!checkProductExistenceResult.ok) {
        return checkProductExistenceResult;
    }

    const editProductResult = await Product.update({
            vote: (currVote * voteCount + vote) / (voteCount + 1),
            voteCount: voteCount + 1
        },
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!editProductResult.ok) {
        return err([401, editProductResult.error]);
    }

    return ok(editProductResult.value.id);
};

const checkProductExistence = async (
    { client, user }: Connection,
    productID: ProductModel['id']
): Promise<Result<undefined, Error>> => {
    const checkProductExistenceResult = await OrderRow.join(
        'orderRow',
        'full',
        Order.table,
        'order',
        contexts => contexts.orderRow.colCmp('orderID', '=', contexts.order.col('id'))
    ).select(
        ['orderRow_id'] as const,
        contexts => U.andOp(
            contexts.order.colCmp('customerID', '=', user.id),
            contexts.orderRow.colCmp('productID', '=', productID)
        )
    ).exec(client, []);
    if (!checkProductExistenceResult.ok) {
        return err([401, checkProductExistenceResult.error]);
    }
    if (checkProductExistenceResult.value.length === 0) {
        return err([305]);
    }

    return ok(undefined);
};

export default vote;