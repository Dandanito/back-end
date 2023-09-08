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
    apis: ['features/*.ts'],
};

const specs = swaggerJsdoc(options);

export default specs;
