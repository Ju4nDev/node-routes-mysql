import express from "express";
import mysql2 from "mysql2";
import bcryptjs from "bcryptjs";

const mySql = mysql2.createPool({
  connectionLimit: 10,
  host: "liber-database-liber-database.k.aivencloud.com",
  user: "avnadmin",
  port: "11402",
  password: "AVNS_lJtaSOsfd8-WNQ00Eb6",
  database: "bdLiber",
});

const router = express.Router();

/*
  ROTA PARA LOGIN. FOI USADO POST PARA GARANTIR SEGURANÇA NA URL, PARA QUE DADOS SENSIVEIS 
  NÃO APAREÇAM. ESTAMOS PASSANDO OS PARAMETROS EM UM CORPO JSON.
*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const q = "SELECT * FROM tbLogin WHERE Email = ? AND Adm = 1";

  mySql.query(q, [email], async (err, adminData) => {
    if (err) return res.json(err);
    else {
      if (adminData.length > 0) {
        const user = adminData[0];

        //LÓGICA PARA COMPARAR A SENHA ENVIADA PELA APLICAÇÃO COM O HASH DO BANCO
        const match = await bcryptjs.compare(password, user.Senha);

        if (match)
          res.json({ message: "Login Successful", user: { Id: user.IdCli } });
        else res.json({ message: "Invalid credentials" });
      } else res.json({ message: "Invalid credentials" });
    }
  });
});

router.get("/:id", async (req, res) => {
  const adminId = req.params.id;

  try {
    const query = `
    select tbCliente.Nome, tbCliente.Telefone, tbLogin.Email 
    from tbCliente
    inner join tbLogin on tbCliente.Id = tbLogin.IdCli 
    where tbCliente.Id = ${adminId} and tbLogin.Adm = 1; 
    `;

    const [result] = await queryPromise(query, [adminId]);

    res.json(result);
  } catch (err) {}
});

//ROTA PARA CADASTRAR FUNCIONÁRIO COM HASH NA SENHA
router.post("/", async (req, res) => {
  try {
    const qClient = "CALL CadCli(?)";
    const qLogin = "CALL AddLogin(1, ?)";

    const valuesClient = [
      req.body.CPF,
      req.body.Nome,
      req.body.Email,
      req.body.Telefone,
      req.body.CEP,
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
  } catch (err) {
    res.json(err);
  }
});

router.put("/:id", async (req, res) => {
  const adminId = req.params.id;
  const { Nome, Email, Telefone, password } = req.body;

  try {
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const queryPassword = "UPDATE tbLogin SET `Senha` = ? WHERE IdCli = ?";
      const valuesPassword = [hashedPassword];

      await executeUpdate(queryPassword, [valuesPassword, adminId]);
    }
    const queryAdmin =
      "UPDATE tbCliente SET `Nome` = ?, `Email` = ?, `Telefone` = ? WHERE Id = ?";
    const queryLogin = "UPDATE tbLogin SET `Email` = ? WHERE IdCli = ?";

    const valuesAdmin = [Nome, Email, Telefone];
    const valuesLogin = [Email];

    await executeUpdate(queryAdmin, [valuesAdmin, adminId]);
    await executeUpdate(queryLogin, [valuesLogin, adminId]);

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (err) {
    console.log("Erro ao atualizar os dados.", err);
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

/*
  FUNÇÃO CRIADA PARA EXECUTAR CONSULTAS COM PARAMETROS.
*/
function queryPromise(query, params) {
  return new Promise((resolve, reject) => {
    mySql.query(query, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/*
  FUNÇÃO CRIADA PARA EXECUTAR UPDATE NO BANCO DE DADOS. ELE PEGA OS VALORES A SEREM ATUALIZADOS E O ID.
*/
function executeUpdate(query, [values, id]) {
  return new Promise((resolve, reject) => {
    mySql.query(query, [...values, id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default router;
