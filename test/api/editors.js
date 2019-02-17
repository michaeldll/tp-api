'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/editors');

const server = request(createServer());

describe.only('Editors api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from EDITORS');
        const {Editors} = database;
        const promises = fixtures.map(editor => Editors.create(editor));
        await Promise.all(promises);
    });

    describe('POST editor api', function() {
        it("Sends all required data, receives 201 and the editor created", async () => {
            const {body: editor} = await server.post('/api/v1/editors')
                .send({
                    name: 'Hachette'
                })
                .expect(201);
                expect(editor.name).to.equal('Hachette');
                expect(editor).to.be.an('object');
        });

        it("Sends all required data + id, receives 201 and the editor created", async () => {
            const {body: editor} = await server.post('/api/v1/editors')
            .send({
                id: 15,
                name: 'Hachette'
            })
            .expect(201);
            expect(editor.name).to.equal('Hachette');
            expect(editor.id).to.equal(15);
            expect(editor).to.be.an('object');
        });

        it("Sends all required data and wrong property, receives 201 and the editor created", async () => {
            const {body: editor} = await server.post('/api/v1/editors')
            .send({
                name: 'Hachette',
                test: 'test'
            })
            .expect(201);
            expect(editor.name).to.equal('Hachette');
            expect(editor.test).to.equal(undefined);
            expect(editor).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/editors')
                .send({})
                .expect(400);
        });

        it("Sends existing editor, receives 409", async () => {
            await server.post('/api/v1/editors')
                .send({
                    name: 'Poches Éditions'
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/editors/:editorId', function() {
        it("Requests a non-existing editor, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/editors/1000')
                .expect(404);
            expect(err.message).to.equal('Editor 1000 not found');
        });

        it("Requests an existing editor, receives 200 and the editor", async () => {
            const {body: editor} = await server.get('/api/v1/editors/1')
                .expect(200);
            expect(editor.id).to.equal(1);
            expect(editor.name).to.equal('Poches Éditions');
            expect(editor).to.be.an('object');
        });
    });

    describe('GET /api/v1/editors/', function() {
        it("Requests all editors, receives 200 and editors list", async () => {
            const {body: editors} = await server.get('/api/v1/editors')
                .expect(200);
            expect(editors.length).to.equal(1);
            expect(editors[0].id).to.equal(1);
            expect(editors[0].name).to.equal('Poches Éditions');
            expect(editors).to.be.an('array');
        });

        it("Requests all editors with no matching specs, receive 200 and empty editors list", async () => {
            const {body: editors} = await server.get('/api/v1/editors?id=10&name=hello')
                .expect(200);
                expect(editors.length).to.equal(0);
                expect(editors).to.be.an('array');
        });

        it("Requests all editors with matching specs, receive 200 and editors list", async () => {
            const {body: editors} = await server.get('/api/v1/editors?id=1&name=Poches%20Éditions')
            .expect(200);
            expect(editors.length).to.equal(1);
            expect(editors[0].id).to.equal(1);
            expect(editors[0].name).to.equal('Poches Éditions');
            expect(editors).to.be.an('array');
        });
    });

    describe('PUT /api/v1/editors/:editorId', function() {
        it("Replaces a non-existing editor, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/editors/10')
                .send({
                    name: 'Hello World'
                })
                .expect(404);
                expect(err.message).to.equal('Editor 10 not found');
        });

        it("Updates an existing editor, receives 200 and the new editor", async () => {
            const {body: editor} = await server.put('/api/v1/editors/1')
                .send({
                    name: 'Hello World'
                })
                .expect(200);
            expect(editor.name).to.equal('Hello World');
            expect(editor.id).to.equal(1);
            expect(editor).to.be.an('object');
        });

        it("Updates an existing editor with wrong property, receives 200 and the new editor", async () => {
            const {body: editor} = await server.put('/api/v1/editors/1')
            .send({
                name: 'Hello World',
                test: 'test'
            })
            .expect(200);
            expect(editor.name).to.equal('Hello World');
            expect(editor.id).to.equal(1);
            expect(editor.test).to.equal(undefined);
            expect(editor).to.be.an('object');
        });

        it("Updates an existing editor + id, receives 200 and the new editor", async () => {
            const {body: editor} = await server.put('/api/v1/editors/1')
            .send({
                id: 15,
                name: 'Hello World'
            })
            .expect(200);
            expect(editor.name).to.equal('Hello World');
            expect(editor.id).to.equal(15);
            expect(editor).to.be.an('object');
        });

        it("Updates an existing editor with no data sent, receives 400", async () => {
            await server.put('/api/v1/editors/1')
                .send({})
                .expect(400);
        });
    });

    describe('DELETE /api/v1/editors/:editorId', function () {
        it('Deletes an existing editor, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/editors/1')
                .expect(200);
                expect(msg.message).to.equal('Editor deleted');
            await server.get('/api/v1/editors/1')
                .expect(404);
        });

        it('Deletes a non-existing editor, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/editors/1000')
                .expect(404);
                expect(err.message).to.equal('Editor 1000 not found');
        })
    })
});
