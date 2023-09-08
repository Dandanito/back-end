import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dandanito API',
            version: '1.0.0',
            description: 'Documentation Dandanito API'
        },
    },
    tags: [
        { name: 'Product', description: 'Operations related to products' },
        { name: 'Order', description: 'Operations related to orders' },
        { name: 'File', description: 'Operations related to files' },
        { name: 'Token', description: 'Operations related to tokens' },
        { name: 'User', description: 'Operations related to users' },
    ],
    apis: ['src/web-api/features/*.ts'],
};

const specs = swaggerJsdoc(options);

export default specs;
