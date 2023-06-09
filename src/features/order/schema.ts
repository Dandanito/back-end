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
