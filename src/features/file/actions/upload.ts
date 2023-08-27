import Error from '../error';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { Constants } from '../constant';
import { File, FileModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { UploadedFile } from 'express-fileupload';
import { Connection } from '../../../utils/connection';

const upload = async (
    connection: Omit<Connection, 'user'>,
    file: UploadedFile
): Promise<Result<{ uuid: FileModel['uuid']; }, Error>> => {
    // check limits
    const checkLimitsAndGetFileTypeResult = await checkLimitsAndGetFileType(
        file
    );
    if (!checkLimitsAndGetFileTypeResult.ok) {
        return checkLimitsAndGetFileTypeResult;
    }
    const { extension } = checkLimitsAndGetFileTypeResult.value;

    // add
    const addFileResult = await addFile(connection, {
        size: file.size,
        name: decodeURIComponent(file.name),
        extension
    });
    if (!addFileResult.ok) {
        return addFileResult;
    }
    const {
        file: { uuid }
    } = addFileResult.value;

    // move
    const moveResult: Result<undefined, Error> = await file
        .mv('/public')
        .then(() => ok(undefined))
        .catch(error => err([402, JSON.stringify(error)]));
    if (!moveResult.ok) {
        return moveResult;
    }

    return ok({
        uuid
    });
};

const checkLimitsAndGetFileType = async (
    file: UploadedFile
): Promise<Result<{ extension: string; }, Error>> => {
    // size limit
    if (file.size > Constants.size) {
        return err([303]);
    }

    // extension limit
    const extension = path.extname(file.name).slice(1);

    return ok({
        extension
    });

};

const addFile = async (
    { client }: Omit<Connection, 'user'>,
    file: FileModel<['size', 'name', 'extension']>
): Promise<Result<{ file: FileModel<['uuid']>; }, Error>> => {
    const addingFile = {
        ...file,
        uuid: uuid() + file.extension
    };
    const result = await File.insert([addingFile], [
        'uuid'
    ] as const).exec(client, ['get', 'one']);
    if (!result.ok) {
        return err([401, result.error]);
    }

    return ok({
        file: result.value
    });
};

export { upload, checkLimitsAndGetFileType, addFile };
