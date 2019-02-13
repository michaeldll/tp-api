const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenBook} = req;
        if (givenBook.bookRef) {
            const {Books} = req.db;
            let book = await Books.findOne({where: {bookRef: givenBook.bookRef}});
            if (book) res.status(409).send({message: 'This book already exists'});
            book = await Books.create(givenBook);
            res.status(201).send(book);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const {Books} = req.db;
    const book = await Books.findOne({ where: {id: bookId} });
    if (book) {
        return res.status(200).send(book);
    } else {
        return res.status(404)
            .send({message: `Book ${bookId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Books} = req.db;
    const {id, bookRef} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (bookRef) filters.where.bookRef = bookRef;
    const books = await Books.findAll(filters);
    if (books) {
        return res.status(200).send(books);
    } else {
        return res.status(404)
            .send({message: `Books not found`});
    }
});

router.put('/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const {Books} = req.db;
    const {body: givenBook} = req;
    try {
        if (givenBook.bookRef) {
            const r = await Books.update(
                { bookRef: givenBook.bookRef },
                { where: { id: bookId } }
            );
            if (r[0]) {
                const book = await Books.findOne( { where: { id: bookId } });
                return res.status(200).send(book);
            } else {
                return res.status(404).send({
                    message: `Book ${bookId} not found`
                });
            }
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch (e) {
        console.log(e);
        return res.status(400).send({
            message: e
        });
    }
});

router.delete('/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const {Books} = req.db;
    let book = await Books.findOne({where: {id: bookId}});
    if (book) {
        await Books.destroy({ where: { id: bookId } });
        return res.status(200).send({message: 'Book deleted'});
    } else
        return res.status(404).send({message: `Book ${bookId} not found`});
});

module.exports = router;