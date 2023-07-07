import { Error } from '../error';
import { File, FileModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../../utils/connection';

const download = async (
    connection: Connection,
    uuid: FileModel['uuid']
): Promise<
    Result<
        {
            name: FileModel['name'];
            contentType: FileModel['contentType'];
            isTemp: FileModel['isTemp'];
        },
        Error
    >
> => {
    const getFileInfoResult = await getFileInfo(connection, uuid);
    if (!getFileInfoResult.ok) {
        return getFileInfoResult;
    }

    return ok(getFileInfoResult.value);
};

const getFileInfo = async (
    { client }: Omit<Connection, 'userID'>,
    uuid: FileModel['uuid']
): Promise<
    Result<
        {
            name: FileModel['name'];
            contentType: FileModel['contentType'];
            isTemp: FileModel['isTemp'];
        },
        Error
    >
> => {
    const getFileResult = await File.select(
        ['name', 'contentType', 'isTemp'] as const,
        context => context.colCmp('uuid', '=', uuid)
    ).exec(client, ['get', 'one']);
    if (!getFileResult.ok) {
        return err([301]);
    }

    return ok(getFileResult.value);
};

export { download };
export { getFileInfo };
