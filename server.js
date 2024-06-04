import express from 'express';
import cors from 'cors';

import client from './routes/client.js';
import books from './routes/books.js';
import genres from './routes/genre.js';
import publishingCompany from './routes/publishingCompany.js';
import author from './routes/author.js';
import admin from './routes/admin.js';


const app = express();

app.use(express.json());
app.use(cors());

app.use('/', client);
app.use('/book', books);
app.use('/genre', genres);
app.use('/publishingcompany', publishingCompany);
app.use('/author', author);

app.use('/admin', admin);

app.post('/signup', client);

app.listen(8081, () => {
    console.log('listening');
})

