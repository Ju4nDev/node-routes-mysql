import express from 'express';
import mysql from 'mysql';

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

router.post('/signup', async (req, res) => {
    try {
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

        await executeQuery(qClient, valuesClient);
        await executeQuery(qLogin, valuesLogin);
        await executeQuery(qAddress, valuesAddress);

        res.json("Customer has been registered successfully!");
    }
    catch(err){
        res.json(err);
    }
})

function executeQuery(query, values) {
    return new Promise((resolve, reject) => {
        mySql.query(query, [values], (err) => {
            if (err) reject(err);
            else resolve();
        })
    })
}

export default router;