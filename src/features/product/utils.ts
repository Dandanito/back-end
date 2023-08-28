import Error from './error';
import { err, ok, Result } from 'never-catch';
import { Product, ProductModel } from './schema';
import { Connection } from '../../utils/connection';

const getProduct = async (
    { client }: Omit<Connection, 'user'>,
    id: ProductModel['id']
): Promise<Result<ProductModel<['id', 'sourceID', 'fileUUIDs', 'vote', 'voteCount']> & { fileUUIDs: string[] }, Error>> => {
    // check existence
    const getProductResult = await Product.select(
        ['id', 'sourceID', 'fileUUIDs', 'vote', 'voteCount'] as const,
        context => context.colCmp('id', '=', id)
    ).exec(client, ['get', 'one']);
    if (!getProductResult.ok) {
        return err(
            getProductResult.error === false ? [302] : [401, getProductResult.error]
        );
    }

    return ok(getProductResult.value as typeof getProductResult.value & { fileUUIDs: string[] });
};

export { getProduct };