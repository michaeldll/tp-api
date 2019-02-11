const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenAward} = req;
        if (givenAward.name) {
            const {Awards} = req.db;
            let award = await Awards.findOne({where: {name: givenAward.name}});
            if (award) res.status(409).send({message: 'This award already exists'});
            award = await Awards.create(givenAward);
            res.status(201).send(award);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:awardId', async (req, res) => {
    const awardId = req.params.awardId;
    const {Awards} = req.db;
    const award = await Awards.findOne({ where: {id: awardId} });
    if (award) {
        return res.status(200).send(award);
    } else {
        return res.status(404)
            .send({message: `Award ${awardId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Awards} = req.db;
    const {id, name} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (name) filters.where.name = name;
    const awards = await Awards.findAll(filters);
    if (awards) {
        return res.status(200).send(awards);
    } else {
        return res.status(404)
            .send({message: `Awards not found`});
    }
});

router.put('/:awardId', async (req, res) => {
    const awardId = req.params.awardId;
    const {Awards} = req.db;
    const {body: givenAward} = req;
    try {
        if (givenAward.name) {
            const r = await Awards.update(
                { name: givenAward.name },
                { where: { id: awardId } }
            );
            if (r[0]) {
                const award = await Awards.findOne( { where: { id: awardId } });
                return res.status(200).send(award);
            } else {
                return res.status(404).send({
                    message: `Award ${awardId} not found`
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

router.delete('/:awardId', async (req, res) => {
    const awardId = req.params.awardId;
    const {Awards} = req.db;
    let award = await Awards.findOne({where: {id: awardId}});
    if (award) {
        await Awards.destroy({ where: { id: awardId } });
        return res.status(200).send({message: 'Award deleted'});
    } else
        return res.status(404).send({message: `Award ${awardId} not found`});
});

module.exports = router;
