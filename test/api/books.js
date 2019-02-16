'use strict';

const {expect} = require('chai');
const request = require('supertest');
const createServer = require('../../app');
const database = require('../../src/database');
const fixtures = require('../fixtures/books.json');

const server = request(createServer());

describe.only('Books api', function() {
    beforeEach(async function() {
        await database.sequelize.query('DELETE from BOOKS');
        const {Books} = database;
        const promises = fixtures.map(book => Books.create(book));
        await Promise.all(promises);
    });

    describe('POST books api', function() {
        it("Sends all required data, receives 201 and the event created", async () => {
            const {body: book} = await server.post('/api/v1/books')
                .send({
                    bookRef: 9782330053902,
                    publicationYear: "2019-02-02",
                    price: 30,
                    title: "Book 1"
                })
                .expect(201);
            expect(book.bookRef).to.equal(9782330053902);
            expect(book).to.be.an('object');
        });

        it("Sends no informations, receives 400", async () => {
            await server.post('/api/v1/books')
                .send({})
                .expect(400);
        });

        it("Sends existing book, receives 409", async () => {
            await server.post('/api/v1/books')
                .send({
                    bookRef: 9782330053901,
                    publicationYear: "2019-01-01",
                    price: 8,
                })
                .expect(409);
        });
    });

    describe('GET /api/v1/books/:bookId', function() {
        it("Requests a non-existing book, receives 404", async () => {
            const {body: err} = await server.get('/api/v1/books/99')
                .expect(404);
            expect(err.message).to.equal('Book 99 not found');
        });

        it("Requests an existing book, receives 200 and the book", async () => {
            const {body: book} = await server.get('/api/v1/books/1')
                .expect(200);
            expect(book.id).to.equal(1);
            expect(book.bookRef).to.equal(9782330053901);
            expect(book).to.be.an('object');
        });
    });

    describe('GET /api/v1/books/', function() {
        it("Requests all books, receives 200 and books list", async () => {
            const {body: books} = await server.get('/api/v1/books')
                .expect(200);
            expect(books.length).to.equal(1);
            expect(books[0].id).to.equal(1);
            expect(books[0].bookRef).to.equal(9782330053901);
            expect(books).to.be.an('array');
        });

        it("Requests all books with not matching specs, receive 404 and empty books list", async () => {
            const {body: books} = await server.get('/api/v1/books?id=10&bookRef=123')
                .expect(200);
            expect(books.length).to.equal(0);
            expect(books).to.be.an('array');
        });
    });

    describe('PUT /api/v1/books/:bookId', function() {
        it("Replaces a non-existing book, receives 404", async () => {
            const {body: err} = await server.put('/api/v1/books/10')
                .send({
                    bookRef: 9782330053902,
                    publicationYear: "2019-02-02",
                    price: 30         
                })
                .expect(404);
            expect(err.message).to.equal('Book 10 not found');
        });

        it("Updates an existing book, receives 200 and the new book", async () => {
            const {body: book} = await server.put('/api/v1/books/1')
                .send({
                    bookRef: 9782330053901,
                    publicationYear: "2019-01-01",
                    price: 8
                })
                .expect(200);
            expect(book.bookRef).to.equal(9782330053901);
            expect(book.id).to.equal(1);
            expect(book).to.be.an('object');
        });

        it("Updates an existing book with no data sent, receives 400", async () => {
            await server.put('/api/v1/books/1')
                .send({})
                .expect(400);
        })
    });

    describe('DELETE /api/v1/books/:bookId', function () {
        it('Deletes an existing book, receives 200', async () => {
            const {body: msg} = await server.delete('/api/v1/books/1')
                .expect(200);
            expect(msg.message).to.equal('Book deleted');
            await server.get('/api/v1/books/1')
                .expect(404);
        });

        it('Deletes a non-existing book, receives 404', async () => {
            const {body: err} = await server.delete('/api/v1/books/999')
                .expect(404);
            expect(err.message).to.equal('Book 999 not found');
        })
    })
});