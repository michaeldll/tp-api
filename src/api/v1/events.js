const express = require('express');
const request = require('request-promise');
const router = express.Router();

router.post('/', async (req, res) => {
    const {body: givenEvent} = req;
    if (givenEvent.date && givenEvent.description && givenEvent.title) {
        const {Events} = req.db;
        const eventDate = new Date(givenEvent.date);
        let event = await Events.findOne({where: {date: eventDate.toISOString(), title: givenEvent.title}});
        if (event)
            res.status(409).send({message: 'Event already exists'});
        else {
            event = await Events.create(givenEvent);
            res.status(201).send(event);   
        }
    } else {
        res.status(400).send({message: 'Missing data'});
    }
});

router.get('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const {Events} = req.db;
    const event = await Events.findOne({ where: {id: eventId} });
    if (event) {
        return res.status(200).send(event);
    } else {
        return res.status(404)
            .send({message: `Event ${eventId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Events} = req.db;
    const id = req.query.id;
    const description = req.query.description;
    let date = req.query.date;
    const title = req.query.title;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (description) filters.where.description = description;
    if (date) {
        date = new Date(date);
        date = date.toISOString();
        filters.where.date = date;
    }
    if (title) filters.where.title = title;
    events = await Events.findAll(filters);
    if (events) return res.status(200).send(events);
    else return res.status(404).send({message: `Events not found`});
});

router.put('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const {Events} = req.db;
    const {body: givenEvent} = req;
    const eventToReplace = await Events.findOne({where: {id: eventId}});
    if (eventToReplace) {
        try {
            if (givenEvent.title && givenEvent.date && givenEvent.description) {
                await Events.update(
                    { title: givenEvent.title, date: givenEvent.date, description: givenEvent.description },
                    { where: { id: eventId } }
                );
                const event = await Events.findOne( { where: { id: eventId } });
                return res.status(200).send(event);
            } else {
                return res.status(400).send({message: 'Missing data'});
            }
        } catch (e) {
            return res.status(400).send({
                message: e.message
            });
        }
    } else {
        return res.status(404).send({
            message: `Event ${eventId} not found`
        });
    }
});

router.patch('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const {Events} = req.db;
    const {body: givenEvent} = req;
    const eventToUpdate = await Events.findOne({where: {id: eventId}});
    if (eventToUpdate) {
        try {
            await Events.update(givenEvent, {where: {id: eventId}});
        } catch (e) {
            return res.status(400).send({message: e.message});
        }
        const eventUpdated = await Events.findOne({where: {id: eventId}});
        return res.status(200).send(eventUpdated);
    } else {
        return res.status(404).send({message: `Event ${eventId} not found`});
    }
});

router.delete('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const {Events} = req.db;
    let event = await Events.findOne({where: {id: eventId}});
    if (event) {
        await Events.destroy({ where: { id: eventId } });
        return res.status(200).send({message: 'Event deleted'});
    } else
        return res.status(404).send({message: `Event ${eventId} not found`});
});

module.exports = router;
