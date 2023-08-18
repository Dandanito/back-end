import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from '../schema';
import { Context, U } from '@mrnafisia/type-query';
import { Connection } from '../../../utils/connection';
import { GetOptions } from '../../../utils/getOptions';

const get = async (
    connection: Connection,
    { start, step, orders }: GetOptions<(typeof Product.table)['columns']>,
    filters: {
        ids?: ProductModel['id'][],
        titles?: ProductModel['title'][]
        descriptions?: ProductModel['description'][]
        labIDs?: ProductModel['labID'][]
        prices?: ProductModel['price'][][]
    }
): Promise<Result<{ result: ProductModel<['id', 'title']>[]; length: number }, Error>> => {
    // id
    if (filters.ids !== undefined) {
        for (const id of filters.ids) {
            if (!ProductModel.id.Validate(id)) {
                return err([204]);
            }
        }
    }
    // title
    if (filters.titles !== undefined) {
        for (const title of filters.titles) {
            if (!ProductModel.title.Validate(title)) {
                return err([201]);
            }
        }
    }
    // description
    if (filters.descriptions !== undefined) {
        for (const description of filters.descriptions) {
            if (!ProductModel.description.Validate(description)) {
                return err([202]);
            }
        }
    }
    // labID
    if (filters.labIDs !== undefined) {
        for (const labID of filters.labIDs) {
            if (!ProductModel.labID.Validate(labID)) {
                return err([206]);
            }
        }
    }
    // price
    if (filters.prices !== undefined) {
        for (const priceArray of filters.prices) {
            if (priceArray.length === 1) {
                if (!ProductModel.price.Validate(priceArray[0])) {
                    return err([203]);
                }
            } else if (priceArray.length === 2) {
                if (
                    !ProductModel.price.Validate(priceArray[0]) ||
                    !ProductModel.price.Validate(priceArray[1])
                ) {
                    return err([203]);
                }
            } else {
                return err([203]);
            }
        }
    }

    // get
    const where = (context: Context<typeof Product.table['columns']>) =>
        U.andAllOp([
            context.colList('id', 'in', filters.ids),
            context.colList('labID', 'in', filters.labIDs),
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
        ['id', 'title', 'description', 'vote', 'voteCount', 'labID', 'price'] as const,
        where,
        {
            ignoreInWhere: true,
            start: start !== undefined ? start : BigInt(0),
            step: step !== undefined ? step : 25,
            orders: orders !== undefined ? orders : [{ by: 'id', direction: 'desc' }]
        }
    ).exec(connection.client, []);
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
    ).exec(connection.client, ['get', 'one']);
    if (!lengthResult.ok) {
        return err([401, lengthResult.error]);
    }

    return ok({
        result: getProductsResult.value,
        length: lengthResult.value.len
    });

};

export default get;