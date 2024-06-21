import express from "express";
import mysql2 from "mysql2";
import bcryptjs from "bcryptjs";
import admin from "../config/firebase-admin-config.js";

const mySql = mysql2.createPool({
  connectionLimit: 10,
  host: "liber-database-liber-database.k.aivencloud.com",
  user: "avnadmin",
  port: "11402",
  password: "AVNS_lJtaSOsfd8-WNQ00Eb6",
  database: "bdLiber",
});

const router = express.Router();

/* ROTA ESPECÍFICA PARA LOGIN COM O GOOGLE */
router.post("/login/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const q = `SELECT * FROM tbCliente WHERE Email = ?`;

    mySql.query(q, [email], (err, clientData) => {
      if (err) res.json(err);
      else {
        if (clientData.length > 0) {
          const user = clientData[0];

          res.status(200).json({
            message: "Autenticação bem sucedida.",
            uid: uid,
            Id: user.Id,
          });
        } else {
          res.status(200).json({
            message: "Autenticação bem sucedida.",
            uid: uid,
          });
        }
      }
    });
  } catch (err) {
    console.log("Autenticação falhou.", err);
  }
});

router.post("/login/auth/facebook", async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const q = `SELECT * FROM tbCliente WHERE Email = ?`;

    mySql.query(q, [email], (err, clientData) => {
      if (err) res.json(err);
      else {
        if (clientData.length > 0) {
          const user = clientData[0];

          res.status(200).json({
            message: "Autenticação bem sucedida.",
            uid: uid,
            Id: user.Id,
          });
        } else {
          res.status(200).json({
            message: "Autenticação bem sucedida.",
            uid: uid,
          });
        }
      }
    });
  } catch (err) {
    console.log("Autenticação falhou.", err);
  }
});

