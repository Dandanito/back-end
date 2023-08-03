import Error from '../error';
import { getProduct } from '../utils';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';

const edit = async (
    connection: Connection,
    { id, title, description, price }: ProductModel<['id'], ['title', 'description', 'price']>
): Promise<Result<{ id: ProductModel['id'] }, Error>> => {
    // validation
    if (!ProductModel.id.Validate(id)) {
        return err([204]);
    }
    if (title !== undefined && !ProductModel.title.Validate(title)) {
        return err([201]);
    }
    if (description !== undefined && !ProductModel.description.Validate(description)) {
        return err([202]);
    }
    if (price !== undefined && !ProductModel.price.Validate(price)) {
        return err([203]);
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
            price
        },
        context => context.colCmp('id', '=', id),
        ['id'] as const,
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