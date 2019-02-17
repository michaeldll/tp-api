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

        it("Sends all required data and wrong property, receives 201 and the event created", async () => {
            const {body: author} = await server.post('/api/v1/authors')
            .send({
                lastName: 'Dostoevsky',
                firstName: 'Fyodor',
                image: 'lol.png'
            })
            .expect(201);
            expect(author.lastName).to.equal('Dostoevsky');
            expect(author.firstName).to.equal('Fyodor');
            expect(author.image).to.equal(undefined);
            expect(author).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the event created", async () => {
            const {body: author} = await server.post('/api/v1/authors')
            .send({
                id: 150,
                lastName: 'Dostoevsky',
                firstName: 'Fyodor'
            })
            .expect(201);
            expect(author.lastName).to.equal('Dostoevsky');
            expect(author.id).to.equal(150);
            expect(author.firstName).to.equal('Fyodor');
            expect(author).to.be.an('object');
        });

        it("Sends the same author, receives 409", async () => {
            await server.post('/api/v1/authors')
            .send({
                lastName: 'Dostoevsky',
                firstName: 'Fyodor'
            });
            await server.post('/api/v1/authors')
            .send({
                lastName: 'Dostoevsky',
                firstName: 'Fyodor'
            })
            .expect(409);
        });

        it("Sends full data, receives 201 and the author created", async () => {
            const {body: author} = await server.post('/api/v1/authors')
                .send({
                    lastName: 'Dostoevsky',
                    firstName: 'Fyodor',
                    biography: 'azeara'
                })
                .expect(201);
            expect(author.lastName).to.equal('Dostoevsky');
            expect(author.firstName).to.equal('Fyodor');
            expect(author.biography).to.equal('azeara');
            expect(author).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/authors')
                .send({})
                .expect(400);
        });

        it("Sends only firstName, receives 400", async () => {
            await server.post('/api/v1/authors')
            .send({firstName: 'toto'})
            .expect(400);
        });

        it("Sends only lastName, receives 400", async () => {
            await server.post('/api/v1/authors')
            .send({lastName: 'toto'})
            .expect(400);
        });

        it("Sends only biography, receives 400", async () => {
            await server.post('/api/v1/authors')
            .send({biography: 'toto'})
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

        it("Requests all authors with matching specs, receive 200 and authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors?firstName=Jules&lastName=Verne')
                .expect(200);
            expect(authors.length).to.equal(1);
            expect(authors).to.be.an('array');
            expect(authors[0].firstName).to.equal('Jules');
            expect(authors[0].lastName).to.equal('Verne');
        });

        it("Requests all authors with matching firstName specs, receive 200 and authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors?firstName=Juleso')
                .expect(200);
            expect(authors.length).to.equal(1);
            expect(authors).to.be.an('array');
            expect(authors[0].firstName).to.equal('Juleso');
        });

        it("Requests all authors with matching lastName specs, receive 200 and authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors?lastName=Verne')
                .expect(200);
            expect(authors.length).to.equal(1);
            expect(authors).to.be.an('array');
            expect(authors[0].lastName).to.equal('Verne');
        });

        it("Requests all authors with matching biography specs, receive 200 and authors list", async () => {
            const {body: authors} = await server.get('/api/v1/authors?biography=Biographie%20%3A%20Jules%20Verne%20est%20un%20%C3%A9crivain%20fran%C3%A7ais%20%2C%20dont%20une%20grande%20partie%20de%20l\'%C5%93uvre%20est%20consacr%C3%A9e%20%C3%A0%20des%20romans%20d\'aventures%20et%20de%20science-fiction')
            .expect(200);
            expect(authors.length).to.equal(1);
            expect(authors).to.be.an('array');
            expect(authors[0].biography).to.equal('Biographie : Jules Verne est un écrivain français , dont une grande partie de l\'œuvre est consacrée à des romans d\'aventures et de science-fiction');
        });
    });

    describe('PUT /api/v1/authors/:authorId', function() {
        it("Replaces a non-existing author, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/authors/10')
                .send({
                    lastName: 'Dostoevsky',
                    firstName: 'Fyodor',
                    biography: 'eeee'
                })
                .expect(404);
            expect(err.message).to.equal('Author 10 not found');
        });

        it("Updates an existing author with full data, receives 200 and the new author", async () => {
            const {body: author} = await server.put('/api/v1/authors/1')
                .send({
                    lastName: 'Vernezzzz',
                    firstName: 'Juleszzz',
                    biography: 'toto'
                })
                .expect(200);
            expect(author.lastName).to.equal('Vernezzzz');
            expect(author.firstName).to.equal('Juleszzz');
            expect(author.biography).to.equal('toto');
            expect(author.id).to.equal(1);
            expect(author).to.be.an('object');
        });

        it("Updates an existing author with full data and wrong property, receives 200 and the new author", async () => {
            const {body: author} = await server.put('/api/v1/authors/1')
            .send({
                lastName: 'Vernezzzz',
                firstName: 'Juleszzz',
                biography: 'toto',
                image: 'test.png'
            })
            .expect(200);
            expect(author.lastName).to.equal('Vernezzzz');
            expect(author.firstName).to.equal('Juleszzz');
            expect(author.biography).to.equal('toto');
            expect(author.image).to.equal(undefined);
            expect(author.id).to.equal(1);
            expect(author).to.be.an('object');
        });

        it("Updates an existing author with no data sent, receives 400", async () => {
            await server.put('/api/v1/authors/1')
                .send({})
                .expect(400);
            const {body: author} = await server.get('/api/v1/authors/1')
                .expect(200);
            expect(author.firstName).to.equal('Jules');
            expect(author.lastName).to.equal('Verne');
            expect(author.biography).to.equal('Biographie : Jules Verne est un écrivain français , dont une grande partie de l\'œuvre est consacrée à des romans d\'aventures et de science-fiction');
        });

        it("Updates an existing author with only firstName, receives 400", async () => {
            await server.put('/api/v1/authors/1')
                .send({
                    firstName: 'drsdfs'
                })
                .expect(400);
            const {body: authors} = await server.get('/api/v1/authors?firstName=drsdfs')
                .expect(200);
            expect(authors.length).to.equal(0);
        });

        it("Updates an existing author with only lastName, receives 400", async () => {
            await server.put('/api/v1/authors/1')
            .send({
                lastName: 'drsdfs'
            })
            .expect(400);
            const {body: authors} = await server.get('/api/v1/authors?lastName=drsdfs')
            .expect(200);
            expect(authors.length).to.equal(0);
        });

        it("Updates an existing author with only biography, receives 400", async () => {
            await server.put('/api/v1/authors/1')
            .send({
                biography: 'drsdfs'
            })
            .expect(400);
            const {body: authors} = await server.get('/api/v1/authors?biography=drsdfs')
            .expect(200);
            expect(authors.length).to.equal(0);
        });

        it("Updates an existing author with only biography and firstName, receives 400", async () => {
            await server.put('/api/v1/authors/1')
            .send({
                biography: 'drsdfs',
                firstName: 'ttt'
            })
            .expect(400);
            const {body: author} = await server.get('/api/v1/authors/1')
            .expect(200);
            expect(author.biography).to.equal('Biographie : Jules Verne est un écrivain français , dont une grande partie de l\'œuvre est consacrée à des romans d\'aventures et de science-fiction');
            expect(author.firstName).to.equal('Jules');
        });

        it("Updates an existing author with only biography and lastName, receives 400", async () => {
            await server.put('/api/v1/authors/1')
            .send({
                biography: 'drsdfs',
                lastName: 'ttt'
            })
            .expect(400);
            const {body: author} = await server.get('/api/v1/authors/1')
            .expect(200);
            expect(author.biography).to.equal('Biographie : Jules Verne est un écrivain français , dont une grande partie de l\'œuvre est consacrée à des romans d\'aventures et de science-fiction');
            expect(author.lastName).to.equal('Verne');
        });

        it("Updates an existing author with only lastName and firstName, receives 400", async () => {
            await server.put('/api/v1/authors/1')
            .send({
                lastName: 'drsdfs',
                firstName: 'ttt'
            })
            .expect(400);
            const {body: author} = await server.get('/api/v1/authors/1')
            .expect(200);
            expect(author.lastName).to.equal('Verne');
            expect(author.firstName).to.equal('Jules');
        });
    });

    describe('PATCH /api/v1/authors/:authorId', function () {
        it('Patches firstName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Toto'
            })
            .expect(200);
            expect(author.firstName).to.equal('Toto');
        });

        it('Patches wrong property from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                image: 'Toto'
            })
            .expect(200);
            expect(author.image).to.equal(undefined);
        });

        it('Patches lastName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                lastName: 'Toto'
            })
            .expect(200);
            expect(author.lastName).to.equal('Toto');
        });

        it('Patches biography from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                biography: 'Toto'
            })
            .expect(200);
            expect(author.biography).to.equal('Toto');
        });

        it('Patches id from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                id: 5
            })
            .expect(200);
            expect(author.id).to.equal(5);
        });

        it('Patches id and firstName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                id: 5,
                firstName: 'Ttiti'
            })
            .expect(200);
            expect(author.id).to.equal(5);
            expect(author.firstName).to.equal('Ttiti');
        });

        it('Patches id and lastName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                id: 5,
                lastName: 'Tata'
            })
            .expect(200);
            expect(author.id).to.equal(5);
            expect(author.lastName).to.equal('Tata');
        });

        it('Patches id and biography from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                id: 5,
                biography: 'Tata'
            })
            .expect(200);
            expect(author.id).to.equal(5);
            expect(author.biography).to.equal('Tata');
        });

        it('Patches firstName and biography from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Jean',
                biography: 'Tata'
            })
            .expect(200);
            expect(author.firstName).to.equal('Jean');
            expect(author.biography).to.equal('Tata');
        });

        it('Patches firstName and lastName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Jean',
                lastName: 'Tata'
            })
            .expect(200);
            expect(author.firstName).to.equal('Jean');
            expect(author.lastName).to.equal('Tata');
        });

        it('Patches lastName and biography from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                lastName: 'Jean',
                biography: 'Tata'
            })
            .expect(200);
            expect(author.lastName).to.equal('Jean');
            expect(author.biography).to.equal('Tata');
        });

        it('Patches lastName and biography and firstName from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                lastName: 'Jean',
                biography: 'Tata',
                firstName: 'Ohoh'
            })
            .expect(200);
            expect(author.lastName).to.equal('Jean');
            expect(author.firstName).to.equal('Ohoh');
            expect(author.biography).to.equal('Tata');
        });

        it('Patches lastName and biography and if from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                lastName: 'Jean',
                biography: 'Tata',
                id: 5
            })
            .expect(200);
            expect(author.lastName).to.equal('Jean');
            expect(author.id).to.equal(5);
            expect(author.biography).to.equal('Tata');
        });

        it('Patches firstName and biography and id from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Jean',
                biography: 'Tata',
                id: 5
            })
            .expect(200);
            expect(author.firstName).to.equal('Jean');
            expect(author.id).to.equal(5);
            expect(author.biography).to.equal('Tata');
        });

        it('Patches firstName and lastName and id from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Jean',
                lastName: 'Tata',
                id: 5
            })
            .expect(200);
            expect(author.firstName).to.equal('Jean');
            expect(author.id).to.equal(5);
            expect(author.lastName).to.equal('Tata');
        });

        it('Patches all properties from an existing author, receives 200 and the author updated', async () => {
            const {body: author} = await server.patch('/api/v1/authors/1')
            .send({
                firstName: 'Jean',
                lastName: 'Tata',
                biography: 'Tata',
                id: 5
            })
            .expect(200);
            expect(author.firstName).to.equal('Jean');
            expect(author.id).to.equal(5);
            expect(author.lastName).to.equal('Tata');
            expect(author.biography).to.equal('Tata');
        });

        it('Patches all properties from a non-existing author, receives 404', async () => {
            await server.patch('/api/v1/authors/5')
            .send({
                firstName: 'Jean',
                lastName: 'Tata',
                biography: 'Tata',
                id: 5
            })
            .expect(404);
        });
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
