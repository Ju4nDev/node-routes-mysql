import express from 'express';
import axios from 'axios';

const router = express.Router();

//ROTA PARA TRAZER TODAS AS EDITORAS DA API
router.get('/', async (req, res) => {
    try{
        const response = await axios.get("https://liber-api.onrender.com/publishingcompany");
        res.json(response.data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao buscar as editoras."});
    }
});

//ROTA PARA TRAZER UMA EDITORA EM ESPECÍFICO
router.get('/:id', async (req, res) => {
    const publishingId = req.params.id;

    try{
        const response = await axios.get(`https://liber-api.onrender.com/publishingcompany/${publishingId}`);
        res.json(response.data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao buscar a editora."});
    }
});

//ROTA PARA CADASTRAR UMA EDITORA
router.post('/', async (req, res) => {    
    try{
        await axios.post("https://liber-api.onrender.com/publishingcompany", req.body);
        res.json("Editora cadastrada com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao cadastrar a editora."});
    }
});

//ROTA PARA ATUALIZAR UMA EDITORA
router.put('/:id', async (req, res) => {
    const publishingId = req.params.id;

    try{
        await axios.put(`https://liber-api.onrender.com/publishingcompany/${publishingId}`, req.body);
        res.json("Editora atualizada com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao atualizar a editora."});
    }
});

//ROTA PARA DELETAR UMA EDITORA
router.delete('/:id', async (req, res) => {
    const publishingId = req.params.id;

    try{
        await axios.delete(`https://liber-api.onrender.com/publishingcompany/${publishingId}`);
        res.json("Editora deletada com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({err: "Erro ao deletar a editora."});
    }
})

export default router;