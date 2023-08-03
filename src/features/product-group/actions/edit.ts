import { Connection } from '../../../utils/connection';
import { ProductGroup, ProductGroupModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import Error from '../error';
import { Role } from '../../user/roles';

const edit = async (
    connection: Connection,
    { id, title }: ProductGroupModel<['id', 'title']>
): Promise<Result<{ id: ProductGroupModel['id'] }, Error>> => {
    // validation
    if (!ProductGroupModel.id.Validate(id)) {
        return err([202]);
    }
    if (!ProductGroupModel.title.Validate(title)) {
        return err([201]);
    }

    // permission
    if (connection.user.role !== Role.Admin) {
        return err([301]);
    }

    // edit product group
    const editProductGroupResult = await ProductGroup.update(
        {
            title
        },
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!editProductGroupResult.ok) {
        return err([401, editProductGroupResult.error]);
    }

    return ok({
        id: editProductGroupResult.value.id

    });
};

export default edit;