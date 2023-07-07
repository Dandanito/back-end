import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const FileTable = {
    schema: 'general',
    title: 'file',
    columns: {
        uuid: {
            type: 'uuid',
            nullable: false,
            default: false,
            primary: true,
        },
        id: {
            type: 'bigint',
            nullable: false,
            default: 'auto-increment'
        },
        isTemp: {
            type: 'boolean',
            nullable: false,
            default: false,
        },
        size: {
            type: 'bigint',
            nullable: false,
            default: false
        },
        name: {
            type: 'character varying',
            nullable: false,
            default: false
        },
        contentType: {
            type: 'character varying',
            nullable: false,
            default: false,
        },
        updatedAt: {
            type: 'timestamp with time zone',
            nullable: false,
            default: false,
        }
    }
} as const;
const File = createEntity(FileTable);
type FileModel<
    R extends readonly (keyof (typeof FileTable)['columns'])[] = [
        'uuid',
        'id',
        'isTemp',
        'size',
        'name',
        'contentType',
        'updatedAt'
    ],
    O extends readonly (keyof (typeof FileTable)['columns'])[] = []
> = Model<(typeof FileTable)['columns'], R, O>;
const FileModel = createModelUtils(File.table.columns);

export { File, FileModel };
