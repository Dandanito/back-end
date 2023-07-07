import { ClientBase } from '@mrnafisia/type-query';
import { UserModel } from '../features/user/schema';

type Connection = {
    client: ClientBase;
    userID: UserModel['id'];
};

export type { Connection };
