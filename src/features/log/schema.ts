import { EnglishNumberSignsRegex } from '../../utils/regexes';
import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const LogTable = {
    schema: 'general',
    title: 'log',
    columns: {
        id: {
            type: 'bigint',
            nullable: false,
            default: 'auto-increment',
            primary: true
        },
        api: {
            type: 'character varying',
            nullable: false,
            default: false,
            minLength: 2,
            maxLength: 60,
            regex: EnglishNumberSignsRegex
        },
        headers: {
            type: 'character varying',
            nullable: false,
            default: false
        },
        body: {
            type: 'character varying',
            nullable: false,
            default: false
        },
        response: {
            type: 'character varying',
            nullable: false,
            default: false
        },
        receivedAt: {
            type: 'timestamp with time zone',
            nullable: false,
            default: false
        },
        respondedAt: {
            type: 'timestamp with time zone',
            nullable: false,
            default: false
        }
    }
} as const;
const Log = createEntity(LogTable);
type LogModel<
    R extends readonly (keyof (typeof LogTable)['columns'])[] = [
        'id',
        'api',
        'headers',
        'body',
        'response',
        'receivedAt',
        'respondedAt'
    ],
    O extends readonly (keyof (typeof LogTable)['columns'])[] = []
> = Model<(typeof LogTable)['columns'], R, O>;
const LogModel = createModelUtils(Log.table.columns);

export { Log, LogModel };
