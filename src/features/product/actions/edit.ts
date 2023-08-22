import Error from '../error';
import { getProduct } from '../utils';
import { FileModel } from '../../file/schema';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';

const edit = async (
    connection: Connection,
    {
        id,
        title,
        description,
        price,
        fileUUIDs,
        discount,
        discountType
    }: ProductModel<['id'], ['title', 'description', 'price', 'fileUUIDs', 'discount', 'discountType']> & { fileUUIDs?: FileModel['uuid'][] }
): Promise<Result<{ id: ProductModel['id'] }, Error>> => {
    // validation
    if (discountType === undefined && discount !== undefined || discountType !== undefined && discount === undefined) {
        return err([208]);
    }

    if (title === undefined && description === undefined && price === undefined) {
        return err([205]);
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

    // edit
    const editProductResult = await Product.update(
        {
            title,
            description,
            price,
            fileUUIDs,
            discount,
            discountType
        },
        context => context.colCmp('id', '=', id),
        ['id', 'title', 'description'] as const,
        {
            ignoreInSets: true
        }
    ).exec(connection.client, ['get', 'one']);
    if (!editProductResult.ok) {
        return err([401, editProductResult]);
    }

    return ok({
        id: editProductResult.value.id
    });
};

export default edit;