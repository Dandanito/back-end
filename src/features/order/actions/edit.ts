import Error from '../error';
import { OrderModel, OrderRow, OrderRowModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { ProductModel } from '../../product/schema';
import { Connection } from '../../../utils/connection';
import { checkOrderExistence, checkProductExistence } from '../util';
import { Status } from '../constant';
import { constants } from 'http2';
import HTTP2_HEADER_IF_MATCH = module;

const edit = async (
    connection: Connection,
    id: OrderModel['id'],
    description?: OrderModel['description'],
    addProductIDs?: OrderRowModel<['productID', 'count']>[],
    editOrderRows?: OrderRowModel<['productID', 'count']>[],
    removeProductIDs?: ProductModel['id'][]
): Promise<Result<OrderModel['id'], Error>> => {
    if (description !== undefined &&
        addProductIDs !== undefined &&
        editOrderRows !== undefined &&
        removeProductIDs !== undefined) {
        return err([]);
    }

    // check order existence
    const checkOrderExistenceResult = await checkOrderExistence(
        connection,
        id
    );
    if (!checkOrderExistenceResult.ok) {
        return checkOrderExistenceResult;
    }
    let totalPrice = checkOrderExistenceResult.value.price;
    const { customerID, status, labID } = checkOrderExistenceResult.value;

    // permission
    if (customerID === connection.user.id) {
        return err([301]);
    }

    // is order editable
    if (status === Status.Done) {
        return err([305]);
    }

    // check order existence
    if (addProductIDs !== undefined) {
        const checkProductExistenceResult = await checkProductExistence(
            connection,
            labID,
            addProductIDs.map(e => e.productID)
        );
        if (!checkProductExistenceResult.ok) {
            return checkProductExistenceResult;
        }
    }

    if (editOrderRows !== undefined || removeProductIDs !== undefined) {
        const getOrderRowsResult = await getOrderRows(
            connection,
            id
        );
        if (!getOrderRowsResult.ok) {
            return getOrderRowsResult;
        }

        if (editOrderRows !== undefined) {
            if (editOrderRows.map(e => e.productID).some(e => !getOrderRowsResult.value.map(e => e.productID).includes(e))){
                return err([])
            }

            for (const { productID, count } of editOrderRows){
                const correspondingRow = getOrderRowsResult.value.find(e => e.productID === productID);
                if (correspondingRow === undefined){
                    return err([401, 'corresponding row undefined'])
                }
                totalPrice -= BigInt(count - correspondingRow.count) * correspondingRow.price
            }
        }

        if (removeProductIDs !== undefined){
            
        }

    }


};

const getOrderRows = async (
    { client }: Omit<Connection, 'user'>,
    id: OrderRowModel['orderID']
): Promise<Result<OrderRowModel<['productID', 'price', 'count']>[], Error>> => {
    const getOrderRowsResult = await OrderRow.select(
        ['productID', 'price', 'count'] as const,
        context => context.colCmp('id', '=', id)
    ).exec(client, []);
    if (!getOrderRowsResult.ok) {
        return err([401, getOrderRowsResult.error]);
    }

    return ok(getOrderRowsResult.value);
};