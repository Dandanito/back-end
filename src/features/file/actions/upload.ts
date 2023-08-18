import { Error } from '../error';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { Constants } from '../constant';
import { isBinaryFile } from 'isbinaryfile';
import { File, FileModel } from '../schema';
import { fileTypeFromFile } from 'file-type';
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
): Promise<Result<{ extension: string; mimeType: string }, Error>> => {
    // size limit
    if (file.size > Constants.size) {
        return err([303]);
    }

    // extension limit
    const extension = path.extname(file.name).slice(1);
    const fileType = await fileTypeFromFile(file.tempFilePath);
    const isBinary = await isBinaryFile(file.data, file.size);
    if (Constants.allowedExtensions.length !== 0) {
        if (fileType !== undefined) {
            if (
                !Constants.allowedExtensions.includes(fileType.ext) ||
                !doesExtensionsMatch(extension, fileType.ext)
            ) {
                return err([304]);
            }
            return ok({ extension, mimeType: fileType.mime });
        } else {
            if (isBinary || !Constants.allowedExtensions.includes(extension)) {
                return err([304]);
            }
            return ok({ extension, mimeType: 'text/plain' });
        }
    } else {
        let mimeType = '';
        if (fileType === undefined && !isBinary) {
            mimeType = 'text/plain';
        }
        if (
            fileType !== undefined &&
            doesExtensionsMatch(extension, fileType.ext)
        ) {
            mimeType = fileType.mime;
        }
        return ok({
            extension,
            mimeType
        });
    }
};

const doesExtensionsMatch = (
    nameExtension: string,
    typeExtension: string
): boolean =>
    nameExtension === typeExtension ||
    (nameExtension === 'jpeg' && typeExtension === 'jpg');

const addFile = async (
    { client }: Omit<Connection, 'user'>,
    file: FileModel<['size', 'name', 'extension']>
): Promise<Result<{ file: FileModel<['uuid']>; }, Error>> => {
    const addingFile = {
        ...file,
        uuid: uuid(),
        isTemp: true,
        createdAt: new Date()
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
