import { Express } from 'express';
import { err, ok } from 'never-catch';
import { FEATURES } from '../../utils/features';
import { Role } from '../../features/user/roles';
import add from '../../features/product/actions/add';
import { FileModel } from '../../features/file/schema';
import { ProductModel } from '../../features/product/schema';
import client_verify_log_message from '../middlewares/client_verify_log_message';

const ProductRoute = '/product'

const product = (app: Express) => {
    app.post(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':add',
            [Role.Admin, Role.Laboratory],
            async (req, _res, connection) => {
                const parseProductResult = await ProductModel.Parse(
                    req.body,
                    ['title', 'description', 'price', 'productGroup'] as const,
                    ['discount', 'discountType'] as const,
                    true
                )
                if (!parseProductResult.ok){
                    return err({
                        feature: FEATURES.Product,
                        code: ({
                            title: 101,
                            description: 102,
                            price: 103,
                            productGroup: 104,
                            discount: 105,
                            discountType: 106,
                        }[parseProductResult.error])
                    })
                }

                const fileUUIDs: FileModel['uuid'][] = []
                if (!Array.isArray(req.body.fileUUIDs)){
                    return err({
                        feature: FEATURES.Product,
                        code: 107
                    })
                }
                for (const fileUUID of req.body.fileUUIDs){
                    const parsed = FileModel.uuid.Parse(fileUUID);
                    if (parsed === undefined){
                        return err({
                            feature: FEATURES.Product,
                            code: 107
                        })
                    }
                    fileUUIDs.push(parsed)
                }

                const actionResult = await add(
                    connection,
                    {
                        ...parseProductResult.value,
                        fileUUIDs
                    }
                )
                if (!actionResult.ok){
                    const [code, data] = actionResult.error
                    return err({
                        feature: FEATURES.Product,
                        code,
                        data
                    })
                }

                return ok({
                    feature: FEATURES.Product,
                    code: 600, // ?
                    data: {
                        id: actionResult.value.id
                    }
                })
            }
        )
    )
}

export default product