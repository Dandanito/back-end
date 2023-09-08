import { createPool, createTables } from '@mrnafisia/type-query';

import { Log } from '../src/features/log/schema';

import { Order, OrderRow } from '../src/features/order/schema';

import { Product } from '../src/features/product/schema';

import { Token } from '../src/features/token/schema';

import { User } from '../src/features/user/schema';

import { File } from '../src/features/file/schema';

const connectionString = 'postgres://postgres:12345678@65.21.60.11:5432/dandanito';

const pool = createPool({ connectionString });

(async () => {
    const client = await pool.$.connect();
    const result = await createTables(client, [
        Log.table,
        Order.table,
        Product.table,
        Token.table,
        User.table,
        File.table,
        OrderRow.table
    ]);
    console.log(result);
    client.release();
    await pool.$.end();
})();