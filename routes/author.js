import express from 'express';
import axios from 'axios';

const router = express.Router();

//ROTA PARA TRAZER TODOS OS AUTORES
router.get('/', async (req, res) => {
    try{
        const response = await axios.get("https://liber-api.onrender.com/author");
        res.json(response.data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao buscar os autores."});
    }
});

//ROTA PARA TRAZER UM AUTOR EM ESPECÍFICO
router.get('/:id', async (req, res) => {
    const authorId = req.params.id;

    try{
        const response = await axios.get(`https://liber-api.onrender.com/author/${authorId}`);
        res.json(response.data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao buscar o autor."});
    }
});

//ROTA PARA CADASTRAR UM AUTOR
router.post('/', async (req, res) => {
    try{
        await axios.post("https://liber-api.onrender.com/author", req.body);
        res.json("Autor cadastrado com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao cadastrar o autor."});
    }
});

//ROTA PARA DELETAR UM AUTOR
router.delete('/:id', async (req, res) => {
    const authorId = req.params.id;

    try{
        await axios.delete(`https://liber-api.onrender.com/author/${authorId}`);
        res.json("Autor deletado com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao deletar o autor."});
    }
});

export default router;