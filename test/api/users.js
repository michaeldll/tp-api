'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/users')

const server = request(createServer());

describe.only('User api', function() {
    before(async function() {
        await database.sequelize.query('DELETE from USERS');
        const {Users} = database;
        const promises = fixtures.map(user => Users.create(user));
        await Promise.all(promises);
    });

    describe('POST user api', function() {
        it("La requete envoie tous les données d'un user, l'user est crée et on reçoit un 200", async () => {
            await server.post('/api/v1/users')
                .send({
                    username: 'Tulkass',
                    fullName: 'Maleplate Maxime',
                    country: 'FR'
                })
                .expect(201);
        });

        it("La requete envoie n'evoie pas tous les données d'un user, on reçoit un 400", async () => {
            await server.post('/api/v1/users')
                .send({
                    username: 'Tulkass'
                })
                .expect(400);
        });

        it("La requete envoie un utilisateur qui existe déjà, on reçoit un 409", async () => {
            await server.post('/api/v1/users')
                .send({
                    username: 'Kaikina',
                    fullName: 'Girou Tom',
                    country: 'FR'
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/users/:username', function() {
        it("Given username doesn't exist, then send 404", async () => {
            await server.get('/api/v1/users/je-n-existe-pas')
                .expect(404);
        });

        it("Given username exists then send 200 and user", async () => {
            const {body: user} = await server.get('/api/v1/users/Kaikina')
                .expect(200);
            expect(user.username).to.equal('Kaikina');
            expect(user.fullName).to.equal('Girou Tom');
            expect(user.country).to.equal('FR');
        });
    });

    describe('PUT /api/v1/users/:username', function() {
        it("Given username doesn't exist, then send 404", async () => {
            await server.put('/api/v1/users/je-n-existe-pas')
                .send({
                    country: 'VN'
                })
                .expect(404);
        });

        it("Given username exists then send 200 and user updated", async () => {
            const {body: user} = await server.put('/api/v1/users/Kaikina')
                .send({
                    country: 'VN'
                })
                .expect(200);
            expect(user.country).to.equal('VN');
        });

        it("Given data is incorrect then send 400", async () => {
            await server.put('/api/v1/users/Kaikina')
                .send({
                    username: 'VN'
                })
                .expect(400);
        })
    });
});