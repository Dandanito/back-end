import Error from '../error';
import { Role } from '../../user/roles';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';
import { DiscountType } from '../constant';

const add = async (
    connection: Connection,
    {
        title,
        description,
        price,
        fileUUIDs,
        discount,
        discountType,
        productGroup
    }: ProductModel<['title', 'description', 'price', 'fileUUIDs', 'productGroup'], ['discount', 'discountType']> & { fileUUIDs: string[] }
): Promise<Result<{ id: ProductModel['id'] }, Error>> => {
    if (discountType === undefined && discount !== undefined || discountType !== undefined && discount === undefined) {
        return err([208]);
    }

    // permission
    if (![Role.Laboratory, Role.Store].includes(connection.user.role)) {
        return err([301]);
    }

    // add
    const addProductResult = await Product.insert(
        [
            {
                title,
                description,
                price,
                productGroup,
                vote: 0,
                voteCount: 0,
                sourceID: connection.user.id,
                sourceType: connection.user.role,
                fileUUIDs,
                discount: discount !== undefined ? discount : BigInt(0),
                discountType: discountType !== undefined ? discountType : DiscountType.None
            }
        ],
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!addProductResult.ok) {
        return err([401, addProductResult.error]);
    }

    return ok({
        id: addProductResult.value.id
    });
};

export default add;