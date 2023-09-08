import path from 'path';
import { Express } from 'express';
import fileUpload from 'express-fileupload';
import { err, ok, Result } from 'never-catch';
import { FEATURES } from '../../utils/features';
import { Role } from '../../features/user/roles';
import { upload } from '../../features/file/actions/upload';
import client_verify_log_message from '../middlewares/client_verify_log_message';

const FileRoute = '/file';

const file = (app: Express) => {
    /**
     * @swagger
     * /file:
     *   post:
     *     summary: Upload a file.
     *     parameters:
     *         - in: header
     *           name: secret
     *           required: true
     *           schema:
     *             type: string
     *           description: API key or token for authentication
     *     description: Upload a file.
     *     tags:
     *      - File
     *     consumes:
     *       - multipart/form-data
     *     parameters:
     *       - in: formData
     *         name: uploadedFile
     *         type: file
     *         description: The image file to upload.
     *     responses:
     *       '100':
     *         fileUUID: a string ending with .extension .
     */
    app.post(
        FileRoute,
        client_verify_log_message(
            FileRoute + ':upload',
            [Role.Store, Role.Laboratory, Role.Store],
            async (req, _res, connection) => {
                if (!req.files || Object.keys(req.files).length !== 1) {
                    return err({
                        feature: FEATURES.File,
                        code: 204
                    });
                }

                const uploadedFile = req.files.uploadedFile as fileUpload.UploadedFile;
                const actionResult = await upload(
                    connection,
                    uploadedFile
                );
                if (!actionResult.ok) {
                    const [code, data] = actionResult.error;
                    return err({
                        feature: FEATURES.File,
                        code,
                        data
                    });
                }

                // move
                const uploadPath = path.join(__dirname, 'public', actionResult.value.uuid);
                const moveResult: Result<undefined, {
                    feature: keyof typeof FEATURES | null;
                    code: number;
                    data?: unknown;
                }> = await uploadedFile
                    .mv(uploadPath)
                    .then(() => ok(undefined))
                    .catch(error => err({
                        feature: FEATURES.File,
                        code: 402,
                        data: JSON.stringify(error)
                    }));
                if (!moveResult.ok) {
                    return moveResult;
                }

                return ok({
                    feature: FEATURES.File,
                    code: 100,
                    data: {
                        uuid: actionResult.value.uuid
                    }
                });

            }
        )
    );
};

export default file;