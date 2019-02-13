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

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/authorsAwards')
                .send({})
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
            await server.post('/api/v1/authorsAwards')
                .send({
                    AwardId: 1,
                    AuthorId: 1
                });
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards')
                .expect(200);
            expect(authorsAwards.length).to.equal(1);
            expect(authorsAwards[0].AuthorId).to.equal(1);
            expect(authorsAwards[0].AwardId).to.equal(1);
            expect(authorsAwards).to.be.an('array');
        });

        it("Requests all authorsAwards with not matching specs, receive 404 and empty authorsAwards list", async () => {
            const {body: authorsAwards} = await server.get('/api/v1/authorsAwards?id=10&AwardId=8')
                .expect(200);
            expect(authorsAwards.length).to.equal(0);
            expect(authorsAwards).to.be.an('array');
        });
    });
    //
    // describe('PUT /api/v1/authors/:authorId', function() {
    //     it("Replaces a non-existing author, receives 404", async () => {
    //         const {body: err} = await server.put('/api/v1/authors/10')
    //             .send({
    //                 lastName: 'Dostoevsky',
    //                 firstName: 'Fyodor'
    //             })
    //             .expect(404);
    //         expect(err.message).to.equal('Author 10 not found');
    //     });
    //
    //     it("Updates an existing author, receives 200 and the new author", async () => {
    //         const {body: author} = await server.put('/api/v1/authors/1')
    //             .send({
    //                 lastName: 'Verne',
    //                 firstName: 'Jules'
    //             })
    //             .expect(200);
    //         expect(author.lastName).to.equal('Verne');
    //         expect(author.firstName).to.equal('Jules');
    //         expect(author.id).to.equal(1);
    //         expect(author).to.be.an('object');
    //     });
    //
    //     it("Updates an existing author with no data sent, receives 400", async () => {
    //         await server.put('/api/v1/authors/1')
    //             .send({})
    //             .expect(400);
    //     })
    // });
    //
    // describe('DELETE /api/v1/authors/:authorId', function () {
    //     it('Deletes an existing author, receives 200', async () => {
    //         const {body: msg} = await server.delete('/api/v1/authors/1')
    //             .expect(200);
    //         expect(msg.message).to.equal('Author deleted');
    //         await server.get('/api/v1/authors/1')
    //             .expect(404);
    //     });
    //
    //     it('Deletes a non-existing author, receives 404', async () => {
    //         const {body: err} = await server.delete('/api/v1/authors/1000')
    //             .expect(404);
    //         expect(err.message).to.equal('Author 1000 not found');
    //     })
    // })
});