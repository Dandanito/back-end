import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';

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

// features

app.listen(port, () => console.log(`dandanito listening on ${port}`));
