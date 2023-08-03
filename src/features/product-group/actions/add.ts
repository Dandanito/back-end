import { Connection } from '../../../utils/connection';
import { ProductGroup, ProductGroupModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import Error from '../error';
import { Role } from '../../user/roles';

const add = async (
    connection: Connection,
    title: ProductGroupModel['title']
): Promise<Result<{ id: ProductGroupModel['id'] }, Error>> => {
    // validation
    if (ProductGroupModel.title.Validate(title)) {
        return err([201]);
    }

    // permission
    if (connection.user.role !== Role.Admin) {
        return err([301]);
    }

    // add
    const addProductGroupResult = await ProductGroup.insert(
        [{ title }],
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!addProductGroupResult.ok) {
        return err([401, addProductGroupResult.error]);
    }

    return ok({
        id: addProductGroupResult.value.id
    });
};

export default add;