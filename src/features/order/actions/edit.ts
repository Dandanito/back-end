import Error from '../error';
import { Status } from '../constant';
import { err, ok, Result } from 'never-catch';
import { ProductModel } from '../../product/schema';
import { Expression, U } from '@mrnafisia/type-query';
import { Connection } from '../../../utils/connection';
import { OrderModel, OrderRow, OrderRowModel } from '../schema';
import { addOrderRow, checkOrderExistence, checkProductExistence } from '../util';

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

        const addOrderRowResult = await addOrderRow(
            connection,

        )
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
            const countSwt: {
                when: Expression<boolean>;
                then: Expression<number>;
            }[] = [];
            for (const { productID, count } of editOrderRows) {
                const correspondingRow = getOrderRowsResult.value.find(e => e.productID === productID);
                if (correspondingRow === undefined) {
                    return err([303]);
                }
                totalPrice += BigInt(count - correspondingRow.count) * correspondingRow.price;
                countSwt.push({
                    when: OrderRow.context.colCmp('productID', '=', productID),
                    then: count
                });
            }

            const editOrderRowsResult = await editOrderRow(
                connection,
                editOrderRows.map(e => e.productID),
                countSwt
            );
            if (!editOrderRowsResult.ok){
                return editOrderRowsResult
            }
        }

        if (removeProductIDs !== undefined) {
            for (const productID of removeProductIDs) {
                const correspondingRow = getOrderRowsResult.value.find(e => e.productID === productID);
                if (correspondingRow === undefined) {
                    return err([304]);
                }
                totalPrice -= correspondingRow.price;
            }

            const removeOrderRowResult = await removeOrderRow(
                connection,
                removeProductIDs
            );
            if (!removeOrderRowResult.ok){
                return removeOrderRowResult;
            }
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

const editOrderRow = async (
    { client }: Omit<Connection, 'user'>,
    productIDs: OrderRowModel['productID'][],
    balanceSwt: {
        when: Expression<boolean>;
        then: Expression<number>;
    }[] = []
): Promise<Result<undefined, Error>> => {
    const editOrderRowsResult = await OrderRow.update({
            count: U.swt(balanceSwt, OrderRow.context.col('count'))
        },
        context => context.colList('productID', 'in', productIDs),
        ['id'] as const
    ).exec(client, ['get', productIDs.length]);
    if (!editOrderRowsResult.ok){
        return err([401, editOrderRowsResult.error])
    }

    return ok(undefined)
};

const removeOrderRow = async (
    { client }: Omit<Connection, 'user'>,
    productIDs: OrderRowModel['productID'][]
): Promise<Result<undefined, Error>> => {
    const removeOrderRowResult = await OrderRow.delete(
        context => context.colList('productID', 'in', productIDs),
        ['id'] as const
    ).exec(client, ['get', productIDs.length]);
    if (!removeOrderRowResult.ok){
        return err([401, removeOrderRowResult.error])
    }

    return ok(undefined)
}