import { OrderDirection, Table } from '@mrnafisia/type-query';

type GetOptions<Column extends Table['columns']> = {
    start: bigint | undefined;
    step: number | undefined;
    orders: { by: keyof Column; direction: OrderDirection }[] | undefined;
};

export type { GetOptions };
