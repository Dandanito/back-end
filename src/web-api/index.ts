import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import file from './features/fileRoutes';
import order from './features/orderRoutes';
import product from './features/productRoutes';
import token from './features/tokenRoutes';
import user from './features/userRoutes';

const port = Number(process.env.PORT);
if (Number.isNaN(port)) {
    throw 'please set PORT variable in .env';
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use(express.static('/public'));

// features
file(app);
order(app);
product(app);
token(app);
user(app);

app.listen(port, () => console.log(`dandanito listening on ${port}`));
