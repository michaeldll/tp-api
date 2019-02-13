const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenAuthorAward} = req;
        if (givenAuthorAward.AwardId && givenAuthorAward.AuthorId) {
            const {AuthorsAwards} = req.db;
            const authorAward = await AuthorsAwards.create(givenAuthorAward);
            res.status(201).send(authorAward);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeForeignKeyConstraintError')
            res.status(404).send({message: err});
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:authorAwardId', async (req, res) => {
    const authorAwardId = req.params.authorAwardId;
    const {AuthorsAwards} = req.db;
    const authorAward = await AuthorsAwards.findOne({ where: {id: authorAwardId} });
    if (authorAward) {
        return res.status(200).send(authorAward);
    } else {
        return res.status(404)
            .send({message: `AuthorAward ${authorAwardId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {AuthorsAwards} = req.db;
    const {id, lastName} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (lastName) filters.where.lastName = lastName;
    const authorsAwards = await AuthorsAwards.findAll(filters);
    if (authorsAwards) {
        return res.status(200).send(authorsAwards);
    } else {
        return res.status(404)
            .send({message: `AuthorsAwards not found`});
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