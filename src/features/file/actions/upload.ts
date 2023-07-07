import { join } from 'path';
import { Error } from '../error';
import { v4 as uuid } from 'uuid';
import { FileTypes } from '../constant';
import { getTempFilesPath } from '../util';
import { File, FileModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { UploadedFile } from 'express-fileupload';
import { Connection } from '../../../utils/connection';

const upload = async (
    connection: Connection,
    file: UploadedFile
): Promise<
    Result<{ uuid: FileModel['uuid']; }, Error>
> => {
    const checkValidationResult = checkValidation(file.mimetype);
    if (!checkValidationResult.ok) {
        return checkValidationResult;
    }
    const fileType = checkValidationResult.value;
    const addFileResult = await addFile(connection, {
        size: BigInt(file.size),
        name: file.name,
        contentType: fileType
    });
    if (!addFileResult.ok) {
        return addFileResult;
    }

    const { uuid } = addFileResult.value;

    await file.mv(join(getTempFilesPath(), uuid));

    return ok({
        uuid
    });
};

const addFile = async (
    { client }: Omit<Connection, 'userID'>,
    file: FileModel<['size', 'name', 'contentType']>
): Promise<
    Result<{ uuid: FileModel['uuid']; }, Error>
> => {
    const insertingFile = {
        uuid: uuid(),
        isTemp: true,
        size: file.size,
        name: file.name,
        contentType: file.contentType,
        updatedAt: new Date()
    };
    const addFileResult = await File.insert([insertingFile], [
        'id'
    ] as const).exec(client, ['get', 'one']);
    if (!addFileResult.ok) {
        return err([401, addFileResult.error]);
    }

    return ok({
        uuid: insertingFile.uuid
    });
};

const checkValidation = (
    mimeType: string
): Result<FileModel['contentType'], Error> => {
    if (!FileTypes.includes(mimeType)) {
        return err([201]);
    }
    return ok(mimeType);
};

export { upload };
export { addFile };
