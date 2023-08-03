import Error from '../error';
import { Role } from '../../user/roles';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';

const add = async (
    connection: Connection,
    { title, description, price }: ProductModel<['title', 'description', 'labID', 'price']>
): Promise<Result<{ id: ProductModel['id'] }, Error>> => {
    // validation
    if (!ProductModel.title.Validate(title)) {
        return err([201]);
    }
    if (!ProductModel.description.Validate(description)) {
        return err([202]);
    }
    if (!ProductModel.price.Validate(price)) {
        return err([203]);
    }

    // permission
    if (connection.user.role !== Role.Laboratory) {
        return err([301]);
    }

    // add
    const addProductResult = await Product.insert(
        [
            {
                title,
                description,
                price,
                vote: 0,
                voteCount: 0,
                labID: connection.user.id
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