import express from "express";
import mysql from "mysql";
import bcryptjs from "bcryptjs";

const mySql = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Juan140204.",
  database: "bdLiber",
});

const router = express.Router();

/*
  ROTA PARA LOGIN. FOI USADO POST PARA GARANTIR SEGURANÇA NA URL, PARA QUE DADOS SENSIVEIS 
  NÃO APAREÇAM. ESTAMOS PASSANDO OS PARAMETROS EM UM CORPO JSON.
*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const q = "SELECT * FROM tblogin WHERE Email = ? AND Adm = 1";

  mySql.query(q, [email], async (err, adminData) => {
    if (err) return res.json(err);
    else {
      if (adminData.length > 0) {
        const user = adminData[0];

        //LÓGICA PARA COMPARAR A SENHA ENVIADA PELA APLICAÇÃO COM O HASH DO BANCO 
        const match = await bcryptjs.compare(password, user.Senha);

        if(match)
          res.json({ message: "Login Successful", user: { Email: user.Email } });
        else
          res.json({ message: "Invalid credentials" });
      } 
      else 
        res.json({ message: "Invalid credentials" });
    }
  });
});

//ROTA PARA CADASTRAR FUNCIONÁRIO COM HASH NA SENHA
router.post("/", async (req, res) => {
  try {
    const qClient = "CALL CadCli(?)";
    const qLogin = "CALL AddLogin(1, ?)";

    const valuesClient = [
      req.body.Cpf,
      req.body.Nome,
      req.body.Email,
      req.body.Telefone,
      req.body.Cep,
      req.body.Logradouro,
      req.body.Uf,
      req.body.NomeCid,
      req.body.NumeroEnd,
      req.body.Complemento,
    ];

    //CRIPTOGRAFIA DE SENHA NO MYSQL
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(req.body.Senha, saltRounds);

    const valuesLogin = [req.body.Email, hashedPassword];

    await executeQuery(qClient, valuesClient);
    await executeQuery(qLogin, valuesLogin);

    res.json("Funcionario cadastrado");
  } 
  catch (err) {
    res.json(err);
  }
});

/*FUNÇÃO CRIADA PARA EXECUTAR A QUERY NO BANCO, PARA ENCURTAR A SINTAXE E FICAR MAIS DINÂMICO.
  PROMISE É UMA FORMA DE LIDAR COM OPERAÇÕES ASSÍNCRONAS EM JAVASCRIPT, PERMITINDO QUE EXECUTEMOS UM CÓDIGO QUANDO A OPERAÇÃO FOR
  BEM-SUCEDIDA OU QUANDO OCORRER UM ERRO. É UMA FORMA DE DEIXAR UM CÓDIGO MAIS LIMPO.
*/
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    mySql.query(query, [values], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default router;
