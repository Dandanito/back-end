import { Error } from './error';
import { Operation } from './operation';
import { File, FileModel } from './schema';
import { err, ok, Result } from 'never-catch';
import { Feature } from '../../utils/type/Feature';
import { Connection } from '../../utils/type/Connection';
import { HistoryRow } from '../../utils/type/HistoryRow';
import { getEnvironmentVariable } from '../../utils/getEnvironmentVariable';

const TEMP_FILES_DIR = getEnvironmentVariable('HERMES_TEMP_FILES_DIR');
const FILES_DIR = getEnvironmentVariable('HERMES_FILES_DIR');

const getFiles = async (
    { client }: Omit<Connection, 'userID'>,
    uuids: FileModel['uuid'][],
    isTemp: boolean,
    feature: keyof typeof Feature
): Promise<Result<FileModel<['id', 'uuid']>[], Error>> => {
    const result = await File.select(['id', 'uuid'] as const, context =>
        context.colsAnd({
            uuid: ['in', uuids],
            isTemp: [isTemp ? '= true' : '= false'],
            feature: ['=', feature]
        })
    ).exec(client, ['get', uuids.length]);
    if (!result.ok) {
        return err(result.error === false ? [301] : [401, result.error]);
    }

    return result;
};

const makeFilesPermanent = async (
    { client }: Omit<Connection, 'userID'>,
    ids: FileModel['id'][]
): Promise<Result<HistoryRow[], Error>> => {
    const result = await File.update(
        { isTemp: false },
        context => context.colList('id', 'in', ids),
        ['id'] as const
    ).exec(client, ['count', ids.length]);
    if (!result.ok) {
        return err([401, result.error]);
    }

    return ok(
        ids.map(id => ({
            yearCompanyID: null,
            feature: Feature.File,
            table: File.table.title,
            row: id,
            operations: [Operation.Edit_MakePermanent],
            data: { id, isTemp: false }
        }))
    );
};

const removePermanentFiles = async (
    { client }: Omit<Connection, 'userID'>,
    ids: FileModel['id'][]
): Promise<Result<HistoryRow[], Error>> => {
    const result = await File.delete(
        context => context.colList('id', 'in', ids),
        ['id'] as const
    ).exec(client, ['count', ids.length]);
    if (!result.ok) {
        return err([401, result.error]);
    }

    return ok(
        ids.map(id => ({
            yearCompanyID: null,
            feature: Feature.File,
            table: File.table.title,
            row: id,
            operations: [Operation.Remove],
            data: { id }
        }))
    );
};

const moveFiles = async (
    { client }: Omit<Connection, 'userID'>,
    uuids: FileModel['uuid'][],
    feature: keyof typeof Feature,
    action: 'attach' | 'remove'
): Promise<Result<HistoryRow[], Error>> => {
    const histories: HistoryRow[] = [];

    const getFilesResult = await getFiles(
        { client },
        uuids,
        action === 'attach',
        feature
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
        histories.push(...makeFilesPermanentResult.value);
    } else {
        const removePermanentFilesResult = await removePermanentFiles(
            { client },
            ids
        );
        if (!removePermanentFilesResult.ok) {
            return removePermanentFilesResult;
        }
        histories.push(...removePermanentFilesResult.value);
    }

    return ok(histories);
};

export { TEMP_FILES_DIR, FILES_DIR };
export { getFiles, makeFilesPermanent, removePermanentFiles, moveFiles };
