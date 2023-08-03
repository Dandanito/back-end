import { Error } from './error';
import { FileModel } from './schema';
import { err, ok, Result } from 'never-catch';
import { Parser } from '@mrnafisia/type-query';
import { isObject } from '../../utils/isObject';
import { UploadedFile } from 'express-fileupload';
import { parseToArrayGenerator } from '../../utils/parser/parseToArrayGenerator';

type ParseDownload = {
    uuid: FileModel['uuid'];
};

const parseDownload = (data: unknown): Result<ParseDownload, Error> => {
    if (typeof data === 'string') {
        data = Parser.json(data);
    }
    if (!isObject(data)) {
        return err([200]);
    }
    const { uuid } = data;

    // uuid
    const parsedUUID = FileModel.uuid.Parse(uuid, true);
    if (parsedUUID === undefined) {
        return err([201]);
    }

    return ok({ uuid: parsedUUID });
};

type ParseUpload = {
    file: UploadedFile;
    feature: FileModel['feature'];
};

const parseUpload = (
    data: unknown,
    files: unknown
): Result<ParseUpload, Error> => {
    if (typeof data === 'string') {
        data = Parser.json(data);
    }
    if (!isObject(data)) {
        return err([200]);
    }
    const { feature } = data;

    // feature
    const parsedFeature = FileModel.feature.Parse(feature, true);
    if (parsedFeature === undefined) {
        return err([202]);
    }

    // file
    const parsedFile = parseUploadedFiles(files);
    if (!parsedFile.ok) {
        return parsedFile;
    }

    return ok({
        feature: parsedFeature,
        file: parsedFile.value
    });
};

const parseUploadedFiles = (data: unknown): Result<UploadedFile, Error> => {
    if (
        data == undefined ||
        Object.keys(data).length !== 1 ||
        (data as Record<string, unknown>)['file'] == undefined
    ) {
        return err([203]);
    }

    return ok((data as Record<'file', UploadedFile>)['file']);
};
const parseUUIDs = parseToArrayGenerator(FileModel.uuid.Parse, true);

export type { ParseDownload, ParseUpload };
export { parseDownload, parseUpload };
export { parseUUIDs, parseUploadedFiles };
