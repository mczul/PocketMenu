import * as fs from 'fs';
import { tmpdir } from 'os';
import { createHash } from 'crypto';
import { promisify } from 'util';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { Worker, createWorker } from 'tesseract.js';
import { BackendMetaData, OcrResult } from './model';

/////////////////////// Globals ///////////////////////

const tempDir = `${tmpdir}/PocketMenu`;
const ocrDb: OcrResult[] = [];

////////////////////// Promisify //////////////////////

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);


////////////////////// ExpressJS //////////////////////

const PORT = 3000;
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ type: 'application/json' }));
// tslint:disable-next-line: no-bitwise
app.use(express.raw({ type: 'image/*', limit: (1 << 20) * 5 }));
app.use(morgan('combined'));

/////////////////////// Routing ///////////////////////

app.get('/api/v1/meta', (request, response) => {
    response.json(metaData);
});

app.post('/api/v1/ocr', express.raw(), async (request, response) => {
    // Hashing
    const hash = createHash('sha256');
    hash.update(request.body);
    const fileHash = hash.digest('hex');

    // File path
    const filePath = `${tempDir}/${fileHash}.tmp`;

    // Cache lookup
    const cachedResult = ocrDb.find((entry) => entry.hash === fileHash);
    if (cachedResult) {
        // Cache hit
        return response.json(cachedResult);
    }

    // Cache miss

    // Write file content
    await writeFile(filePath, request.body);

    // OCR
    worker.recognize(filePath)
        .then(({ data: { text } }) => {
            return {
                success: true,
                hash: fileHash,
                data: text,
            } as OcrResult;
        }).catch((error) => {
            return {
                success: false,
                hash: fileHash,
            } as OcrResult;
        }).then((result) => {
            // Add result to cache
            ocrDb.push(result);
            // HTTP response
            return response.json(result);
        }).then(() => {
            // Cleanup file
            return unlink(filePath);
        });
});

//////////////////////// Init /////////////////////////

const worker: Worker = createWorker({
    // logger: m => console.log(m)
});

const metaData: BackendMetaData = {
    version: '?',
    started: null,
};

async function init() {
    // Tesseract.js
    await worker.load();
    await worker.loadLanguage('deu');
    await worker.initialize('deu');

    // FS
    const tempDirExists = await exists(tempDir);
    if (!tempDirExists) {
        await mkdir(tempDir);
    }

    // ExpressJS
    app.listen(PORT, async () => {
        metaData.started = new Date();
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}

init();
