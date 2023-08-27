import Error from '../error';
import { Status } from '../constant';
import { err, ok, Result } from 'never-catch';
import { Order, OrderModel, OrderRowModel } from '../schema';
import { addOrderRow, checkProductExistence } from '../util';
import { User, UserModel } from '../../user/schema';
import { DiscountType } from '../../product/constant';
import { Connection } from '../../../utils/connection';

const add = async (
    connection: Connection,
    description: OrderModel['description'],
    labID: UserModel['id'],
    products: OrderRowModel<['productID', 'count']>[]
): Promise<Result<{ id: OrderModel['id'] }, Error>> => {

    // check order existence (there should be 1 ongoing order at the time)
    const checkOrderExistenceResult = await Order.select(
        ['id'] as const,
        context => context.colsAnd({
            status: ['=', Status.Draft],
            customerID: ['=', connection.user.id]
        })
    ).exec(connection.client, []);
    if (!checkOrderExistenceResult.ok) {
        return err([401, checkOrderExistenceResult.error]);
    }
    if (checkOrderExistenceResult.value.length !== 0) {
        return ok({
            id: checkOrderExistenceResult.value[0].id
        });
    }

    // check lab existence
    const checkLabExistenceResult = await User.select(
        ['id'] as const,
        context => context.colCmp('id', '=', labID)
    ).exec(connection.client, ['get', 'one']);
    if (!checkLabExistenceResult.ok) {
        return err(
            checkLabExistenceResult.error === false ? [302] : [401, checkLabExistenceResult.error]
        );
    }

    // check product existence
    const checkProductExistenceResult = await checkProductExistence(
        connection,
        labID,
        products.map(e => e.productID)
    );
    if (!checkProductExistenceResult.ok) {
        return checkProductExistenceResult;
    }
    let totalPrice: bigint = BigInt(0);
    const orderRows: OrderRowModel<['productID', 'price', 'discount', 'discountType', 'count']>[] = [];
    for (const { productID, count } of products) {
        const correspondingRow = checkProductExistenceResult.value.find(e => e.id === productID);
        if (correspondingRow === undefined) {
            return err([401, 'corresponding row not found']);
        }
        const price = BigInt(count) * (correspondingRow.discountType === DiscountType.Amount ? correspondingRow.price - correspondingRow.discount :
            correspondingRow.price - (correspondingRow.price * correspondingRow.discount / BigInt(100)));
        totalPrice += price;
        orderRows.push({
            ...correspondingRow,
            price,
            productID,
            count
        });
    }

    // add order
    const addOrderResult = await Order.insert(
        [
            {
                labID,
                status: Status.Draft,
                customerID: connection.user.id,
                description,
                date: new Date(),
                price: totalPrice
            }
        ],
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!addOrderResult.ok) {
        return err([401, addOrderResult.error]);
    }

    const addOrderRowResult = await addOrderRow(
        connection,
        orderRows.map(e => ({
            ...e,
            orderID: addOrderResult.value.id
        }))
    );
    if (!addOrderRowResult.ok) {
        return addOrderRowResult;
    }

    return ok({
        id: addOrderResult.value.id
    });
};

export default add;