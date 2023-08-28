import { createPool, createTables } from '@mrnafisia/type-query';

import { Log } from '../src/features/log/schema';

import { Order } from '../src/features/order/schema';

import { Product } from '../src/features/product/schema';

import { Token } from '../src/features/token/schema';

import { User } from '../src/features/user/schema';

import { File } from '../src/features/file/schema';

const connectionUrl = 'postgres://postgres:12345678@localhost:5432/dandanito';

const pool = createPool(connectionUrl);

(async () => {
    const client = await pool.$.connect();
    const result = await createTables(client, [
        Log.table,
        Order.table,
        Product.table,
        Token.table,
        User.table,
        File.table,
    ]);
    console.log(result);
    client.release();
    await pool.$.end();
})();