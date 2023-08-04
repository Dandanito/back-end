import Error from '../error';
import { Role } from '../../user/roles';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../../utils/connection';
import { ProductGroup, ProductGroupModel } from '../schema';
import { moveFiles } from '../../file/util';

const add = async (
    connection: Connection,
    { title, fileUUID }: ProductGroupModel<['title', 'fileUUID']>
): Promise<Result<{ id: ProductGroupModel['id'] }, Error>> => {
    // validation
    if (!ProductGroupModel.title.Validate(title)) {
        return err([201]);
    }
    if (!ProductGroupModel.fileUUID.Validate(fileUUID)) {
        return err([203]);
    }

    // permission
    if (connection.user.role !== Role.Admin) {
        return err([301]);
    }

    // add
    const addProductGroupResult = await ProductGroup.insert(
        [{ title, fileUUID }],
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!addProductGroupResult.ok) {
        return err([401, addProductGroupResult.error]);
    }

    // attach files
    const moveFilesResult = await moveFiles(
        connection,
        [fileUUID],
        'attach'
    );
    if (!moveFilesResult.ok) {
        return err([401, moveFilesResult.error]);
    }


    return ok({
        id: addProductGroupResult.value.id
    });
};

export default add;