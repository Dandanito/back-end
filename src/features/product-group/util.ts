import Error from './error';
import { err, ok, Result } from 'never-catch';
import { Connection } from '../../utils/connection';
import { ProductGroup, ProductGroupModel } from './schema';

const getProductGroup = async (
    { client }: Omit<Connection, 'user'>,
    id: ProductGroupModel['id']
): Promise<Result<ProductGroupModel['fileUUID'], Error>> => {
    const getProductGroupResult = await ProductGroup.select(
        ['fileUUID'] as const,
        context => context.colCmp('id', '=', id)
    ).exec(client, ['get', 'one']);
    if (!getProductGroupResult.ok) {
        return err(
            getProductGroupResult.error === false ? [302] : [401, getProductGroupResult.error]
        );
    }

    return ok(getProductGroupResult.value.fileUUID);
};

export { getProductGroup };