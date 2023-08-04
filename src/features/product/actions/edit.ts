import Error from '../error';
import { getProduct } from '../utils';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';
import { FileModel } from '../../../../dist/features/file/schema';
import { moveFiles } from '../../file/util';

const edit = async (
    connection: Connection,
    {
        id,
        title,
        description,
        price,
        fileUUIDs
    }: ProductModel<['id'], ['title', 'description', 'price', 'fileUUIDs']> & { fileUUIDs?: FileModel['uuid'][] }
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
    if (fileUUIDs !== undefined) {
        for (const fileUUID of fileUUIDs) {
            if (!FileModel.uuid.Validate(fileUUID)) {
                return err([207]);
            }
        }
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
            fileUUIDs
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

    // file
    if (fileUUIDs !== undefined) {
        const attachingFileUUIDs: FileModel['uuid'][] = [];
        const removingFileUUIDs: FileModel['uuid'][] = [];
        for (const fileUUID of fileUUIDs){
            if (!getProductResult.value.fileUUIDs.includes(fileUUID)){
                attachingFileUUIDs.push(fileUUID)
            }
        }
        for (const fileUUID of getProductResult.value.fileUUIDs){
            if (!fileUUIDs.includes(fileUUID)){
                removingFileUUIDs.push(fileUUID)
            }
        }
        if (attachingFileUUIDs.length !== 0) {
            const moveFilesResult = await moveFiles(
                connection,
                attachingFileUUIDs,
                'attach'
            );
            if (!moveFilesResult.ok) {
                return err([401, moveFilesResult]);
            }
        }
        if (removingFileUUIDs.length !== 0) {
            const moveFilesResult = await moveFiles(
                connection,
                removingFileUUIDs,
                'remove'
            );
            if (!moveFilesResult.ok) {
                return err([401, moveFilesResult]);
            }
        }
    }

    return ok({
        id: editProductResult.value.id
    });
};

export default edit;