/*
  ROTA PARA LOGIN. FOI USADO POST PARA GARANTIR SEGURANÇA NA URL, PARA QUE DADOS SENSIVEIS 
  NÃO APAREÇAM. ESTAMOS PASSANDO OS PARAMETROS EM UM CORPO JSON.
*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const q = "SELECT * FROM tbLogin WHERE Email = ? AND Adm = 0";

  mySql.query(q, [email], async (err, clientData) => {
    if (err) return res.json(err);
    else {
      if (clientData.length > 0) {
        const user = clientData[0];

        //LÓGICA PARA COMPARAR A SENHA ENVIADA PELA APLICAÇÃO COM O HASH DO BANCO
        const match = await bcryptjs.compare(password, user.Senha);

        if (match) {
          res.json({
            message: "Login Successful",
            user: { Email: user.Email, Id: user.IdCli },
          });
        } else res.json({ message: "Invalid Credentials" });
      } else res.json({ message: "Invalid credentials" });
    }
  });
});

// ROTA PARA CADASTRAR USUARIO. TAMBÉM FAZ O CADASTRO DE USUARIO QUE LOGA COM GOOGLE
router.post("/", async (req, res) => {
  try {
    const qClient = "call CadCli(?)";

    const cleanedCPF = cleanInput(req.body.CPF);
    const cleanedTelefone = cleanInput(req.body.Telefone);
    const cleanedCEP = cleanInput(req.body.CEP);

    const valuesClient = [
      cleanedCPF,
      req.body.Nome,
      req.body.Email,
      cleanedTelefone,
      cleanedCEP,
      req.body.Logradouro,
      req.body.Uf,
      req.body.NomeCid,
      req.body.NumeroEnd,
      req.body.Complemento,
    ];

    if (req.body.Senha) {
      const qLogin = "call AddLogin(0, ?)";

      // CRIPTOGRAFIA DE SENHA NO MYSQL
      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(req.body.Senha, saltRounds);

      const valuesLogin = [req.body.Email, hashedPassword];

      await executeQuery(qClient, valuesClient);
      await executeQuery(qLogin, valuesLogin);
      res.json("Cliente cadastrado!");
    } else {
      await executeQuery(qClient, valuesClient);
      const q = `SELECT * FROM tbCliente WHERE Email = ?`;

      mySql.query(q, [req.body.Email], async (err, clientData) => {
        if (err) res.json(err);
        else {
          if (clientData.length > 0) {
            const user = clientData[0];

            res.json({
              message: "Cliente cadastrado!",
              user: { Id: user.Id },
            });
          } else {
            res.json({ message: "Erro ao recuperar o ID do cliente." });
          }
        }
      });
    }
  } catch (err) {
    res.json(err);
  }
});

//ROTA PARA PEGAR DADOS DO USUARIO ESPECIFICO
router.get("/:id", async (req, res) => {
  const clientId = req.params.id;

  const query = `
    SELECT 
        tbCliente.Nome, Telefone,
        tbLogin.Email
    FROM 
        tbCliente
    LEFT JOIN 
        tbLogin ON tbCliente.Id = tbLogin.IdCli
    LEFT JOIN 
        tbCliente_Endereco ON tbCliente.CPF = tbCliente_Endereco.CPF
    LEFT JOIN 
        tbEndereco ON tbCliente_Endereco.CEP = tbEndereco.CEP
    WHERE 
        tbCliente.Id = ${clientId};;
  `;

  const [result] = await queryPromise(query, [clientId]);

  res.json(result);
});

//ROTA PARA ALTERAR INFORMAÇÕES DE PERFIL DO USUARIO
router.put("/:id", async (req, res) => {
  const clientId = req.params.id;
  const { Nome, Email, Telefone, currentPassword, newPassword } = req.body;

  try {
    //SE USUARIO ALTERAR A SENHA, ELE ENTRA NESSA CONDICIONAL
    if (currentPassword || newPassword) {
      const qGetCurrentPassword = `SELECT Senha FROM tbLogin WHERE IdCli = ?`;

      const result = await queryPromise(qGetCurrentPassword, [clientId]);

      if (result.length === 0)
        return res.status(404).json({ message: "Usuário não encontrado." });

      const isPasswordValid = await bcryptjs.compare(
        currentPassword,
        result[0].Senha
      );

      if (!isPasswordValid)
        return res.status(400).json({ message: "Senha atual incorreta." });

      const qClient =
        "UPDATE tbCliente set `Nome` = ?, `Email` = ? WHERE Id = ?";
      const valuesClient = [Nome, Email, Telefone];
      await executeUpdate(qClient, [valuesClient, clientId]);

      //HASHA A NOVA SENHA QUE O USUARIO INSERIU E MANDA PRA TABELA
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      const qLogin =
        "UPDATE tbLogin SET `Email` = ?, `Senha` = ? WHERE IdCli = ?";
      const valuesLogin = [Email, hashedPassword];
      await executeUpdate(qLogin, [valuesLogin, clientId]);
    }

    //SE ELE ATUALIZAR DADOS SEM ALTERAR A SENHA, ELE ENTRA AQUI.
    else {
      if (!Email) {
        const qClient =
          "UPDATE tbCliente set `Nome` = ?, `Telefone` = ? WHERE Id = ?";
        const valuesClient = [Nome, Telefone];
        await executeUpdate(qClient, [valuesClient, clientId]);
      } else {
        const qClient =
          "UPDATE tbCliente set `Nome` = ?, `Email` = ?, `Telefone` = ? WHERE Id = ?";
        const valuesClient = [Nome, Email, Telefone];
        await executeUpdate(qClient, [valuesClient, clientId]);

        const qLogin = "UPDATE tbLogin SET `Email` = ? WHERE IdCli = ?";
        const valuesLogin = [Email];
        await executeUpdate(qLogin, [valuesLogin, clientId]);
      }
    }

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (err) {
    console.log("Erro ao atualizar os dados.", err);
  }
});

//ROTA PARA PEGAR ENDEREÇO DO USUARIO
router.get("/address/:id", async (req, res) => {
  const clientId = req.params.id;

  const query = `
  SELECT 
      tbEndereco.CEP,
      tbEndereco.Logradouro,
      tbNumero.Numero,
      tbNumero.Complemento,
      tbCidade.Nome AS Cidade,
      tbEstado.Uf AS Estado
  FROM 
      tbCliente
  INNER JOIN 
      tbCliente_Endereco ON tbCliente.CPF = tbCliente_Endereco.CPF
  INNER JOIN 
      tbEndereco ON tbCliente_Endereco.CEP = tbEndereco.CEP
  INNER JOIN 
      tbNumero ON tbCliente.IdNum = tbNumero.Id
  INNER JOIN 
      tbCidade ON tbEndereco.IdCid = tbCidade.Id
  INNER JOIN 
      tbEstado ON tbEndereco.IdUf = tbEstado.Id
  WHERE 
      tbCliente.Id = ${clientId};
`;

  const [result] = await queryPromise(query, clientId);

  res.json(result);
});

//ROTA PARA ATUALIZAR ENDEREÇO
router.put("/address/:id", async (req, res) => {
  const clientId = req.params.id;

  try {
    const q = `CALL AtualizaEndereco(?)`;

    const valuesEndereco = [
      req.body.CEP,
      req.body.Logradouro,
      req.body.Numero,
      req.body.Complemento,
      req.body.Cidade,
      req.body.Estado,
      clientId,
    ];

    await executeQuery(q, valuesEndereco);

    res.json({ message: "Endereço atualizado com sucesso!" });
  } catch (err) {
    console.log("Erro ao atualizar o endereço.", err);
  }
});

/*FUNÇÃO CRIADA PARA EXECUTAR A QUERY NO BANCO, PARA ENCURTAR A SINTAXE E FICAR MAIS DINÂMICO.
  PROMISE É UMA FORMA DE LIDAR COM OPERAÇÕES ASSÍNCRONAS EM JAVASCRIPT, PERMITINDO QUE EXECUTEMOS UM CÓDIGO QUANDO A OPERAÇÃO FOR
  BEM-SUCEDIDA OU QUANDO OCORRER UM ERRO. É UMA FORMA DE DEIXAR UM CÓDIGO MAIS LIMPO.
*/
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    mySql.query(query, [values], (err, data) => {
      if (err) reject(err);
      else resolve(data);
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

/* FUNÇÃO COM REGEX PARA LIMPAR CPF, TELEFONE E CEP */
function cleanInput(input) {
  return input.replace(/[.\-]/g, '');
};

export default router;
