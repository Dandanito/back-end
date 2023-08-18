import Error from '../error';
import { Status } from '../constant';
import { Order, OrderModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { checkProductExistence } from '../util';
import { User, UserModel } from '../../user/schema';
import { ProductModel } from '../../product/schema';
import { DiscountType } from '../../product/constant';
import { Connection } from '../../../utils/connection';

const add = async (
    connection: Connection,
    description: OrderModel['description'],
    labID: UserModel['id'],
    productIDs: ProductModel['id'][]
): Promise<Result<{ id: OrderModel['id'] }, Error>> => {
    // validate
    if (!OrderModel.description.Validate(description)) {
        return err([203]);
    }
    for (const productID of productIDs) {
        if (!ProductModel.id.Validate(productID)) {
            return err([202]);
        }
    }
    if (!OrderModel.labID.Validate(labID)) {
        return err([201]);
    }

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
        productIDs
    );
    if (!checkProductExistenceResult.ok) {
        return checkProductExistenceResult;
    }
    let totalPrice = BigInt(0);
    const data = [];
    for (const product of checkProductExistenceResult.value) {
        totalPrice += product.discountType === DiscountType.Amount ?
            product.price - product.discount :
            product.price * product.discount / BigInt(100);
        data.push({
            productID: product.id,
            price: product.price,
            discountType: product.discountType,
            discount: product.discount
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

    return ok({
        id: addOrderResult.value.id
    });
};

export default add;