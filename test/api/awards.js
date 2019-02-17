'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/awards');

const server = request(createServer());

describe.only('Awards api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from AWARDS');
        const {Awards} = database;
        const promises = fixtures.map(award => Awards.create(award));
        await Promise.all(promises);
    });

    describe('POST awards api', function() {
        it("Sends all required data, receives 201 and the event created", async () => {
            const {body: award} = await server.post('/api/v1/awards')
                .send({
                    name: 'Prix Pulitzer'
                })
                .expect(201);
            expect(award.name).to.equal('Prix Pulitzer');
            expect(award).to.be.an('object');
        });

        it("Sends all required data and wrong property, receives 201 and the event created", async () => {
            const {body: award} = await server.post('/api/v1/awards')
            .send({
                name: 'Prix Pulitzer',
                test: 'test'
            })
            .expect(201);
            expect(award.name).to.equal('Prix Pulitzer');
            expect(award.test).to.equal(undefined);
            expect(award).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the event created", async () => {
            const {body: award} = await server.post('/api/v1/awards')
            .send({
                id: 150,
                name: 'Prix Pulitzer'
            })
            .expect(201);
            expect(award.name).to.equal('Prix Pulitzer');
            expect(award.id).to.equal(150);
            expect(award).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/awards')
                .send({})
                .expect(400);
        });

        it("Sends only id, receives 400", async () => {
            await server.post('/api/v1/awards')
            .send({
                id: 150
            })
            .expect(400);
            await server.get('/api/v1/awards/150')
                .expect(404);
        });

        it("Sends existing award, receives 409", async () => {
            await server.post('/api/v1/awards')
                .send({
                    name: 'Prix Goncourt'
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/awards/:awardId', function() {
        it("Requests a non-existing award, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/awards/1000')
                .expect(404);
            expect(err.message).to.equal('Award 1000 not found');
        });

        it("Requests an existing award, receives 200 and the award", async () => {
            const {body: award} = await server.get('/api/v1/awards/1')
                .expect(200);
            expect(award.id).to.equal(1);
            expect(award.name).to.equal('Prix Goncourt');
            expect(award).to.be.an('object');
        });
    });

    describe('GET /api/v1/awards/', function() {
        it("Requests all awards, receives 200 and awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards')
                .expect(200);
            expect(awards.length).to.equal(3);
            expect(awards[0].id).to.equal(1);
            expect(awards[0].name).to.equal('Prix Goncourt');
            expect(awards[1].id).to.equal(2);
            expect(awards[1].name).to.equal('youuu');
            expect(awards[2].id).to.equal(3);
            expect(awards[2].name).to.equal('ihoh');
            expect(awards).to.be.an('array');
        });

        it("Requests all awards with not matching specs, receive 404 and empty awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards?id=10&name=hello')
                .expect(200);
            expect(awards.length).to.equal(0);
            expect(awards).to.be.an('array');
        });

        it("Requests all awards with matching name specs, receive 404 and empty awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards?name=youuu')
            .expect(200);
            expect(awards.length).to.equal(1);
            expect(awards[0].name).to.equal('youuu');
            expect(awards).to.be.an('array');
        });

        it("Requests all awards with matching id specs, receive 404 and empty awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards?id=2')
            .expect(200);
            expect(awards.length).to.equal(1);
            expect(awards[0].name).to.equal('youuu');
            expect(awards[0].id).to.equal(2);
            expect(awards).to.be.an('array');
        });

        it("Requests all awards with matching specs, receive 404 and empty awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards?id=2&name=youuu')
            .expect(200);
            expect(awards.length).to.equal(1);
            expect(awards[0].name).to.equal('youuu');
            expect(awards[0].id).to.equal(2);
            expect(awards).to.be.an('array');
        });

        it("Requests all awards with matching specs and wrong filter, receive 404 and empty awards list", async () => {
            const {body: awards} = await server.get('/api/v1/awards?id=2&name=youuu&loop=false')
            .expect(200);
            expect(awards.length).to.equal(1);
            expect(awards[0].name).to.equal('youuu');
            expect(awards[0].id).to.equal(2);
            expect(awards).to.be.an('array');
        });
    });

    describe('PUT /api/v1/awards/:awardId', function() {
        it("Replaces a non-existing award, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/awards/10')
                .send({
                    name: 'Prix Pulitzer'
                })
                .expect(404);
            expect(err.message).to.equal('Award 10 not found');
        });

        it("Updates an existing award, receives 200 and the new award", async () => {
            const {body: award} = await server.put('/api/v1/awards/1')
                .send({
                    name: 'Prix Goncourt'
                })
                .expect(200);
            expect(award.name).to.equal('Prix Goncourt');
            expect(award.id).to.equal(1);
            expect(award).to.be.an('object');
        });

        it("Updates an existing award with wrong property, receives 200 and the new award", async () => {
            const {body: award} = await server.put('/api/v1/awards/1')
            .send({
                name: 'Prix Goncourt',
                image: 'lol.png'
            })
            .expect(200);
            expect(award.name).to.equal('Prix Goncourt');
            expect(award.image).to.equal(undefined);
            expect(award.id).to.equal(1);
            expect(award).to.be.an('object');
        });

        it("Updates an existing award with no data sent, receives 400", async () => {
            await server.put('/api/v1/awards/1')
                .send({})
                .expect(400);
        });

        it("Updates an existing award with its id, receives 200 and the new award", async () => {
            const {body: award} = await server.put('/api/v1/awards/1')
            .send({
                id: 5,
                name: 'Prix Goncourt'
            })
            .expect(200);
            expect(award.name).to.equal('Prix Goncourt');
            expect(award.id).to.equal(5);
            expect(award).to.be.an('object');
        });
    });

    describe('DELETE /api/v1/awards/:awardId', function () {
        it('Deletes an existing award, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/awards/1')
                .expect(200);
            expect(msg.message).to.equal('Award deleted');
            await server.get('/api/v1/awards/1')
                .expect(404);
        });

        it('Deletes a non-existing award, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/awards/1000')
                .expect(404);
            expect(err.message).to.equal('Award 1000 not found');
        })
    })
});
