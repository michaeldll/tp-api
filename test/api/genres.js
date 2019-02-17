'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/genres');

const server = request(createServer());

describe.only('Genres api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from GENRES');
        const {Genres} = database;
        const promises = fixtures.map(genre => Genres.create(genre));
        await Promise.all(promises);
    });

    describe('POST genres api', function() {
        it("Sends all required data, receives 201 and the event created", async () => {
            const {body: genre} = await server.post('/api/v1/genres')
                .send({
                    name: 'Romantique'
                })
                .expect(201);
            expect(genre.name).to.equal('Romantique');
            expect(genre).to.be.an('object');
        });

        it("Sends all required data with wrong property, receives 201 and the event created", async () => {
            const {body: genre} = await server.post('/api/v1/genres')
            .send({
                name: 'Romantique',
                test: 'test'
            })
            .expect(201);
            expect(genre.name).to.equal('Romantique');
            expect(genre.test).to.equal(undefined);
            expect(genre).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the event created", async () => {
            const {body: genre} = await server.post('/api/v1/genres')
            .send({
                id: 15,
                name: 'Romantique'
            })
            .expect(201);
            expect(genre.name).to.equal('Romantique');
            expect(genre.id).to.equal(15);
            expect(genre).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/genres')
                .send({})
                .expect(400);
        });

        it("Sends existing genre, receives 409", async () => {
            await server.post('/api/v1/genres')
                .send({
                    name: 'Thriller'
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/genres/:genreId', function() {
        it("Requests a non-existing genre, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/genres/1000')
                .expect(404);
            expect(err.message).to.equal('Genre 1000 not found');
        });

        it("Requests an existing genre, receives 200 and the genre", async () => {
            const {body: genre} = await server.get('/api/v1/genres/1')
                .expect(200);
            expect(genre.id).to.equal(1);
            expect(genre.name).to.equal('Thriller');
            expect(genre).to.be.an('object');
        });
    });

    describe('GET /api/v1/genres/', function() {
        it("Requests all genres, receives 200 and genres list", async () => {
            const {body: editors} = await server.get('/api/v1/genres')
                .expect(200);
            expect(editors.length).to.equal(1);
            expect(editors[0].id).to.equal(1);
            expect(editors[0].name).to.equal('Thriller');
            expect(editors).to.be.an('array');
        });

        it("Requests all genres with not matching specs, receive 200 and empty genres list", async () => {
            const {body: genres} = await server.get('/api/v1/genres?id=10&name=hello')
                .expect(200);
            expect(genres.length).to.equal(0);
            expect(genres).to.be.an('array');
        });

        it("Requests all genres with not matching specs, receive 200 and genres list", async () => {
            const {body: genres} = await server.get('/api/v1/genres?name=Thriller')
            .expect(200);
            expect(genres.length).to.equal(1);
            expect(genres[0].name).to.equal('Thriller');
            expect(genres).to.be.an('array');
        });
    });

    describe('PUT /api/v1/genres/:genreId', function() {
        it("Replaces a non-existing genre, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/genres/10')
                .send({
                    name: 'Romantique'
                })
                .expect(404);
            expect(err.message).to.equal('Genre 10 not found');
        });

        it("Updates an existing genre, receives 200 and the new genre", async () => {
            const {body: genre} = await server.put('/api/v1/genres/1')
                .send({
                    name: 'Romantique'
                })
                .expect(200);
            expect(genre.name).to.equal('Romantique');
            expect(genre.id).to.equal(1);
            expect(genre).to.be.an('object');
        });

        it("Updates an existing genre + id, receives 200 and the new genre", async () => {
            const {body: genre} = await server.put('/api/v1/genres/1')
            .send({
                id: 15,
                name: 'Romantique'
            })
            .expect(200);
            expect(genre.name).to.equal('Romantique');
            expect(genre.id).to.equal(15);
            expect(genre).to.be.an('object');
        });

        it("Updates an existing genre with no data sent, receives 400", async () => {
            await server.put('/api/v1/genres/1')
                .send({})
                .expect(400);
        })
    });

    describe('DELETE /api/v1/genres/:genreId', function () {
        it('Deletes an existing genre, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/genres/1')
                .expect(200);
            expect(msg.message).to.equal('Genre deleted');
            await server.get('/api/v1/genres/1')
                .expect(404);
        });

        it('Deletes a non-existing genre, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/genres/1000')
                .expect(404);
            expect(err.message).to.equal('Genre 1000 not found');
        })
    })
});
