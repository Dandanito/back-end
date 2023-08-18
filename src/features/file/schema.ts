import { EnglishNumberSignsRegex } from '../../utils/regexes';
import {
    createEntity,
    createModelUtils,
    Model,
    Parser, Table
} from '@mrnafisia/type-query';

const FileTable: Table = {
    schema: 'general',
    title: 'file',
    columns: {
        uuid: {
            type: 'uuid',
            primary: true,
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
        }
    }
} as const;
const File = createEntity(FileTable);
type FileModel<
    R extends readonly (keyof (typeof FileTable)['columns'])[] = [
        'uuid',
        'size',
        'name',
        'extension'
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
