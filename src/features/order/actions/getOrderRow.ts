import Error from '../../product/error';
import { err, ok, Result } from 'never-catch';
import { Context, U } from '@mrnafisia/type-query';
import { OrderRow, OrderRowModel } from '../schema';
import { Connection } from '../../../utils/connection';
import { GetOptions } from '../../../utils/getOptions';

const getOrderRow = async (
    connection: Connection,
    { start, step, orders }: GetOptions<(typeof OrderRow.table)['columns']>,
    filters: {
        ids?: OrderRowModel['id'][],
        orderIDs?: OrderRowModel['orderID'][]
        productIDs?: OrderRowModel['productID'][]
        discountTypes?: OrderRowModel['discountType'][]
        prices?: OrderRowModel['price'][][]
        discounts?: OrderRowModel['discount'][][]
    }
): Promise<Result<{ result: OrderRowModel<['id', 'orderID', 'productID', 'price', 'discount', 'discountType']>[]; length: number }, Error>> => {
    // get
    const where = (context: Context<typeof OrderRow.table['columns']>) =>
        U.andAllOp([
            context.colList('id', 'in', filters.ids),
            context.colList('orderID', 'in', filters.orderIDs),
            context.colList('productID', 'in', filters.productIDs),
            context.colList('discountType', 'in', filters.discountTypes),
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
                    'discount',
                    'in',
                    filters.discounts?.map(e => (e.length === 1 ? e[0] : undefined))
                ),
                ...(filters.discounts?.map(e =>
                    e.length === 2
                        ? U.btOp(context.col('discount'), e[0], e[1])
                        : undefined
                ) ?? [])
            ])
        ]);
    const getOrderRowsResult = await OrderRow.select(
        ['id', 'orderID', 'productID', 'price', 'discount', 'discountType'] as const,
        where,
        {
            ignoreInWhere: true,
            start: start !== undefined ? start : BigInt(0),
            step: step !== undefined ? step : 25,
            orders: orders !== undefined ? orders : [{ by: 'id', direction: 'desc' }]
        }
    ).exec(connection.client, []);
    if (!getOrderRowsResult.ok) {
        return err([401, getOrderRowsResult]);
    }

    const lengthResult = await OrderRow.select(
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
        result: getOrderRowsResult.value,
        length: lengthResult.value.len
    });
};

export default getOrderRow;