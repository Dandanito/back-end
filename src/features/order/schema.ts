import { createEntity, createModelUtils, Model, Table } from '@mrnafisia/type-query';

const OrderTable: Table = {
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
        productIDs: {
            type: 'jsonb',
            default: false,
            nullable: false
        },
        discountData: {
            type: 'jsonb',
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
    'date'
],
    O extends readonly (keyof (typeof OrderTable)['columns'])[] = []> = Model<(typeof OrderTable)['columns'], R, O>;
const OrderModel = createModelUtils(Order.table.columns);

export { Order, OrderModel };
