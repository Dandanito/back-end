import { Express } from 'express';
import { err, ok } from 'never-catch';
import { FEATURES } from '../../utils/features';
import { Role } from '../../features/user/roles';
import add from '../../features/product/actions/add';
import { FileModel } from '../../features/file/schema';
import { ProductModel } from '../../features/product/schema';
import client_verify_log_message from '../middlewares/client_verify_log_message';
import edit from '../../features/product/actions/edit';
import remove from '../../features/product/actions/remove';

const ProductRoute = '/product';

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
                );
                if (!parseProductResult.ok) {
                    return err({
                        feature: FEATURES.Product,
                        code: ({
                            title: 201,
                            description: 202,
                            price: 203,
                            productGroup: 209,
                            discount: 210,
                            discountType: 211
                        }[parseProductResult.error])
                    });
                }

                const fileUUIDs: FileModel['uuid'][] = [];
                if (!Array.isArray(req.body.fileUUIDs)) {
                    return err({
                        feature: FEATURES.Product,
                        code: 207
                    });
                }
                for (const fileUUID of req.body.fileUUIDs) {
                    const parsed = FileModel.uuid.Parse(fileUUID);
                    if (parsed === undefined) {
                        return err({
                            feature: FEATURES.Product,
                            code: 207
                        });
                    }
                    fileUUIDs.push(parsed);
                }

                const actionResult = await add(
                    connection,
                    {
                        ...parseProductResult.value,
                        fileUUIDs
                    }
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Product,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Product,
                    code: 100,
                    data: {
                        id: actionResult.value.id
                    }
                });
            }
        )
    );
    app.patch(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':edit',
            [Role.Admin, Role.Laboratory],
            async (req, _res, connection) => {
                const parseProductResult = await ProductModel.Parse(
                    req.body,
                    ['id'] as const,
                    ['title', 'description', 'price', 'discount', 'discountType'] as const,
                    true
                );
                if (!parseProductResult.ok) {
                    return err({
                        feature: FEATURES.Product,
                        code: ({
                            id: 212,
                            title: 201,
                            description: 202,
                            price: 203,
                            productGroup: 209,
                            discount: 210,
                            discountType: 211
                        }[parseProductResult.error])
                    });
                }
                let fileUUIDs: FileModel['uuid'][] | undefined;
                if (req.body.fileUUIDs !== undefined) {
                    fileUUIDs = [];
                    if (!Array.isArray(req.body.fileUUIDs)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 207
                        });
                    }
                    for (const fileUUID of req.body.fileUUIDs) {
                        const parsed = FileModel.uuid.Parse(fileUUID);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 207
                            });
                        }
                        fileUUIDs.push(parsed);
                    }
                }

                const actionResult = await edit(
                    connection,
                    {
                        ...parseProductResult.value,
                        fileUUIDs
                    }
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Product,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Product,
                    code: 100,
                    data: {
                        id: actionResult.value.id
                    }
                });
            }
        )
    );
    app.delete(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':add',
            [Role.Admin, Role.Laboratory],
            async (req, _res, connection) => {
                const id = ProductModel.id.Parse(req.body.id);
                if (id === undefined) {
                    return err({
                        feature: FEATURES.Product,
                        code: 212
                    });
                }

                const actionResult = await remove(
                    connection,
                    id
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Product,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Product,
                    code: 100,
                    data: {
                        id: actionResult.value.id
                    }
                });
            }
        )
    );
};

export default product;