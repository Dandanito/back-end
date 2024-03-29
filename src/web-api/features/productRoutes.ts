import { Express } from 'express';
import { err, ok } from 'never-catch';
import { Parser } from '@mrnafisia/type-query';
import { FEATURES } from '../../utils/features';
import { Role } from '../../features/user/roles';
import add from '../../features/product/actions/add';
import get from '../../features/product/actions/get';
import { FileModel } from '../../features/file/schema';
import edit from '../../features/product/actions/edit';
import ParseGetOptions from '../utils/parseGetOptions';
import remove from '../../features/product/actions/remove';
import client_log_message from '../middlewares/client_log_message';
import { Product, ProductModel } from '../../features/product/schema';
import client_verify_log_message from '../middlewares/client_verify_log_message';

const ProductRoute = '/product';

const product = (app: Express) => {
    /**
     * @swagger
     * /product:
     *   post:
     *     summary: Create a new product.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Create a new product with the provided data.
     *     tags:
     *      - Product
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               price:
     *                 type: string
     *               productGroup:
     *                 type: integer
     *               discount:
     *                 type: string
     *               discountType:
     *                 type: integer
     *             example:
     *               title: example title for a product
     *               description: example description for a product
     *               price: "10000000"
     *               productGroup: 1
     *               discount: "10000000"
     *               discountType: 1
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.post(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':add',
            [Role.Admin, Role.Laboratory, Role.Store],
            async (req, _res, connection) => {
                const parseProductResult = ProductModel.Parse(
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
                    const parsed = FileModel.uuid.Parse(fileUUID, true);
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
    /**
     * @swagger
     * /product:
     *   patch:
     *     summary: Edit a product.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Edit a product with the provided data.
     *     tags:
     *      - Product
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: integer
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               price:
     *                 type: string
     *               discount:
     *                 type: string
     *               discountType:
     *                 type: integer
     *             example:
     *               id: 1
     *               title: example title for a product
     *               description: example description for a product
     *               price: "10000000"
     *               productGroup: 1
     *               discount: "10000000"
     *               discountType: 1
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.patch(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':edit',
            [Role.Admin, Role.Laboratory, Role.Store],
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
                        const parsed = FileModel.uuid.Parse(fileUUID, true);
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
    /**
     * @swagger
     * /product:
     *   delete:
     *     summary: Delete a product.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Delete a product with the provided data.
     *     tags:
     *      - Product
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: integer
     *             example:
     *               id: 1
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.delete(
        ProductRoute,
        client_verify_log_message(
            ProductRoute + ':add',
            [Role.Admin, Role.Laboratory, Role.Store],
            async (req, _res, connection) => {
                const id = ProductModel.id.Parse(req.body.id, true);
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
    /**
     * @swagger
     * /order:
     *   get:
     *     summary: "Get Products"
     *     description: Get orders with provided data.
     *     tags:
     *      - Product
     *     parameters:
     *       - in: header
     *         name: secret
     *         required: true
     *         schema:
     *           type: string
     *         description: API key or token for authentication
     *       - in: query
     *         name: start
     *         required: false
     *         type: string
     *         description: The start of result from executed query output.
     *       - in: query
     *         name: step
     *         required: false
     *         type: string
     *         description: How many result should be returned from executing query.
     *       - in: query
     *         name: orders
     *         required: false
     *         type: json
     *         description: An array containing json objects which has 2 keys including by and direction by represents database column and direction has 2 options of asc and desc meaning in which order database should sort the output.
     *       - in: query
     *         name: filters
     *         required: false
     *         type: json
     *         description: A json object with specific keys and values which database query will be created according to it's values.
     *         example: {
     *             ids: ["1", "2"],
     *             titles: ["example", "title"],
     *             descriptions: ["example", "description"],
     *             sourceIDs: ["3", "4"],
     *             sourceTypes: ["1", "2"],
     *             prices: [["1000000"], ["500000", "1500000"]]
     *         }
     *     responses:
     *       '100':
     *         description: Data fetched successfully
     */
    app.get(
        ProductRoute,
        client_log_message(
            ProductRoute + ':get',
            async (req, _res, client) => {
                let ids: ProductModel['id'][] | undefined;
                let titles: ProductModel['title'][] | undefined;
                let descriptions: ProductModel['description'][] | undefined;
                let sourceIDs: ProductModel['sourceID'][] | undefined;
                let sourceTypes: ProductModel['sourceType'][] | undefined;
                let prices: ProductModel['price'][][] | undefined;

                const options = ParseGetOptions(
                    Product.table,
                    req.query.start,
                    req.query.step,
                    Parser.json(req.query.orders)
                );
                if (options === undefined) {
                    return err({
                        feature: FEATURES.Product,
                        code: 107
                    });
                }

                if (req.query.ids !== undefined) {
                    const queryIDs = Parser.json(req.query.ids);
                    ids = [];
                    if (!Array.isArray(queryIDs)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 212
                        });
                    }
                    for (let i = 0; i < queryIDs.length; i++) {
                        const parsed = ProductModel.id.Parse(queryIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 212
                            });
                        }
                        ids.push(parsed);
                    }
                }

                if (req.query.titles !== undefined) {
                    const queryTitles = Parser.json(req.query.titles);
                    titles = [];
                    if (!Array.isArray(queryTitles)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 201
                        });
                    }
                    for (let i = 0; i < queryTitles.length; i++) {
                        const parsed = ProductModel.title.Parse(queryTitles[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 201
                            });
                        }
                        titles.push(parsed);
                    }
                }

                if (req.query.descriptions !== undefined) {
                    const queryDescriptions = Parser.json(req.query.descriptions);
                    descriptions = [];
                    if (!Array.isArray(queryDescriptions)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryDescriptions.length; i++) {
                        const parsed = ProductModel.description.Parse(queryDescriptions[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 202
                            });
                        }
                        descriptions.push(parsed);
                    }
                }

                if (req.query.sourceIDs !== undefined) {
                    const querySourceIDs = Parser.json(req.query.sourceIDs);
                    sourceIDs = [];
                    if (!Array.isArray(querySourceIDs)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 206
                        });
                    }
                    for (let i = 0; i < querySourceIDs.length; i++) {
                        const parsed = ProductModel.sourceID.Parse(querySourceIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 206
                            });
                        }
                        sourceIDs.push(parsed);
                    }
                }

                if (req.query.sourceTypes !== undefined) {
                    const querySourceTypes = Parser.json(req.query.sourceTypes);
                    sourceTypes = [];
                    if (!Array.isArray(querySourceTypes)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 206
                        });
                    }
                    for (let i = 0; i < querySourceTypes.length; i++) {
                        const parsed = ProductModel.sourceType.Parse(querySourceTypes[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Product,
                                code: 206
                            });
                        }
                        sourceTypes.push(parsed);
                    }
                }

                if (req.query.prices !== undefined) {
                    const queryPrices = Parser.json(
                        req.query.prices
                    );
                    prices = [];
                    if (!Array.isArray(queryPrices)) {
                        return err({
                            feature: FEATURES.Product,
                            code: 203
                        });
                    }
                    for (let i = 0; i < queryPrices.length; i++) {
                        const parsedArr = queryPrices[i];
                        const priceArr = [];
                        if (!Array.isArray(parsedArr)) {
                            return err({
                                feature: FEATURES.Product,
                                code: 203
                            });
                        }
                        for (let j = 0; j < parsedArr.length; j++) {
                            const parsed = ProductModel.price.Parse(
                                parsedArr[j], true
                            );
                            if (parsed === undefined) {
                                return err({
                                    feature: FEATURES.Product,
                                    code: 203
                                });
                            }
                            priceArr.push(parsed);
                        }
                        prices.push(priceArr);
                    }
                }

                const actionResult = await get(
                    client,
                    options,
                    {
                        ids,
                        titles,
                        descriptions,
                        sourceIDs,
                        sourceTypes,
                        prices
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
                    code: 100,
                    data: {
                        result: actionResult.value.result,
                        length: actionResult.value.length
                    }
                })
            }
        )
    );
};

export default product;