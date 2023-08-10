import { createPool, createTables } from '@mrnafisia/type-query';

import { Log } from '../src/features/log/schema';

import { Order } from '../src/features/order/schema';

import { Product } from '../src/features/product/schema';

import { ProductGroup } from '../src/features/product-group/schema';

import { Token } from '../src/features/token/schema';

import { User } from '../src/features/user/schema';

const connectionUrl = 'postgres://postgres:password@localhost:5432/dandanito';
const pool = createPool(connectionUrl);

(async () => {
    const client = await pool.$.connect();
    const result = await createTables(client, [
        Log.table,
        Order.table,
        Product.table,
        ProductGroup.table,
        Token.table,
        User.table
    ]);
    console.log(result);
    client.release();
    await pool.$.end();
})();