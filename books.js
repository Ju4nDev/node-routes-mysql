import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const mySql = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "Juan140204.",
    database: "bdLiber"
});

const router = express.Router();

router.get('/books', (req, res) => {
    const q = "select * from tbLivro";
    mySql.query(q, (err, data) => {
        err ? res.json(err) : res.json(data); 
    });
});

export default router;