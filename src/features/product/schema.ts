import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const ProductTable = {
    schema: 'general',
    title: 'product',
    columns: {
        id: {
            type: 'integer',
            nullable: false,
            primary: true,
            default: 'auto-increment'
        },
        title: {
            type: 'character varying',
            nullable: false,
            default: false,
            minLength: 2,
            maxLength: 100
        },
        description: {
            type: 'character varying',
            nullable: false,
            default: false,
            maxLength: 300
        },
        labID: {
            type: 'integer',
            nullable: false,
            default: false
        },
        vote: {
            type: 'double precision',
            default: false,
            nullable: false,
            min: 0,
            max: 5
        },
        voteCount: {
            type: 'integer',
            default: false,
            nullable: false
        },
        price: {
            type: 'bigint',
            default: false,
            nullable: false
        },
        fileUUIDs: {
            type: 'jsonb',
            default: false,
            nullable: false
        }
    }
} as const;

const Product = createEntity(ProductTable);
type ProductModel<R extends readonly (keyof (typeof ProductTable)['columns'])[] = [
    'id',
    'title',
    'description',
    'labID',
    'vote',
    'voteCount',
    'price',
    'fileUUIDs'
],
    O extends readonly (keyof (typeof ProductTable)['columns'])[] = []> = Model<(typeof ProductTable)['columns'], R, O>;
const ProductModel = createModelUtils(Product.table.columns);

export { Product, ProductModel };
