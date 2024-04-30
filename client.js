import express from 'express';
import mysql from 'mysql';
import cors from 'cors';


const router = express.Router();

router.get('/', (req, res) => {
    res.json('route client!');
});

export default router;