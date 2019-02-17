'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/authors_awards');

const server = request(createServer());

describe.only('AuthorsAwards api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from AuthorsAwards');
        const {AuthorsAwards} = database;
        const promises = fixtures.map(authorAward => AuthorsAwards.create(authorAward));
        await Promise.all(promises);
    });

    describe('POST authorsAwards api', function() {
        it("Sends all required data, receives 201 and the authorsAward created", async () => {
            const {body: authorsAwards} = await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                })
                .expect(201);
            expect(authorsAwards.AwardId).to.equal(1);
            expect(authorsAwards.AuthorId).to.equal(1);
            expect(authorsAwards).to.be.an('object');
        });

        it("Sends all required data and wrong property, receives 201 and the authorsAward created", async () => {
            const {body: authorsAwards} = await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1,
                test: 'test'
            })
            .expect(201);
            expect(authorsAwards.AwardId).to.equal(1);
            expect(authorsAwards.AuthorId).to.equal(1);
            expect(authorsAwards.test).to.equal(undefined);
            expect(authorsAwards).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the authorsAward created", async () => {
            const {body: authorsAwards} = await server.post('/api/v1/authorsAwards')
            .send({
                id: 150,
                AwardId: 1,
                AuthorId: 1
            })
            .expect(201);
            expect(authorsAwards.AwardId).to.equal(1);
            expect(authorsAwards.id).to.equal(150);
            expect(authorsAwards.AuthorId).to.equal(1);
            expect(authorsAwards).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({})
                .expect(400);
        });

        it("Sends partial data, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1
            })
            .expect(400);
        });

        it("Sends existing AuthorId and AwardId, receives 409", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                })
                .expect(201);
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                })
                .expect(409);
        });

        it("Sends non-existing authorId, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1000
                })
                .expect(404);
        });

        it("Sends non-existing awardId, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1000,
                    AuthorId: 1
                })
                .expect(404);
        });

        it("Sends non-existing awardId and authorId, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1000,
                    AuthorId: 1000
                })
                .expect(404);
        });

        it("Sends existing authorId and new awardId, receives 201", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                })
                .expect(201);
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 2,
                    AuthorId: 1
                })
                .expect(201);
        });

        it("Sends existing awardId and new authorId, receives 201", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                })
                .expect(201);
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 2
                })
                .expect(201);
        });
    });

    describe('GET /api/v1/authorsAwards/:authorAwardId', function() {
        it("Requests a non-existing authorAwardId, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/authorsAwards/1000')
                .expect(404);
            expect(err.message).to.equal('AuthorAward 1000 not found');
        });

        it("Requests an existing authorAward, receives 200 and the authorAward", async () => {
            const {body: preAuthorAward} = await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                });
            const {body: authorAward} = await server.get('/api/v1/authorsAwards/' + preAuthorAward.id)
                .expect(200);
            expect(authorAward.AwardId).to.equal(1);
            expect(authorAward.AuthorId).to.equal(1);
            expect(authorAward).to.be.an('object');
        });
    });

    describe('GET /api/v1/authorsAwards/', function() {
        it("Requests all authorsAwards, receives 200 and authorsAwards list", async () => {
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards')
                .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with not matching specs, receive 404 and empty authorsAwards list", async () => {
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?id=10&AwardId=8')
                .expect(200);
            expect(authorsAwards.length).to.equal(0);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching AwardId specs, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?AwardId=1')
            .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching AuthorId specs, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?AuthorId=1')
            .expect(200);
            expect(authorsAwards.length).to.equal(2);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards[1].AwardId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching id specs, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?id=1')
            .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching AuthorId and AwardId specs, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?AuthorId=1&AwardId=3')
            .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching specs, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?AuthorId=1&AwardId=3&id=1')
            .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards[0].id).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with matching specs and wrong filter, receive 200 and authorsAwards list", async () => {
            await server.post('/api/v1/authorsAwards')
            .send({
                AwardId: 1,
                AuthorId: 1
            });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?AuthorId=1&AwardId=3&loop=true')
            .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(3);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });
    });

    describe('PUT /api/v1/authorsAwards/:authorAwardId', function() {
        it("Replaces a non-existing authorAward, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/authorsAwards/10')
                .send({
                    AuthorId: 1,
                    AwardId: 1
                })
                .expect(404);
            expect(err.message).to.equal('AuthorAward 10 not found');
        });

        it("Updates an existing authorAward, receives 200 and the new authorAward", async () => {
            const {body: authorAward} = await server.put('/api/v1/authorsAwards/1')
                .send({
                    AuthorId: 1,
                    AwardId: 2
                })
                .expect(200);
            expect(authorAward.id).to.equal(1);
            expect(authorAward.AuthorId).to.equal(1);
            expect(authorAward.AwardId).to.equal(2);
            expect(authorAward).to.be.an('object');
        });

        it("Updates an existing authorAward with wrong property, receives 200 and the new authorAward", async () => {
            const {body: authorAward} = await server.put('/api/v1/authorsAwards/1')
            .send({
                AuthorId: 1,
                AwardId: 2,
                test: 'test'
            })
            .expect(200);
            expect(authorAward.id).to.equal(1);
            expect(authorAward.AuthorId).to.equal(1);
            expect(authorAward.AwardId).to.equal(2);
            expect(authorAward.test).to.equal(undefined);
            expect(authorAward).to.be.an('object');
        });

        it("Updates an existing authorAward with no data sent, receives 400", async () => {
            await server.put('/api/v1/authorsAwards/1')
                .send({})
                .expect(400);
        });

        it("Updates an existing authorAward with partial data sent, receives 400", async () => {
            await server.put('/api/v1/authorsAwards/1')
            .send({
                AwardId: 8
            })
            .expect(400);
        });
    });

    describe('DELETE /api/v1/authorsAwards/:authorAwardId', function () {
        it('Deletes an existing authorAward, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/authorsAwards/1')
                .expect(200);
            expect(msg.message).to.equal('AuthorAward deleted');
            await server.get('/api/v1/authorsAwards/1')
                .expect(404);
        });

        it('Deletes a non-existing authorAward, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/authorsAwards/1000')
                .expect(404);
            expect(err.message).to.equal('AuthorAward 1000 not found');
        })
    })
});
