import Error from './error';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../utils/connection';
import { Product, ProductModel } from '../product/schema';

const checkProductExistence = async (
    { client }: Omit<Connection, 'user'>,
    productIDs: ProductModel['id'][]
): Promise<Result<ProductModel<['id', 'price', 'discount', 'discountType']>[], Error>> => {
    const checkProductExistenceResult = await Product.select(
        ['id', 'price', 'discount', 'discountType'] as const,
        context => context.colList('id', 'in', productIDs)
    ).exec(client, ['get', productIDs.length]);
    if (!checkProductExistenceResult.ok) {
        return err(
            checkProductExistenceResult.error === false ? [303] : [401, checkProductExistenceResult.error]
        );
    }

    return ok(checkProductExistenceResult.value);
};

export { checkProductExistence };