import Error from '../error';
import { getProduct } from '../utils';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';

const remove = async (
    connection: Connection,
    id: ProductModel['id']
): Promise<Result<{ id: ProductModel['id'] }, Error>> => {
    // validation
    if (!ProductModel.id.Validate(id)) {
        return err([204]);
    }

    // get product
    const getProductResult = await getProduct(
        connection,
        id
    );
    if (!getProductResult.ok) {
        return getProductResult;
    }

    // permission
    if (getProductResult.value.labID !== connection.user.id) {
        return err([301]);
    }

    // remove
    const removeProductResult = await Product.delete(
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!removeProductResult.ok) {
        return err([401, removeProductResult.error]);
    }

    return ok({
        id: removeProductResult.value.id
    });
};


export default remove;