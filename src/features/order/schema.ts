import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const OrderTable = {
    title: 'order',
    schema: 'general',
    columns: {
        id: {
            type: 'integer',
            nullable: false,
            primary: true,
            default: 'auto-increment'
        },
        description: {
            type: 'character varying',
            default: false,
            nullable: false,
            maxLength: 300
        },
        customerID: {
            type: 'integer',
            default: false,
            nullable: false
        },
        labID: {
            type: 'integer',
            default: false,
            nullable: false
        },
        price: {
            type: 'bigint',
            default: false,
            nullable: false
        },
        date: {
            type: 'timestamp with time zone',
            default: false,
            nullable: false
        },
        status: {
            type: 'smallint',
            default: false,
            nullable: false,
            max: 2
        }
    }
} as const;

const Order = createEntity(OrderTable);
type OrderModel<R extends readonly (keyof (typeof OrderTable)['columns'])[] = [
    'id',
    'description',
    'customerID',
    'labID',
    'price',
    'date',
    'status'
],
    O extends readonly (keyof (typeof OrderTable)['columns'])[] = []> = Model<(typeof OrderTable)['columns'], R, O>;
const OrderModel = createModelUtils(Order.table.columns);

const OrderRowTable = {
    schema: 'general',
    title: 'order_row',
    columns: {
        id: {
            type: 'integer',
            nullable: false,
            primary: true,
            default: 'auto-increment'
        },
        orderID: {
            type: 'integer',
            default: false,
            nullable: false
        },
        productID: {
            type: 'integer',
            default: false,
            nullable: false
        },
        price: {
            type: 'bigint',
            default: false,
            nullable: false
        },
        count: {
            type: 'smallint',
            default: false,
            nullable: false
        },
        discount: {
            type: 'bigint',
            default: false,
            nullable: false
        },
        discountType: {
            type: 'smallint',
            default: false,
            nullable: false,
            max: 2
        }
    }
} as const;

const OrderRow = createEntity(OrderRowTable);
type OrderRowModel<R extends readonly (keyof (typeof OrderRowTable)['columns'])[] = [
    'id',
    'orderID',
    'productID',
    'price',
    'discount',
    'discountType'
],
    O extends readonly (keyof (typeof OrderRowTable)['columns'])[] = []> = Model<(typeof OrderRowTable)['columns'], R, O>;
const OrderRowModel = createModelUtils(OrderRow.table.columns);

export { Order, OrderModel };
export { OrderRow, OrderRowModel };
