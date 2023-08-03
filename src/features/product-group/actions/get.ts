import Error from '../error';
import { err, ok, Result } from 'never-catch';
import { Context, U } from '@mrnafisia/type-query';
import { Connection } from '../../../utils/connection';
import { GetOptions } from '../../../utils/getOptions';
import { ProductGroup, ProductGroupModel } from '../schema';

const get = async (
    connection: Connection,
    { start, step, orders }: GetOptions<(typeof ProductGroup.table)['columns']>,
    filters: {
        ids?: ProductGroupModel['id'][],
        titles?: ProductGroupModel['title'][]
    }
): Promise<Result<{ result: ProductGroupModel<['id', 'title']>[]; length: number }, Error>> => {
    // validation

    // id
    if (filters.ids !== undefined) {
        for (const id of filters.ids) {
            if (!ProductGroupModel.id.Validate(id)) {
                return err([202]);
            }
        }
    }
    // title
    if (filters.titles !== undefined) {
        for (const title of filters.titles) {
            if (!ProductGroupModel.title.Validate(title)) {
                return err([201]);
            }
        }
    }

    // get

    const where = (context: Context<typeof ProductGroup.table['columns']>) => context.colsAnd({
        id: ['in', filters.ids],
        title: ['like all', filters.titles?.map(v => `%${v}%`)]
    });

    const getProductGroupsResult = await ProductGroup.select(
        ['id', 'title'] as const,
        where,
        {
            ignoreInWhere: true,
            start: start !== undefined ? start : BigInt(0),
            step: step !== undefined ? step : 25,
            orders: orders !== undefined ? orders : [{ by: 'id', direction: 'desc' }]
        }
    ).exec(connection.client, []);
    if (!getProductGroupsResult.ok) {
        return err([401, getProductGroupsResult.error]);
    }

    const lengthResult = await ProductGroup.select(
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
        result: getProductGroupsResult.value,
        length: lengthResult.value.len
    });
};

export default get;