import { Connection } from '../../../utils/connection';
import { GetOptions } from '../../../utils/getOptions';
import { OrderModel } from '../schema';
import { err, ok, Result } from 'never-catch';
import Error from '../../product/error';
import { Order } from '../schema';
import { Context, U } from '@mrnafisia/type-query';

const get = async (
    connection: Connection,
    { start, step, orders }: GetOptions<(typeof Order.table)['columns']>,
    filters: {
        ids?: OrderModel['id'][],
        descriptions?: OrderModel['description'][]
        customerIDs?: OrderModel['customerID'][]
        labIDs?: OrderModel['labID'][]
        statuses?: OrderModel['status'][]
        prices?: OrderModel['price'][][]
        dates?: OrderModel['date'][][]
    }
): Promise<Result<{ result: OrderModel<['id', 'customerID', 'status', 'labID', 'description', 'price', 'date']>[]; length: number }, Error>> => {
    // get
    const where = (context: Context<typeof Order.table['columns']>) =>
        U.andAllOp([
            context.colList('id', 'in', filters.ids),
            context.colList('customerID', 'in', filters.customerIDs),
            context.colList('status', 'in', filters.statuses),
            context.colList('labID', 'in', filters.labIDs),
            context.colLike('description', 'like all', filters.descriptions?.map(v => `%${v}%`)),
            U.orAllOp([
                context.colList(
                    'price',
                    'in',
                    filters.prices?.map(e => (e.length === 1 ? e[0] : undefined))
                ),
                ...(filters.prices?.map(e =>
                    e.length === 2
                        ? U.btOp(context.col('price'), e[0], e[1])
                        : undefined
                ) ?? [])
            ]),
            U.orAllOp([
                context.colList(
                    'date',
                    'in',
                    filters.dates?.map(e => (e.length === 1 ? e[0] : undefined))
                ),
                ...(filters.dates?.map(e =>
                    e.length === 2
                        ? U.btOp(context.col('date'), e[0], e[1])
                        : undefined
                ) ?? [])
            ])
        ]);

    const getOrdersResult = await Order.select(
        ['id', 'customerID', 'status', 'labID', 'description', 'price', 'date'] as const,
        where,
        {
            ignoreInWhere: true,
            start: start !== undefined ? start : BigInt(0),
            step: step !== undefined ? step : 25,
            orders: orders !== undefined ? orders : [{ by: 'id', direction: 'desc' }]
        }
    ).exec(connection.client, [])
    if (!getOrdersResult.ok){
        return err([401, getOrdersResult])
    }

    const lengthResult = await Order.select(
        context =>
            [
                {
                    exp: U.fun<number>(
                        'Count',
                        [context.col('id')],
                        '::INTEGER'
                    ),
                    as: 'len'
                }
            ] as const,
        where,
        { ignoreInWhere: true }
    ).exec(connection.client, ['get', 'one']);
    if (!lengthResult.ok) {
        return err([401, lengthResult.error]);
    }

    return ok({
        result: getOrdersResult.value,
        length: lengthResult.value.len
    });
}

export default get