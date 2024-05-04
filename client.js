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

router.get('/', (req, res) => {
    res.json('route client!');
});

router.post('/signup', (req, res) => {
    const qClient = "call CadCli(?)";
    const qLogin = "call AddLogin(0, ?)";
    const qAddress = "call AddEnd(?)";

    const valuesClient = [
        req.body.Cpf,
        req.body.Nome,
        req.body.Email,
        req.body.Telefone,
        req.body.Cep
    ]

    const valuesLogin = [
        req.body.Email,
        req.body.Senha
    ]

    const valuesAddress = [
        req.body.Cep,
        req.body.Logradouro,
        req.body.Uf,
        req.body.NomeCid,
        req.body.NumeroEnd,
        req.body.Complemento
    ]

    mySql.query(qClient, [valuesClient], (err) => {
        if (err) return res.json(err);
        mySql.query(qLogin, [valuesLogin], (err) => {
            if (err) return res.json(err);
            mySql.query(qAddress, [valuesAddress], (err) => {
                if (err) return res.json(err);
                res.json("Customer has been registered successfully!");
            })
        })
    })
})

export default router;