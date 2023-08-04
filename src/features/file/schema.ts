import { EnglishNumberSignsRegex } from '../../utils/regexes';
import {
    createEntity,
    createModelUtils,
    Model,
    Parser
} from '@mrnafisia/type-query';

const FileTable = {
    schema: 'general',
    title: 'file',
    columns: {
        id: {
            type: 'bigint',
            nullable: false,
            default: 'auto-increment',
            primary: true
        },
        uuid: {
            type: 'uuid',
            nullable: false,
            default: false,
            minLength: 36,
            maxLength: 36
        },
        isTemp: {
            type: 'boolean',
            nullable: false,
            default: false
        },
        size: {
            type: 'integer',
            nullable: false,
            default: false,
            min: 0
        },
        name: {
            type: 'character varying',
            nullable: false,
            default: false,
            minLength: 1,
            maxLength: 100
        },
        extension: {
            type: 'character varying',
            nullable: false,
            default: false,
            minLength: 1,
            maxLength: 10
        },
        mimeType: {
            type: 'character varying',
            nullable: false,
            default: false,
            minLength: 1,
            maxLength: 100
        },
        createdAt: {
            type: 'timestamp with time zone',
            nullable: false,
            default: false
        }
    }
} as const;
const File = createEntity(FileTable);
type FileModel<
    R extends readonly (keyof (typeof FileTable)['columns'])[] = [
        'id',
        'uuid',
        'isTemp',
        'size',
        'name',
        'extension',
        'mimeType',
        'createdAt'
    ],
    O extends readonly (keyof (typeof FileTable)['columns'])[] = []
> = Model<(typeof FileTable)['columns'], R, O>;
const FileModel = createModelUtils(File.table.columns, {
    parse: {
        uuid: v => {
            const parsed = Parser.string(v);
            if (
                parsed === undefined ||
                parsed.length !== 36 ||
                !EnglishNumberSignsRegex.test(parsed)
            ) {
                return undefined;
            }
            return parsed;
        }
    }
});

export { File, FileModel };
