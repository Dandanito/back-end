import { ClientBase } from '@mrnafisia/type-query';
import { UserModel } from '../features/user/schema';

type Connection = {
    client: ClientBase;
    user: UserModel<['id', 'role']>;
};

export type { Connection };
