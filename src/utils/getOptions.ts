import { OrderDirection, Table } from '@mrnafisia/type-query';

type GetOptions<Column extends Table['columns']> = {
    fields: (keyof Column)[];
    start?: bigint;
    step?: number;
    orders?: { by: keyof Column; direction: OrderDirection }[];
};

export type { GetOptions };
