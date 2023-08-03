import { OrderDirection, Table } from '@mrnafisia/type-query';

type GetOptions<Column extends Table['columns']> = {
    start?: bigint;
    step?: number;
    orders?: { by: keyof Column; direction: OrderDirection }[];
};

export type { GetOptions };
