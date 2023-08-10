import Error from '../error';
import { Role } from '../../user/roles';
import { moveFiles } from '../../file/util';
import { err, ok, Result } from 'never-catch';
import { FileModel } from '../../file/schema';
import { Product, ProductModel } from '../schema';
import { Connection } from '../../../utils/connection';
import { DiscountType } from '../constant';

const add = async (
    connection: Connection,
    {
        title,
        description,
        price,
        fileUUIDs,
        discount,
        discountType
    }: ProductModel<['title', 'description', 'price', 'fileUUIDs'], ['discount', 'discountType']> & { fileUUIDs: string[] }
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
    for (const fileUUID of fileUUIDs) {
        if (!FileModel.uuid.Validate(fileUUID)) {
            return err([207]);
        }
    }
    if (discountType === undefined && discount !== undefined || discountType !== undefined && discount === undefined) {
        return err([208]);
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
                labID: connection.user.id,
                fileUUIDs,
                discount: discount !== undefined ? discount : BigInt(0),
                discountType: discountType !== undefined ? discountType : DiscountType.None
            }
        ],
        ['id'] as const
    ).exec(connection.client, ['get', 'one']);
    if (!addProductResult.ok) {
        return err([401, addProductResult.error]);
    }

    // attach files
    if (fileUUIDs.length !== 0) {
        const moveFilesResult = await moveFiles(
            connection,
            fileUUIDs,
            'attach'
        );
        if (!moveFilesResult.ok) {
            return err([401, moveFilesResult.error]);
        }
    }

    return ok({
        id: addProductResult.value.id
    });
};

export default add;