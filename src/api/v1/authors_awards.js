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
    const {id, AuthorId, AwardId} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = parseInt(id);
    if (AuthorId) filters.where.AuthorId = parseInt(AuthorId);
    if (AwardId) filters.where.AwardId = parseInt(AwardId);
    const authorsAwards = await AuthorsAwards.findAll(filters);
    if (authorsAwards) {
        return res.status(200).send(authorsAwards);
    } else {
        return res.status(404)
            .send({message: `AuthorsAwards not found`});
    }
});

router.put('/:authorAwardId', async (req, res) => {
    const authorAwardId = req.params.authorAwardId;
    const {AuthorsAwards} = req.db;
    const {body: givenAuthorAward} = req;
    try {
        if (givenAuthorAward.AuthorId && givenAuthorAward.AwardId) {
            const r = await AuthorsAwards.update(
                { AuthorId: givenAuthorAward.AuthorId, AwardId: givenAuthorAward.AwardId },
                { where: { id: authorAwardId } }
            );
            if (r[0]) {
                const author = await AuthorsAwards.findOne( { where: { id: authorAwardId } });
                return res.status(200).send(author);
            } else {
                return res.status(404).send({
                    message: `AuthorAward ${authorAwardId} not found`
                });
            }
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch (e) {
        return res.status(400).send({
            message: e
        });
    }
});

router.delete('/:authorAwardId', async (req, res) => {
    const authorAwardId = req.params.authorAwardId;
    const {AuthorsAwards} = req.db;
    let authorAward = await AuthorsAwards.findOne({where: {id: authorAwardId}});
    if (authorAward) {
        await AuthorsAwards.destroy({ where: { id: authorAwardId } });
        return res.status(200).send({message: 'AuthorAward deleted'});
    } else
        return res.status(404).send({message: `AuthorAward ${authorAwardId} not found`});
});

module.exports = router;
