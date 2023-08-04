import { Error } from '../error';
import { err, Result } from 'never-catch';
import { File, FileModel } from '../schema';
import { Connection } from '../../../utils/connection';

const download = async (
    { client }: Omit<Connection, 'user'>,
    uuid: FileModel['uuid']
): Promise<Result<FileModel<['id', 'uuid', 'name', 'mimeType']>, Error>> => {
    const result = await File.select(
        ['id', 'uuid', 'name', 'mimeType'] as const,
        context =>
            context.colsAnd({
                uuid: ['=', uuid],
                isTemp: ['= false']
            })
    ).exec(client, ['get', 'one']);
    if (!result.ok) {
        return err(result.error === false ? [301] : [401, result.error]);
    }

    return result;
};

export { download };
