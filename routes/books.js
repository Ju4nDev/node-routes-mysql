import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

//ROTA QUE TRAZ TODOS OS LIVROS DA API
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://liber-api.onrender.com/book");
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao buscar as informações do livro" });
  }
});

//ROTA QUE ACESSA UM LIVRO EM ESPECIFICO
router.get("/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const response = await axios.get(
      `https://liber-api.onrender.com/book/${bookId}`
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao buscar as informações do livro" });
  }
});

//ROTA QUE CADASTRA UM LIVRO
router.post("/", async (req, res) => {
  try {
    await axios.post("https://liber-api.onrender.com/book", req.body);
    res.json("Livro cadastrado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao enviar as informações do livro" });
  }
});

//ROTA QUE ATUALIZA UM LIVRO
router.put("/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    await axios.put(`https://liber-api.onrender.com/book/${bookId}`, req.body);
    res.json("Livro atualizado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao atualizar as informações do livro" });
  }
});

//ROTA QUE DELETA UM LIVRO
router.delete("/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    await axios.delete(`https://liber-api.onrender.com/book/${bookId}`);
    res.json("Livro deletado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao deletar as informações do livro" });
  }
});

//ROTA QUE TRAZ TODOS AS IMAGENS DOS LIVROS DA API
router.get("/images", async (req, res) => {
  try {
    const response = await axios.get(
      "https://liber-api.onrender.com/book/images"
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao buscar as informações do livro" });
  }
});

//ROTA QUE CADASTRA A IMAGEM DO LIVRO
router.post("/images", upload.single("image"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));

    console.log(form);

    const response = await axios.post(
      `https://liber-api.onrender.com/book/images`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    res.json(response.data.name);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ err: "Erro ao enviar as informações da imagem do livro" });
  }
});

//ROTA QUE DELETA AS IMAGENS
router.delete("/images", async (req, res) => {
  try {
    await axios.delete("https://liber-api.onrender.com/book/images");
    res.json("Imagem deletada com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Erro ao deletar as informações do livro" });
  }
});

export default router;
