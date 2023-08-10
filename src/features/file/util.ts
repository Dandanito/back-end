import { Error } from './error';
import { File, FileModel } from './schema';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../utils/connection';

const getFiles = async (
    { client }: Omit<Connection, 'user'>,
    uuids: FileModel['uuid'][],
    isTemp: boolean
): Promise<Result<FileModel<['id', 'uuid']>[], Error>> => {
    const result = await File.select(['id', 'uuid'] as const, context =>
        context.colsAnd({
            uuid: ['in', uuids],
            isTemp: [isTemp ? '= true' : '= false']
        })
    ).exec(client, ['get', uuids.length]);
    if (!result.ok) {
        return err(result.error === false ? [301] : [401, result.error]);
    }

    return result;
};

const makeFilesPermanent = async (
    { client }: Omit<Connection, 'user'>,
    ids: FileModel['id'][]
): Promise<Result<undefined, Error>> => {
    const result = await File.update(
        { isTemp: false },
        context => context.colList('id', 'in', ids),
        ['id'] as const
    ).exec(client, ['count', ids.length]);
    if (!result.ok) {
        return err([401, result.error]);
    }

    return ok(undefined);
};

const removePermanentFiles = async (
    { client }: Omit<Connection, 'user'>,
    ids: FileModel['id'][]
): Promise<Result<undefined, Error>> => {
    const result = await File.delete(
        context => context.colList('id', 'in', ids),
        ['id'] as const
    ).exec(client, ['count', ids.length]);
    if (!result.ok) {
        return err([401, result.error]);
    }

    return ok(undefined);
};

const moveFiles = async (
    { client }: Omit<Connection, 'user'>,
    uuids: FileModel['uuid'][],
    action: 'attach' | 'remove'
): Promise<Result<undefined, Error>> => {

    const getFilesResult = await getFiles(
        { client },
        uuids,
        action === 'attach'
    );
    if (!getFilesResult.ok) {
        return getFilesResult;
    }
    const ids = getFilesResult.value.map(({ id }) => id);

    if (action === 'attach') {
        const makeFilesPermanentResult = await makeFilesPermanent(
            { client },
            ids
        );
        if (!makeFilesPermanentResult.ok) {
            return makeFilesPermanentResult;
        }
    } else {
        const removePermanentFilesResult = await removePermanentFiles(
            { client },
            ids
        );
        if (!removePermanentFilesResult.ok) {
            return removePermanentFilesResult;
        }
    }

    return ok(undefined);
};

export { getFiles, makeFilesPermanent, removePermanentFiles, moveFiles };
