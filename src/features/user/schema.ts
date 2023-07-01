import { EmailRegex, EnglishNumberSignsRegex, PhoneRegex } from '../../utils/regexes';
import { createEntity, createModelUtils, Model } from '@mrnafisia/type-query';

const UserTable = {
    schema: 'general',
    title: 'user',
    columns: {
        id: {
            type: 'integer',
            nullable: false,
            primary: true,
            default: 'auto-increment'
        },
        firstName: {
            type: 'character varying',
            default: false,
            nullable: false
        },
        lastName: {
            type: 'character varying',
            default: false,
            nullable: false
        },
        phoneNumber: {
            type: 'character varying',
            default: false,
            nullable: false,
            regex: PhoneRegex
        },
        emailAddress: {
            type: 'character varying',
            default: false,
            nullable: false,
            regex: EmailRegex
        },
        address: {
            type: 'character varying',
            default: false,
            nullable: false,
            minLength: 5,
            maxLength: 100
        },
        nationalCode: {
            type: 'character varying',
            default: false,
            nullable: false,
            minLength: 10,
            maxLength: 10
        },
        serial: {
            type: 'character varying',
            default: false,
            nullable: true
        },
        serialConfirmation: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        vote: {
            type: 'double precision',
            default: false,
            nullable: true
        },
        voteCount: {
            type: 'smallint',
            default: false,
            nullable: true
        },
        password: {
            type: 'character varying',
            default: false,
            nullable: false,
            minLength: 6,
            maxLength: 16,
            regex: EnglishNumberSignsRegex
        },
        hasDelivery: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        role: {
            type: 'character varying',
            default: false,
            nullable: false
        }
    }
} as const;

const User = createEntity(UserTable);
type UserModel<R extends readonly (keyof (typeof UserTable)['columns'])[] = [
    'id',
    'firstName',
    'lastName',
    'phoneNumber',
    'emailAddress',
    'address',
    'nationalCode',
    'serial',
    'serialConfirmation',
    'vote',
    'voteCount',
    'password',
    'hasDelivery',
    'role'
],
    O extends readonly (keyof (typeof UserTable)['columns'])[] = []> = Model<(typeof UserTable)['columns'], R, O>;
const UserModel = createModelUtils(User.table.columns);

export { User, UserModel };
