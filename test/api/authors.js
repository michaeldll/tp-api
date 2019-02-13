'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/authors');

const server = request(createServer());

describe.only('Authors api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from AUTHORS');
        const {Authors} = database;
        const promises = fixtures.map(author => Authors.create(author));
        await Promise.all(promises);
    });

    describe('POST authors api', function() {
        it("Sends all required data, receives 201 and the event created", async () => {
            const {body: author} = await server.post('/api/v1/authors')
                .send({
                    lastName: 'Dostoevsky',
                    firstName: 'Fyodor'
                })
                .expect(201);
            expect(author.lastName).to.equal('Dostoevsky');
            expect(author.firstName).to.equal('Fyodor');            
            expect(author).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/authors')
                .send({})
                .expect(400);
        });

        it("Sends existing author, receives 409", async () => {
            await server.post('/api/v1/authors')
                .send({
                    lastName: 'Verne',
                    firstName: 'Jules'                
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/authors/:authorId', function() {
        it("Requests a non-existing author, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/authors/1000')
                .expect(404);
            expect(err.message).to.equal('Author 1000 not found');
        });

        it("Requests an existing author, receives 200 and the author", async () => {
            const {body: author} = await server.get('/api/v1/authors/1')
                .expect(200);
            expect(author.id).to.equal(1);
            expect(author.lastName).to.equal('Verne');
            expect(author.firstName).to.equal('Jules');
            expect(author).to.be.an('object');
        });
    });

    describe('GET /api/v1/authors/', function() {
        it("Requests all authors, receives 200 and authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors')
                .expect(200);
            expect(authors.length).to.equal(2);
            expect(authors[0].id).to.equal(1);
            expect(authors[0].lastName).to.equal('Verne');
            expect(authors[0].firstName).to.equal('Jules');
            expect(authors[1].id).to.equal(2);
            expect(authors[1].lastName).to.equal('Verneo');
            expect(authors[1].firstName).to.equal('Juleso');
            expect(authors).to.be.an('array');
        });

        it("Requests all authors with not matching specs, receive 404 and empty authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors?id=10&firstName=hello')
                .expect(200);
            expect(authors.length).to.equal(0);
            expect(authors).to.be.an('array');
        });
    });

    describe('PUT /api/v1/authors/:authorId', function() {
        it("Replaces a non-existing author, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/authors/10')
                .send({
                    lastName: 'Dostoevsky',                     
                    firstName: 'Fyodor'
                })
                .expect(404);
            expect(err.message).to.equal('Author 10 not found');
        });

        it("Updates an existing author, receives 200 and the new author", async () => {
            const {body: author} = await server.put('/api/v1/authors/1')
                .send({
                    lastName: 'Verne',                     
                    firstName: 'Jules'
                })
                .expect(200);
            expect(author.lastName).to.equal('Verne');
            expect(author.firstName).to.equal('Jules');                
            expect(author.id).to.equal(1);
            expect(author).to.be.an('object');
        });

        it("Updates an existing author with no data sent, receives 400", async () => {
            await server.put('/api/v1/authors/1')
                .send({})
                .expect(400);
        })
    });

    describe('DELETE /api/v1/authors/:authorId', function () {
        it('Deletes an existing author, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/authors/1')
                .expect(200);
            expect(msg.message).to.equal('Author deleted');
            await server.get('/api/v1/authors/1')
                .expect(404);
        });

        it('Deletes a non-existing author, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/authors/1000')
                .expect(404);
            expect(err.message).to.equal('Author 1000 not found');
        })
    })
});