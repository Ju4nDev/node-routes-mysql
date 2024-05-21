import express from 'express';
import cors from 'cors';

import client from './client.js';
import books from './books.js';


const app = express();

app.use(express.json());
app.use(cors());

app.use('/', client);

app.get('/books', books);

app.post('/signup', client);

app.listen(8081, () => {
    console.log('listening');
})

