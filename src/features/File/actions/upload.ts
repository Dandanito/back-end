import { Error } from '../error';
import { v4 as uuid } from 'uuid';
import path, { join } from 'path';
import { FILES_DIR } from '../util';
import { Operation } from '../operation';
import { isBinaryFile } from 'isbinaryfile';
import { File, FileModel } from '../schema';
import { fileTypeFromFile } from 'file-type';
import { err, ok, Result } from 'never-catch';
import { Constant } from '../../Constant/schema';
import { UploadedFile } from 'express-fileupload';
import { Feature } from '../../../utils/type/Feature';
import { Connection } from '../../../utils/type/Connection';
import { HistoryRow } from '../../../utils/type/HistoryRow';

type Limit = { size: number; allowedExtensions: string[] };

const upload = async (
    connection: Omit<Connection, 'userID'>,
    file: UploadedFile,
    feature: FileModel['feature']
): Promise<
    Result<{ uuid: FileModel['uuid']; histories: HistoryRow[] }, Error>
> => {
    // check limits
    const checkLimitsAndGetFileTypeResult = await checkLimitsAndGetFileType(
        connection,
        file,
        feature
    );
    if (!checkLimitsAndGetFileTypeResult.ok) {
        return checkLimitsAndGetFileTypeResult;
    }
    const { extension, mimeType } = checkLimitsAndGetFileTypeResult.value;

    // add
    const addFileResult = await addFile(connection, {
        size: file.size,
        name: decodeURIComponent(file.name),
        extension,
        mimeType,
        feature
    });
    if (!addFileResult.ok) {
        return addFileResult;
    }
    const {
        file: { id, uuid },
        histories
    } = addFileResult.value;

    // move
    const moveResult: Result<undefined, Error> = await file
        .mv(join(FILES_DIR, `${id}_${uuid}`))
        .then(() => ok(undefined))
        .catch(error => err([402, JSON.stringify(error)]));
    if (!moveResult.ok) {
        return moveResult;
    }

    return ok({
        uuid,
        histories
    });
};

const checkLimitsAndGetFileType = async (
    { client }: Omit<Connection, 'userID'>,
    file: UploadedFile,
    feature: FileModel['feature']
): Promise<Result<{ extension: string; mimeType: string }, Error>> => {
    // get limits
    const getLimitsByFeatureResult = await getLimitsByFeature(
        { client },
        feature
    );
    if (!getLimitsByFeatureResult.ok) {
        return getLimitsByFeatureResult;
    }
    const { size: sizeLimit, allowedExtensions } =
        getLimitsByFeatureResult.value;

    // size limit
    if (file.size > sizeLimit) {
        return err([303]);
    }

    // extension limit
    const extension = path.extname(file.name).slice(1);
    const fileType = await fileTypeFromFile(file.tempFilePath);
    const isBinary = await isBinaryFile(file.data, file.size);
    if (allowedExtensions.length !== 0) {
        if (fileType !== undefined) {
            if (
                !allowedExtensions.includes(fileType.ext) ||
                !doesExtensionsMatch(extension, fileType.ext)
            ) {
                return err([304]);
            }
            return ok({ extension, mimeType: fileType.mime });
        } else {
            if (isBinary || !allowedExtensions.includes(extension)) {
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

const getLimitsByFeature = async (
    { client }: Omit<Connection, 'userID'>,
    feature: FileModel['feature']
): Promise<Result<Limit, Error>> => {
    const result = (await Constant.select(['data'] as const, context =>
        context.colCmp('feature', '=', Feature.File)
    ).exec(client, ['get', 'one'])) as Result<
        {
            data: {
                limits?: Record<string, Limit>;
            };
        },
        unknown
    >;
    if (!result.ok && result.error !== false) {
        return err([401, result.error]);
    }
    if (!result.ok || result.value.data['limits'] === undefined) {
        return err([403]);
    }
    if (result.value.data['limits'][feature] === undefined) {
        return err([302]);
    }

    return ok(result.value.data['limits'][feature]);
};

const doesExtensionsMatch = (
    nameExtension: string,
    typeExtension: string
): boolean =>
    nameExtension === typeExtension ||
    (nameExtension === 'jpeg' && typeExtension === 'jpg');

const addFile = async (
    { client }: Omit<Connection, 'userID'>,
    file: FileModel<['size', 'name', 'extension', 'mimeType', 'feature']>
): Promise<
    Result<{ file: FileModel<['id', 'uuid']>; histories: HistoryRow[] }, Error>
> => {
    const addingFile = {
        ...file,
        uuid: uuid(),
        isTemp: true,
        createdAt: new Date()
    };
    const result = await File.insert([addingFile], [
        'id',
        'uuid'
    ] as const).exec(client, ['get', 'one']);
    if (!result.ok) {
        return err([401, result.error]);
    }
    const id = result.value.id;

    return ok({
        file: result.value,
        histories: [
            {
                yearCompanyID: null,
                feature: Feature.File,
                table: File.table.title,
                row: id,
                operations: [Operation.Upload],
                data: { ...addingFile, id }
            }
        ]
    });
};

export type { Limit };
export { upload, checkLimitsAndGetFileType, getLimitsByFeature, addFile };
