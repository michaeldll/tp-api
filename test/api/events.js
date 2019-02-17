'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/events');

const server = request(createServer());

describe.only('Events api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from EVENTS');
        const {Events} = database;
        const promises = fixtures.map(event => Events.create(event));
        await Promise.all(promises);
    });

    describe('POST events api', function() {
        it("Sends all required data, receives 201 and the event created", async () => {
            const {body: event} = await server.post('/api/v1/events')
                .send({
                    date: '2019-02-22',
                    description: 'toto',
                    title: 'titi'
                })
                .expect(201);
            expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
            expect(event.description).to.equal('toto');
            expect(event.title).to.equal('titi');
            expect(event).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the event created", async () => {
            const {body: event} = await server.post('/api/v1/events')
            .send({
                id: 15,
                date: '2019-02-22',
                description: 'toto',
                title: 'titi'
            })
            .expect(201);
            expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
            expect(event.id).to.equal(15);
            expect(event.description).to.equal('toto');
            expect(event.title).to.equal('titi');
            expect(event).to.be.an('object');
        });

        it("Sends all required data with wrong property, receives 201 and the event created", async () => {
            const {body: event} = await server.post('/api/v1/events')
            .send({
                date: '2019-02-22',
                description: 'toto',
                title: 'titi',
                test: 'test'
            })
            .expect(201);
            expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
            expect(event.description).to.equal('toto');
            expect(event.title).to.equal('titi');
            expect(event.test).to.equal(undefined);
            expect(event).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/events')
                .send({})
                .expect(400);
        });

        it("Sends existing event, receives 409", async () => {
            await server.post('/api/v1/events')
                .send({
                    date: '2019-02-22',
                    title: 'À la découverte du Vietnam',
                    description: 'dskljfdskljf'
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/events/:eventId', function() {
        it("Requests a non-existing event, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/events/1000')
                .expect(404);
            expect(err.message).to.equal('Event 1000 not found');
        });

        it("Requests an existing event, receives 200 and the event", async () => {
            const {body: event} = await server.get('/api/v1/events/1')
                .expect(200);
            expect(event.id).to.equal(1);
            expect(event.title).to.equal('À la découverte du Vietnam');
            expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
            expect(event.description).to.equal('Rencontre avec l\'auteure vietnamienne Thuy Linh Ti Ngo.');
            expect(event).to.be.an('object');
        });
    });

    describe('GET /api/v1/events/', function() {
        it("Requests all events, receives 200 and events list", async () => {
            const {body: events} = await server.get('/api/v1/events')
                .expect(200);
            expect(events.length).to.equal(1);
            expect(events[0].id).to.equal(1);
            expect(events[0].date).to.equal('2019-02-22T00:00:00.000Z');
            expect(events[0].description).to.equal('Rencontre avec l\'auteure vietnamienne Thuy Linh Ti Ngo.');
            expect(events[0].title).to.equal('À la découverte du Vietnam');
            expect(events).to.be.an('array');
        });

        it("Requests all events with not matching specs, receives 200 and empty list", async () => {
            const {body: events} = await server.get('/api/v1/events?id=10&description=hello')
                .expect(200);
                expect(events.length).to.equal(0);
                expect(events).to.be.an('array');
        });

        it("Requests all events with matching specs, receives 200 and events list matching specs", async () => {
            await server.post('/api/v1/events')
                .send({
                    title: 'test',
                    description: 'wow',
                    date: '2019-02-22'
                })
                .expect(201);
            const {body: events} = await server.get('/api/v1/events?date=2019-02-22')
                .expect(200);
                expect(events).to.be.an('array');
                expect(events[0].id).to.equal(1);
                expect(events[1].title).to.equal('test');
        });
    });

    describe('PUT /api/v1/events/:eventId', function() {
        it("Replaces a non-existing event, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/events/10')
                .send({
                    description: 'Hello World',
                    title: 'Woah',
                    date: '2010-01-01'
                })
                .expect(404);
            expect(err.message).to.equal('Event 10 not found');
        });

        it("Updates an existing event, receives 200 and the new event", async () => {
            const {body: event} = await server.put('/api/v1/events/1')
            .send({
                description: 'Hello World',
                title: 'Wouah',
                date: '1990-01-01'
            })
            .expect(200);
            expect(event.description).to.equal('Hello World');
            expect(event.id).to.equal(1);
            expect(event.date).to.equal('1990-01-01T00:00:00.000Z');
        });

        it("Updates an existing event with wrong property, receives 200 and the new event", async () => {
            const {body: event} = await server.put('/api/v1/events/1')
            .send({
                description: 'Hello World',
                title: 'Wouah',
                date: '1990-01-01',
                test: 'test'
            })
            .expect(200);
            expect(event.description).to.equal('Hello World');
            expect(event.id).to.equal(1);
            expect(event.date).to.equal('1990-01-01T00:00:00.000Z');
            expect(event.test).to.equal(undefined);
        });

        it("Updates an existing event + id, receives 200 and the new event", async () => {
            const {body: event} = await server.put('/api/v1/events/1')
            .send({
                id: 15,
                description: 'Hello World',
                title: 'Wouah',
                date: '1990-01-01'
            })
            .expect(200);
            expect(event.description).to.equal('Hello World');
            expect(event.title).to.equal('Wouah');
            expect(event.id).to.equal(15);
            expect(event.date).to.equal('1990-01-01T00:00:00.000Z');
        });

        it("Updates an existing event with not correct data sent, receives 400", async () => {
            await server.put('/api/v1/events/1')
                .send({
                    description: 'not enough'
                })
                .expect(400);
        });
    });

    describe('PATCH /api/v1/events/:eventId', function() {
        it('Updates an existing event, receives 200 and the updated event', async () => {
            const {body: event} = await server.patch('/api/v1/events/1')
                .send({
                    description: 'Avec patch, ça fonctionne'
                })
                .expect(200);
                expect(event).to.be.an('object');
                expect(event.id).to.equal(1);
                expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
                expect(event.description).to.equal('Avec patch, ça fonctionne');
        });

        it('Updates an existing event with wrong propery, receives 200 and the updated event', async () => {
            const {body: event} = await server.patch('/api/v1/events/1')
            .send({
                test: 'test'
            })
            .expect(200);
            expect(event).to.be.an('object');
            expect(event.id).to.equal(1);
            expect(event.date).to.equal('2019-02-22T00:00:00.000Z');
            expect(event.test).to.equal(undefined);
            expect(event.description).to.equal('Rencontre avec l\'auteure vietnamienne Thuy Linh Ti Ngo.');
        });

        it('Updates a non-existing event, receives 404', async () => {
            const {body: err} = await server.patch('/api/v1/events/10')
                .send({
                    description: 'sniff'
                })
                .expect(404);
                expect(err.message).to.equal('Event 10 not found');
        })
    });

    describe('DELETE /api/v1/events/:eventId', function () {
        it('Deletes an existing event, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/events/1')
                .expect(200);
            expect(msg.message).to.equal('Event deleted');
            await server.get('/api/v1/events/1')
                .expect(404);
        });

        it('Deletes a non-existing event, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/events/1000')
                .expect(404);
            expect(err.message).to.equal('Event 1000 not found');
        })
    })
});
