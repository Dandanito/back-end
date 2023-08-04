import Error from '../error';
import { Role } from '../../user/roles';
import { getProductGroup } from '../util';
import { moveFiles } from '../../file/util';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../../utils/connection';
import { ProductGroup, ProductGroupModel } from '../schema';

const remove = async (
    connection: Connection,
    id: ProductGroupModel['id']
): Promise<Result<{ id: ProductGroupModel['id'] }, Error>> => {
    // validation
    if (!ProductGroupModel.id.Validate(id)) {
        return err([202]);
    }

    // permission
    if (connection.user.role !== Role.Admin) {
        return err([301]);
    }

    // check product group existence
    const getProductGroupResult = await getProductGroup(
        connection,
        id
    );
    if (!getProductGroupResult.ok){
        return getProductGroupResult
    }

    // remove
    const removeProductGroupResult = await ProductGroup.delete(
        context => context.colCmp('id', '=', id),
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!removeProductGroupResult.ok) {
        return err([401, removeProductGroupResult.error]);
    }

    // remove files
    const removeFilesResult = await moveFiles(
        connection,
        [getProductGroupResult.value],
        'remove'
    );
    if (!removeFilesResult.ok) {
        return err([401, removeFilesResult.error]);
    }

    return ok({
        id: removeProductGroupResult.value.id
    });
};

export default remove;