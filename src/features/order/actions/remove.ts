import Error from '../error';
import { checkOrderExistence } from '../util';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../../utils/connection';
import { Order, OrderModel, OrderRow } from '../schema';

const remove = async (
    connection: Connection,
    id: OrderModel['id']
): Promise<Result<OrderModel['id'], Error>> => {
    // check order existence
    const checkOrderExistenceResult = await checkOrderExistence(
        connection,
        id
    );
    if (!checkOrderExistenceResult.ok) {
        return checkOrderExistenceResult;
    }

    // permission
    if (checkOrderExistenceResult.value.customerID !== connection.user.id) {
        return err([301]);
    }

    // remove order rows
    const removeOrderRowsResult = await removeOrderRows(
        connection,
        id
    );
    if (!removeOrderRowsResult.ok) {
        return removeOrderRowsResult;
    }

    // remove order
    return await removeOrder(
        connection,
        id
    );
};

const removeOrder = async (
    { client }: Omit<Connection, 'user'>,
    id: OrderModel['id']
): Promise<Result<OrderModel['id'], Error>> => {
    const removeOrderResult = await Order.delete(
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(client, ['get', 'one']);
    if (!removeOrderResult.ok) {
        return err([401, removeOrderResult.error]);
    }

    return ok(removeOrderResult.value.id);
};

const removeOrderRows = async (
    { client }: Omit<Connection, 'user'>,
    orderID: OrderModel['id']
): Promise<Result<undefined, Error>> => {
    const removeOrderResult = await OrderRow.delete(
        context => context.colCmp('orderID', '=', orderID),
        ['id'] as const
    ).exec(client, ['get', 'one']);
    if (!removeOrderResult.ok) {
        return err([401, removeOrderResult.error]);
    }

    return ok(undefined);
};

export default remove;