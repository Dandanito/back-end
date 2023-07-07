import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const ProductGroupTable = {
    schema: 'general',
    title: 'product_group',
    columns: {
        id: {
            type: 'integer',
            nullable: false,
            primary: true,
            default: 'auto-increment'
        },
        title: {
            type: 'character varying',
            default: false,
            nullable: false,
            minLength: 2,
            maxLength: 100
        }
    }
} as const;

const ProductGroup = createEntity(ProductGroupTable);
type ProductGroupModel<R extends readonly (keyof (typeof ProductGroupTable)['columns'])[] = [
    'id',
    'title'
],
    O extends readonly (keyof (typeof ProductGroupTable)['columns'])[] = []> = Model<(typeof ProductGroupTable)['columns'], R, O>;
const ProductGroupModel = createModelUtils(ProductGroup.table.columns);

export { ProductGroup, ProductGroupModel };
