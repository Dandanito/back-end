import { rename } from 'fs';
import { join } from 'path';
import { Error } from './error';
import { File, FileModel } from './schema';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../utils/connection';

const getTempFilesPath = (): string => {
    const dir = process.env.TEMP_FILES_DIR;
    if (dir === undefined) {
        throw 'please set TEMP_FILES_DIR variable in .env';
    }
    return dir;
};

const getPermanentFilesPath = (): string => {
    const dir = process.env.PERMANENT_FILES_DIR;
    if (dir === undefined) {
        throw 'please set PERMANENT_FILES_DIR variable in .env';
    }
    return dir;
};

const attachFiles = async (
    { client }: Omit<Connection, 'userID'>,
    files: FileModel['uuid'][]
): Promise<Result<undefined, Error>> => {
    const checkExistenceResult = await checkExistence({ client }, files, true);
    if (!checkExistenceResult.ok) {
        return checkExistenceResult;
    }
    const updateFileIsTemp = await updateFilesIsTemp({ client }, files, false);
    if (!updateFileIsTemp.ok) {
        return updateFileIsTemp;
    }
    const moveFilesResult = await moveFiles(files, 'attach');
    if (!moveFilesResult.ok) {
        return moveFilesResult;
    }

    return ok(undefined);
};

const detachFiles = async (
    { client }: Omit<Connection, 'userID'>,
    files: FileModel['uuid'][]
): Promise<Result<undefined, Error>> => {
    const checkExistenceResult = await checkExistence({ client }, files, false);
    if (!checkExistenceResult.ok) {
        return checkExistenceResult;
    }
    const updateFileIsTemp = await updateFilesIsTemp({ client }, files, true);
    if (!updateFileIsTemp.ok) {
        return updateFileIsTemp;
    }
    const moveFilesResult = await moveFiles(files, 'detach');
    if (!moveFilesResult.ok) {
        return moveFilesResult;
    }

    return ok(undefined);
};

const checkExistence = async (
    { client }: Omit<Connection, 'userID'>,
    files: FileModel['uuid'][],
    isTemp: boolean
): Promise<Result<undefined, Error>> => {
    const fileSelectResult = await File.select(['id'] as const, context =>
        context.colsAnd({
            uuid: ['in', files],
            isTemp: [isTemp ? '= true' : '= false']
        })
    ).exec(client, ['get', files.length]);
    if (!fileSelectResult.ok) {
        return err(
            fileSelectResult.error === false
                ? [301]
                : [401, fileSelectResult.error]
        );
    }
    return ok(undefined);
};

const updateFilesIsTemp = async (
    { client }: Omit<Connection, 'userID'>,
    files: FileModel['uuid'][],
    isTemp: boolean
): Promise<Result<FileModel['id'][], Error>> => {
    const fileUpdateResult = await File.update(
        {
            isTemp: isTemp,
            updatedAt: new Date()
        },
        context =>
            context.colsAnd({
                uuid: ['in', files]
            }),
        ['id'] as const
    ).exec(client, []);
    if (!fileUpdateResult.ok) {
        return err([401, fileUpdateResult.error]);
    }
    const fileIDs = fileUpdateResult.value.map(v => v.id);
    return ok(fileIDs);
};

const moveFiles = async (
    files: FileModel['uuid'][],
    mode: 'attach' | 'detach'
): Promise<Result<undefined, Error>> => {
    const permanentFilesPath = getPermanentFilesPath();
    const tempFilesPath = getTempFilesPath();
    let src: string;
    let des: string;
    if (mode === 'attach') {
        src = tempFilesPath;
        des = permanentFilesPath;
    } else {
        des = tempFilesPath;
        src = permanentFilesPath;
    }
    files.forEach(uuid => {
        rename(join(src, uuid), join(des, uuid), error => {
            if (error) {
                return err([401, 'error while moving files']);
            }
            return ok(undefined);
        });
    });
    return ok(undefined);
};

export { getTempFilesPath, getPermanentFilesPath };
export { attachFiles, detachFiles };
