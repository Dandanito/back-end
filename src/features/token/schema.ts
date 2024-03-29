import { User } from '../user/schema';
import { EnglishNumberSignsRegex } from '../../utils/regexes';
import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const TOKEN_SECRET_LENGTH = 16;

const TokenTable = {
    schema: 'general',
    title: 'token',
    columns: {
        id: {
            type: 'bigint',
            default: 'auto-increment',
            nullable: false,
            primary: true
        },
        userID: {
            type: 'smallint',
            default: false,
            nullable: false,
            reference: {
                table: User.table,
                column: 'id'
            },
            title: 'user_id'
        },
        createdAt: {
            type: 'timestamp with time zone',
            default: 'created-at',
            nullable: false,
            title: 'created_at'
        },
        expireAt: {
            type: 'timestamp with time zone',
            default: false,
            nullable: false,
            title: 'expire_at'
        },
        secret: {
            type: 'character varying',
            default: false,
            nullable: false,
            minLength: TOKEN_SECRET_LENGTH,
            maxLength: TOKEN_SECRET_LENGTH,
            regex: EnglishNumberSignsRegex
        },
        role: {
            type: 'smallint',
            default: false,
            nullable: false,
            max: 3
        }
    }
} as const;
const Token = createEntity(TokenTable);
type TokenModel<
    R extends readonly (keyof (typeof TokenTable)['columns'])[] = [
        'id',
        'userID',
        'createdAt',
        'expireAt',
        'secret',
        'role'
    ],
    O extends readonly (keyof (typeof TokenTable)['columns'])[] = []
    > = Model<(typeof TokenTable)['columns'], R, O>;
const TokenModel = createModelUtils(Token.table.columns);

export { TOKEN_SECRET_LENGTH };
export { Token, TokenModel };
