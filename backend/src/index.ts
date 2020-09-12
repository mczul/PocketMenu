import express from 'express';
import morgan from 'morgan';

import { BackendMetaData } from './model';

const PORT = 3000;
const app = express();
app.use(morgan('combined'));

const metaData: BackendMetaData = {
    version: '?',
    started: null,
};

/////////////////////// Routing ///////////////////////

app.get('/api/v1/meta', (request, response) => {
    response.json(metaData);
});

//////////////////////// Init /////////////////////////

app.listen(PORT, () => {

    metaData.started = new Date();
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
