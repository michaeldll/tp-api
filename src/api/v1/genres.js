const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenGenre} = req;
        if (givenGenre.name) {
            const {Genres} = req.db;
            let genre = await Genres.findOne({where: {name: givenGenre.name}});
            if (genre) res.status(409).send({message: 'This genre already exists'});
            genre = await Genres.create(givenGenre);
            res.status(201).send(genre);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:genreId', async (req, res) => {
    const genreId = req.params.genreId;
    const {Genres} = req.db;
    const genre = await Genres.findOne({ where: {id: genreId} });
    if (genre) {
        return res.status(200).send(genre);
    } else {
        return res.status(404)
            .send({message: `Genre ${genreId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Genres} = req.db;
    const {id, name} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (name) filters.where.name = name;
    const genres = await Genres.findAll(filters);
    if (genres) {
        return res.status(200).send(genres);
    } else {
        return res.status(404)
            .send({message: `Genres not found`});
    }
});

router.put('/:genreId', async (req, res) => {
    const genreId = req.params.genreId;
    const {Genres} = req.db;
    const {body: givenGenre} = req;
    try {
        if (givenGenre.name) {
            const r = await Genres.update(
                { name: givenGenre.name },
                { where: { id: genreId } }
            );
            if (r[0]) {
                const genre = await Genres.findOne( { where: { id: genreId } });
                return res.status(200).send(genre);
            } else {
                return res.status(404).send({
                    message: `Genre ${genreId} not found`
                });
            }
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch (e) {
        console.log(e);
        return res.status(400).send({
            message: e
        });
    }
});

router.delete('/:genreId', async (req, res) => {
    const genreId = req.params.genreId;
    const {Genres} = req.db;
    let genre = await Genres.findOne({where: {id: genreId}});
    if (genre) {
        await Genres.destroy({ where: { id: genreId } });
        return res.status(200).send({message: 'Genre deleted'});
    } else
        return res.status(404).send({message: `Genre ${genreId} not found`});
});

module.exports = router;
