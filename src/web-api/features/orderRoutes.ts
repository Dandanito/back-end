import { isObject } from 'util';
import { Express } from 'express';
import { err, ok } from 'never-catch';
import { Parser } from '@mrnafisia/type-query';
import { FEATURES } from '../../utils/features';
import { Role } from '../../features/user/roles';
import add from '../../features/order/actions/add';
import edit from '../../features/order/actions/edit';
import remove from '../../features/order/actions/remove';
import { ProductModel } from '../../features/product/schema';
import { Order, OrderModel, OrderRow, OrderRowModel } from '../../features/order/schema';
import client_verify_log_message from '../middlewares/client_verify_log_message';
import ParseGetOptions from '../utils/parseGetOptions';
import getOrder from '../../features/order/actions/getOrder';
import getOrderRow from '../../features/order/actions/getOrderRow';

const OrderRoute = '/order';
const OrderRowRoute = '/order-row';

const order = (app: Express) => {
    /**
     * @swagger
     * /order:
     *   post:
     *     summary: Create a new order.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Create a new order with the provided data.
     *     tags:
     *      - Order
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               description:
     *                 type: string
     *               orderRows:
     *                 type: json
     *             example:
     *               description: example description for an order
     *               orderRows: [
     *                  {
     *                      "productID": "1",
     *                      "count": 2
     *                  }
     *               ]
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.post(
        OrderRoute,
        client_verify_log_message(
            OrderRoute + ':add',
            [Role.Customer],
            async (req, _res, connection) => {
                const parsedDescription = OrderModel.description.Parse(req.body.description, true);
                if (parsedDescription === undefined) {
                    return err({
                        feature: FEATURES.Order,
                        code: 203
                    });
                }

                const parsedOrderRows: OrderRowModel<['productID', 'count']>[] = [];
                let orderRows = req.body.orderRows;
                if (typeof orderRows === 'string') {
                    orderRows = Parser.json(req.body.orderRows);
                }
                if (!Array.isArray(orderRows)) {
                    return err({
                        feature: FEATURES.Order,
                        code: 202
                    });
                }
                for (const orderRow of orderRows) {
                    if (!isObject(orderRow)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    const { productID, count } = orderRow as OrderRowModel<['productID', 'count']>;
                    const parsedProductID = OrderRowModel.productID.Parse(productID, true);
                    if (parsedProductID === undefined) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    const parsedCount = OrderRowModel.count.Parse(count, true);
                    if (parsedCount === undefined) {
                        return err({
                            feature: FEATURES.Order,
                            code: 206
                        });
                    }
                    parsedOrderRows.push({
                        productID: parsedProductID,
                        count: parsedCount
                    });
                }

                // action
                const actionResult = await add(
                    connection,
                    parsedDescription,
                    parsedOrderRows
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Order,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Order,
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
     *   patch:
     *     summary: Edit an order.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Edit an order with the provided data.
     *     tags:
     *      - Order
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *               description:
     *                 type: string
     *               addOrderRows:
     *                 type: json
     *               editOrderRows:
     *                 type: json
     *               deleteOrderRows:
     *                 type: json
     *             example:
     *               description: example description for an order
     *               addOrderRows: [
     *                  {
     *                      "productID": "1",
     *                      "count": 2
     *                  }
     *               ]
     *               editOrderRows: [
     *                  {
     *                      "productID": "2",
     *                      "count": 3
     *                  }
     *               ]
     *               removeOrderRows: [
     *                  {
     *                      "productID": "2"
     *                  }
     *               ]
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.patch(
        OrderRoute,
        client_verify_log_message(
            OrderRoute + ':edit',
            [Role.Customer],
            async (req, _res, connection) => {
                const parsedID = OrderModel.id.Parse(req.body.id, true);
                if (parsedID === undefined) {
                    return err({
                        feature: FEATURES.Order,
                        code: 205
                    });
                }

                let parsedDescription: OrderModel['description'] | undefined;
                if (req.body.description !== undefined) {
                    parsedDescription = OrderModel.description.Parse(req.body.description, true);
                    if (parsedDescription === undefined) {
                        return err({
                            feature: FEATURES.Order,
                            code: 203
                        });
                    }
                }

                let parsedAddOrderRows: OrderRowModel<['productID', 'count']>[] | undefined;
                if (req.body.addOrderRows !== undefined) {
                    parsedAddOrderRows = [];
                    if (!Array.isArray(req.body.addOrderRows)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (const orderRow of req.body.addOrderRows) {
                        if (!isObject(orderRow)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 200
                            });
                        }
                        const { productID, count } = orderRow as OrderRowModel<['productID', 'count']>;
                        const parsedProductID = OrderRowModel.productID.Parse(productID, true);
                        if (parsedProductID === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        const parsedCount = OrderRowModel.count.Parse(count, true);
                        if (parsedCount === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 206
                            });
                        }

                        parsedAddOrderRows.push({
                            productID: parsedProductID,
                            count: parsedCount
                        });
                    }
                }

                let parsedEditOrderRows: OrderRowModel<['productID', 'count']>[] | undefined;
                if (req.body.editOrderRows !== undefined) {
                    parsedEditOrderRows = [];
                    if (!Array.isArray(req.body.editOrderRows)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 200
                        });
                    }
                    for (const orderRow of req.body.editOrderRows) {
                        if (!isObject(orderRow)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        const { productID, count } = orderRow as OrderRowModel<['productID', 'count']>;
                        const parsedProductID = OrderRowModel.productID.Parse(productID, true);
                        if (parsedProductID === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        const parsedCount = OrderRowModel.count.Parse(count, true);
                        if (parsedCount === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 206
                            });
                        }

                        parsedEditOrderRows.push({
                            productID: parsedProductID,
                            count: parsedCount
                        });
                    }
                }

                let removeProductIDs: ProductModel['id'][] | undefined;
                if (req.body.removeProductIDs !== undefined) {
                    removeProductIDs = [];
                    if (!Array.isArray(req.body.removeProductIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (const productID of req.body.removeProductIDs) {
                        const parsedProductID = OrderRowModel.productID.Parse(productID, true);
                        if (parsedProductID === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        removeProductIDs.push(parsedProductID);
                    }
                }

                const actionResult = await edit(
                    connection,
                    parsedID,
                    parsedDescription,
                    parsedAddOrderRows,
                    parsedEditOrderRows,
                    removeProductIDs
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Order,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Order,
                    code: 100,
                    data: {
                        id: actionResult.value
                    }
                });
            }
        )
    );
    /**
     * @swagger
     * /order:
     *   delete:
     *     summary: Delete an order.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Delete an order with the provided data.
     *     tags:
     *      - Order
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *             example:
     *               id: "1"
     *     responses:
     *       '100':
     *         description: User created successfully.
     */
    app.delete(
        OrderRoute,
        client_verify_log_message(
            OrderRoute + ':remove',
            [Role.Customer],
            async (req, _res, connection) => {
                const parsedID = OrderModel.id.Parse(req.body.id, true);
                if (parsedID === undefined) {
                    return err({
                        feature: FEATURES.Order,
                        code: 205
                    });
                }

                // action
                const actionResult = await remove(
                    connection,
                    parsedID
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Order,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Order,
                    code: 100,
                    data: {
                        id: actionResult.value
                    }
                });
            }
        )
    );
    /**
     * @swagger
     * /order:
     *   get:
     *     summary: Get Orders.
     *     description: Get orders with provided data.
     *     tags:
     *      - Order
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
     *             description: ["example", "description"],
     *             customerIDs: ["3", "4"],
     *             statuses: ["1", "2", "3"],
     *             prices: [["1000000"], ["500000", "1500000"]],
     *             dates: [["2023-8-9"], ["2023-8-8", "2023-8-10"]]
     *         }
     *     responses:
     *       '100':
     *         description: Data fetched successfully
     */
    app.get(
        OrderRoute,
        client_verify_log_message(
            OrderRoute + ':get',
            [Role.Customer],
            async (req, _res, connection) => {
                let ids: OrderModel['id'][] | undefined;
                let descriptions: OrderModel['description'][] | undefined;
                let customerIDs: OrderModel['customerID'][] | undefined;
                let statuses: OrderModel['status'][] | undefined;
                let prices: OrderModel['price'][][] | undefined;
                let dates: OrderModel['date'][][] | undefined;

                const options = ParseGetOptions(
                    Order.table,
                    req.query.start,
                    req.query.step,
                    Parser.json(req.query.orders)
                );
                if (options === undefined) {
                    return err({
                        feature: FEATURES.Order,
                        code: 207
                    });
                }

                if (req.query.ids !== undefined) {
                    const queryIDs = Parser.json(req.query.ids);
                    ids = [];
                    if (!Array.isArray(queryIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 205
                        });
                    }
                    for (let i = 0; i < queryIDs.length; i++) {
                        const parsed = OrderModel.id.Parse(queryIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 205
                            });
                        }
                        ids.push(parsed);
                    }
                }

                if (req.query.descriptions !== undefined) {
                    const queryDescriptions = Parser.json(req.query.descriptions);
                    descriptions = [];
                    if (!Array.isArray(queryDescriptions)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 203
                        });
                    }
                    for (let i = 0; i < queryDescriptions.length; i++) {
                        const parsed = OrderModel.description.Parse(queryDescriptions[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 203
                            });
                        }
                        descriptions.push(parsed);
                    }
                }

                if (req.query.customerIDs !== undefined) {
                    const queryCustomerIDs = Parser.json(req.query.customerIDs);
                    customerIDs = [];
                    if (!Array.isArray(queryCustomerIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 208
                        });
                    }
                    for (let i = 0; i < queryCustomerIDs.length; i++) {
                        const parsed = OrderModel.customerID.Parse(queryCustomerIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 208
                            });
                        }
                        customerIDs.push(parsed);
                    }
                }

                if (req.query.statuses !== undefined) {
                    const queryStatuses = Parser.json(req.query.statuses);
                    statuses = [];
                    if (!Array.isArray(queryStatuses)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 209
                        });
                    }
                    for (let i = 0; i < queryStatuses.length; i++) {
                        const parsed = OrderModel.status.Parse(queryStatuses[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 209
                            });
                        }
                        statuses.push(parsed);
                    }
                }

                if (req.query.prices !== undefined) {
                    const queryPrices = Parser.json(
                        req.query.prices
                    );
                    prices = [];
                    if (!Array.isArray(queryPrices)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryPrices.length; i++) {
                        const parsedArr = queryPrices[i];
                        const priceArr = [];
                        if (!Array.isArray(parsedArr)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        for (let j = 0; j < parsedArr.length; j++) {
                            const parsed = OrderModel.price.Parse(
                                parsedArr[j], true
                            );
                            if (parsed === undefined) {
                                return err({
                                    feature: FEATURES.Order,
                                    code: 202
                                });
                            }
                            priceArr.push(parsed);
                        }
                        prices.push(priceArr);
                    }
                }

                if (req.query.dates !== undefined) {
                    const queryDates = Parser.json(
                        req.query.dates
                    );
                    dates = [];
                    if (!Array.isArray(queryDates)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryDates.length; i++) {
                        const parsedArr = queryDates[i];
                        const dateArr = [];
                        if (!Array.isArray(parsedArr)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        for (let j = 0; j < parsedArr.length; j++) {
                            const parsed = OrderModel.date.Parse(
                                parsedArr[j], true
                            );
                            if (parsed === undefined) {
                                return err({
                                    feature: FEATURES.Order,
                                    code: 202
                                });
                            }
                            dateArr.push(parsed);
                        }
                        dates.push(dateArr);
                    }
                }

                // action
                const actionResult = await getOrder(
                    connection,
                    options,
                    {
                        ids,
                        prices,
                        statuses,
                        customerIDs,
                        dates,
                        descriptions
                    }
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Order,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Order,
                    code: 100,
                    data: {
                        result: actionResult.value.result,
                        length: actionResult.value.length
                    }
                });

            }
        )
    );
    /**
     * @swagger
     * /order-row:
     *   get:
     *     summary: Get Order Rows.
     *     description: Get order rows with provided data.
     *     tags:
     *      - Order
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
     *             orderIDs: ["1", "2"],
     *             productIDs: ["1", "2"],
     *             discountTypes: ["1", "2"],
     *             prices: [["1000000"], ["500000", "1500000"]],
     *             discounts: [["1000000"], ["500000", "1500000"]],
     *         }
     *     responses:
     *       '100':
     *         description: Data fetched successfully
     */
    app.get(
        OrderRowRoute,
        client_verify_log_message(
            OrderRowRoute + ':get',
            [Role.Customer],
            async (req, _res, connection) => {
                let ids: OrderRowModel['id'][] | undefined;
                let orderIDs: OrderRowModel['orderID'][] | undefined;
                let productIDs: OrderRowModel['productID'][] | undefined;
                let discountTypes: OrderRowModel['discountType'][] | undefined;
                let prices: OrderRowModel['price'][][] | undefined;
                let discounts: OrderRowModel['discount'][][] | undefined;

                const options = ParseGetOptions(
                    OrderRow.table,
                    req.query.start,
                    req.query.step,
                    Parser.json(req.query.orders)
                );
                if (options === undefined) {
                    return err({
                        feature: FEATURES.Order,
                        code: 207
                    });
                }

                if (req.query.ids !== undefined) {
                    const queryIDs = Parser.json(req.query.ids);
                    ids = [];
                    if (!Array.isArray(queryIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 205
                        });
                    }
                    for (let i = 0; i < queryIDs.length; i++) {
                        const parsed = OrderRowModel.id.Parse(queryIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 205
                            });
                        }
                        ids.push(parsed);
                    }
                }

                if (req.query.orderIDs !== undefined) {
                    const queryOrderIDs = Parser.json(req.query.orderIDs);
                    orderIDs = [];
                    if (!Array.isArray(queryOrderIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 210
                        });
                    }
                    for (let i = 0; i < queryOrderIDs.length; i++) {
                        const parsed = OrderRowModel.orderID.Parse(queryOrderIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 210
                            });
                        }
                        orderIDs.push(parsed);
                    }
                }

                if (req.query.productIDs !== undefined) {
                    const queryProductIDs = Parser.json(req.query.productIDs);
                    productIDs = [];
                    if (!Array.isArray(queryProductIDs)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryProductIDs.length; i++) {
                        const parsed = OrderRowModel.productID.Parse(queryProductIDs[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        productIDs.push(parsed);
                    }
                }

                if (req.query.discountTypes !== undefined) {
                    const queryDiscountTypes = Parser.json(req.query.discountTypes);
                    discountTypes = [];
                    if (!Array.isArray(queryDiscountTypes)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 211
                        });
                    }
                    for (let i = 0; i < queryDiscountTypes.length; i++) {
                        const parsed = OrderRowModel.discountType.Parse(queryDiscountTypes[i], true);
                        if (parsed === undefined) {
                            return err({
                                feature: FEATURES.Order,
                                code: 211
                            });
                        }
                        discountTypes.push(parsed);
                    }
                }

                if (req.query.prices !== undefined) {
                    const queryPrices = Parser.json(
                        req.query.prices
                    );
                    prices = [];
                    if (!Array.isArray(queryPrices)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryPrices.length; i++) {
                        const parsedArr = queryPrices[i];
                        const priceArr = [];
                        if (!Array.isArray(parsedArr)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        for (let j = 0; j < parsedArr.length; j++) {
                            const parsed = OrderRowModel.price.Parse(
                                parsedArr[j], true
                            );
                            if (parsed === undefined) {
                                return err({
                                    feature: FEATURES.Order,
                                    code: 202
                                });
                            }
                            priceArr.push(parsed);
                        }
                        prices.push(priceArr);
                    }
                }

                if (req.query.discounts !== undefined) {
                    const queryDiscounts = Parser.json(
                        req.query.discounts
                    );
                    discounts = [];
                    if (!Array.isArray(queryDiscounts)) {
                        return err({
                            feature: FEATURES.Order,
                            code: 202
                        });
                    }
                    for (let i = 0; i < queryDiscounts.length; i++) {
                        const parsedArr = queryDiscounts[i];
                        const discountArr = [];
                        if (!Array.isArray(parsedArr)) {
                            return err({
                                feature: FEATURES.Order,
                                code: 202
                            });
                        }
                        for (let j = 0; j < parsedArr.length; j++) {
                            const parsed = OrderRowModel.discount.Parse(
                                parsedArr[j], true
                            );
                            if (parsed === undefined) {
                                return err({
                                    feature: FEATURES.Order,
                                    code: 202
                                });
                            }
                            discountArr.push(parsed);
                        }
                        discounts.push(discountArr);
                    }
                }

                const actionResult = await getOrderRow(
                    connection,
                    options,
                    {
                        ids,
                        prices,
                        productIDs,
                        orderIDs,
                        discounts,
                        discountTypes
                    }
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.Order,
                        code,
                        data
                    });
                }

                return ok({
                    feature: FEATURES.Order,
                    code: 100,
                    data: {
                        result: actionResult.value.result,
                        length: actionResult.value.length
                    }
                });

            }
        )
    );
};

export default order;