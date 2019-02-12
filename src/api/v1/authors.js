const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenAuthor} = req;
        console.log(givenAuthor);
        if (givenAuthor.lastName) {
            const {Authors} = req.db;
            let author = await Authors.findOne({where: {lastName: givenAuthor.lastName}});
            console.log(author);
            if (author) res.status(409).send({message: 'This author already exists'});
            author = await Authors.create(givenAuthor);
            res.status(201).send(author);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:authorId', async (req, res) => {
    const authorId = req.params.authorId;
    const {Authors} = req.db;
    const author = await Authors.findOne({ where: {id: authorId} });
    if (author) {
        return res.status(200).send(author);
    } else {
        return res.status(404)
            .send({message: `Author ${authorId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Authors} = req.db;
    const {id, lastName} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (lastName) filters.where.lastName = lastName;
    const authors = await Authors.findAll(filters);
    if (authors) {
        return res.status(200).send(authors);
    } else {
        return res.status(404)
            .send({message: `Authors not found`});
    }
});

router.put('/:authorId', async (req, res) => {
    const authorId = req.params.authorId;
    const {Authors} = req.db;
    const {body: givenAuthor} = req;
    try {
        if (givenAuthor.lastName) {
            const r = await Authors.update(
                { lastName: givenAuthor.lastName },
                { where: { id: authorId } }
            );
            if (r[0]) {
                const author = await Authors.findOne( { where: { id: authorId } });
                return res.status(200).send(author);
            } else {
                return res.status(404).send({
                    message: `Author ${authorId} not found`
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

router.delete('/:authorId', async (req, res) => {
    const authorId = req.params.authorId;
    const {Authors} = req.db;
    let author = await Authors.findOne({where: {id: authorId}});
    if (author) {
        await Authors.destroy({ where: { id: authorId } });
        return res.status(200).send({message: 'Author deleted'});
    } else
        return res.status(404).send({message: `Author ${authorId} not found`});
});

module.exports = router;