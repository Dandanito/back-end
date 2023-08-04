import { Error } from '../error';
import { err, Result } from 'never-catch';
import { Log, LogModel } from '../schema';
import { Connection } from '../../../utils/connection';

const addLog = (
    { client }: Omit<Connection, 'user'>,
    log: LogModel<['api', 'headers', 'body', 'response', 'receivedAt', 'respondedAt'],
        ['id']>
): Promise<Result<{ id: LogModel['id'] }, Error>> =>
    Log.insert([log], ['id'] as const)
        .exec(client, ['get', 'one'])
        .then(result => (result.ok ? result : err([401, result.error])));

export { addLog };
