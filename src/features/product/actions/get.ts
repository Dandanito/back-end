import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Context, U } from '@mrnafisia/type-query';
import { Connection } from '../../../utils/connection';
import { GetOptions } from '../../../utils/getOptions';
import { DiscountType } from '../constant';

const get = async (
    client: Connection['client'],
    { start, step, orders }: GetOptions<(typeof Product.table)['columns']>,
    filters: {
        ids?: ProductModel['id'][],
        titles?: ProductModel['title'][]
        descriptions?: ProductModel['description'][]
        sourceIDs?: ProductModel['sourceID'][]
        sourceTypes?: ProductModel['sourceType'][]
        prices?: ProductModel['price'][][]
    }
): Promise<Result<{
    result: {
        id: ProductModel['id'],
        title: ProductModel['title'],
        description: ProductModel['description'],
        vote: ProductModel['vote'],
        voteCount: ProductModel['voteCount'],
        sourceID: ProductModel['sourceID'],
        sourceType: ProductModel['sourceType'],
        price: ProductModel['price'],
        fileUUIDs: ProductModel['fileUUIDs'],
        finalPrice: ProductModel['price']
    }[]; length: number }, Error>> => {
    // get
    const where = (context: Context<typeof Product.table['columns']>) =>
        U.andAllOp([
            context.colList('id', 'in', filters.ids),
            context.colList('sourceID', 'in', filters.sourceIDs),
            context.colList('sourceType', 'in', filters.sourceTypes),
            context.colLike('title', 'like all', filters.titles?.map(v => `%${v}%`)),
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
            ])
        ]);

    const getProductsResult = await Product.select(
        ['id', 'title', 'description', 'vote', 'voteCount', 'sourceID', 'sourceType', 'price', 'fileUUIDs', 'discount', 'discountType'] as const,
        where,
        {
            ignoreInWhere: true,
            start: start !== undefined ? start : BigInt(0),
            step: step !== undefined ? step : 25,
            orders: orders !== undefined ? orders : [{ by: 'id', direction: 'desc' }]
        }
    ).exec(client, []);
    if (!getProductsResult.ok) {
        return err([401, getProductsResult.error]);
    }

    const lengthResult = await Product.select(
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
    ).exec(client, ['get', 'one']);
    if (!lengthResult.ok) {
        return err([401, lengthResult.error]);
    }

    return ok({
        result: getProductsResult.value.map(e => ({
            ...e,
            fileUUIDs: (e.fileUUIDs as string[]).map(uuid => `${process.env.SERVER_IP}:${process.env.PORT}/public/${uuid}`),
            finalPrice: e.discountType === DiscountType.None
                ? e.price
                : e.discountType === DiscountType.Amount
                    ? e.price - e.discount
                    : e.price - (e.price * e.discount / BigInt(100))
        })),
        length: lengthResult.value.len
    });

};

export default get;