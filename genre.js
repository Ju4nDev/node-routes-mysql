import express from 'express';
import axios from 'axios';

const router = express.Router();

//ROTA QUE TRAZ TODOS OS GENEROS DA API
router.get('/', async (req, res) => {
    try{
        const response = await axios.get("https://liber-api.onrender.com/genre");
        res.json(response.data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ err: "Erro ao buscar os gêneros." });
    }
});

//ROTA QUE TRAZ UM GENERO EM ESPECIFICO
router.get('/:id', async (req, res) => {
    const genreId = req.params.id;

    try{
        const response = await axios.get(`https://liber-api.onrender.com/genre/${genreId}`);
        res.json(response.data)
    }
    catch(err){
        console.error(err);
        res.status(500).json({ err: "Erro ao buscar os gêneros." });
    }
});

//ROTA QUE CADASTRA UM GENERO
router.post('/', async (req, res) => {
    try{
        await axios.post("https://liber-api.onrender.com/genre", req.body);
        res.json("Gênero cadastrado com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({ err: "Erro ao cadastrar o gênero." });
    }
});

//ROTA QUE DELETA UM GENERO
router.delete('/:id', async (req, res) => {
    const genreId = req.params.id;

    try{
        await axios.delete(`https://liber-api.onrender.com/genre/${genreId}`);
        res.json("Gênero deletado com sucesso!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({ err: "Erro ao deletar o gênero." });
    }
})

export default router;