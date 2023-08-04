import Error from '../error';
import { Role } from '../../user/roles';
import { getProductGroup } from '../util';
import { moveFiles } from '../../file/util';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../../utils/connection';
import { ProductGroup, ProductGroupModel } from '../schema';

const edit = async (
    connection: Connection,
    { id, title, fileUUID }: ProductGroupModel<['id'], ['title', 'fileUUID']>
): Promise<Result<{ id: ProductGroupModel['id'] }, Error>> => {
    // validation
    if (!ProductGroupModel.id.Validate(id)) {
        return err([202]);
    }
    if (title !== undefined && !ProductGroupModel.title.Validate(title)) {
        return err([201]);
    }
    if (fileUUID !== undefined && !ProductGroupModel.fileUUID.Validate(fileUUID)) {
        return err([203]);
    }
    if (title === undefined && fileUUID === undefined) {
        return err([204]);
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
    if (fileUUID !== undefined && fileUUID === getProductGroupResult.value){
        return err([303])
    }

    // edit product group
    const editProductGroupResult = await ProductGroup.update(
        {
            title,
            fileUUID
        },
        context => context.colCmp('id', '=', id),
        ['id'] as const,
        {
            ignoreInSets: true
        }
    ).exec(connection.client, ['get', 'one']);
    if (!editProductGroupResult.ok) {
        return err([401, editProductGroupResult.error]);
    }

    if (fileUUID !== undefined){
        // attach files
        const attachFilesResult = await moveFiles(
            connection,
            [fileUUID],
            'attach'
        );
        if (!attachFilesResult.ok) {
            return err([401, attachFilesResult.error]);
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
    }

    return ok({
        id: editProductGroupResult.value.id

    });
};

export default edit;