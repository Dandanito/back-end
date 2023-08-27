import Error from './error';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../utils/connection';
import { Product, ProductModel } from '../product/schema';
import { Order, OrderModel, OrderRow, OrderRowModel } from './schema';
import { Role } from '../user/roles';

const checkProductExistence = async (
    { client }: Omit<Connection, 'user'>,
    productIDs: ProductModel['id'][]
): Promise<Result<ProductModel<['id', 'price', 'discount', 'discountType', 'sourceID']>[], Error>> => {
    const checkProductExistenceResult = await Product.select(
        ['id', 'price', 'discount', 'discountType', 'sourceID'] as const,
        context => context.colsAnd({
            sourceType: ['=', Role.Store],
            id: ['in', productIDs]
        })
    ).exec(client, ['get', productIDs.length]);
    if (!checkProductExistenceResult.ok) {
        return err(
            checkProductExistenceResult.error === false ? [303] : [401, checkProductExistenceResult.error]
        );
    }

    return ok(checkProductExistenceResult.value);
};

const addOrderRow = async (
    { client }: Omit<Connection, 'user'>,
    orderRows: OrderRowModel<['productID', 'orderID', 'price', 'discount', 'discountType', 'count']>[]
): Promise<Result<OrderRowModel['id'][], Error>> => {
    const addOrderRowResult = await OrderRow.insert(
        orderRows,
        ['id'] as const
    ).exec(client, ['get', orderRows.length]);
    if (!addOrderRowResult.ok) {
        return err([401, addOrderRowResult.error]);
    }

    return ok(addOrderRowResult.value.map(e => e.id));
};

const checkOrderExistence = async (
    { client }: Omit<Connection, 'user'>,
    id: OrderModel['id']
): Promise<Result<OrderModel<['status', 'price', 'customerID']>, Error>> => {
    const checkOrderExistenceResult = await Order.select(
        ['status', 'price', 'customerID'] as const,
        context => context.colCmp('id', '=', id)
    ).exec(client, ['get', 'one']);
    if (!checkOrderExistenceResult.ok) {
        return err(
            checkOrderExistenceResult.error === false ? [304] : [401, checkOrderExistenceResult.error]
        );
    }

    return ok(checkOrderExistenceResult.value);
};

export { checkProductExistence, addOrderRow, checkOrderExistence };