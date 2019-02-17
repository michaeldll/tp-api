const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {body: givenEditor} = req;
        if (givenEditor.name) {
            const {Editors} = req.db;
            const editor = await Editors.create(givenEditor);
            res.status(201).send(editor);
        } else {
            res.status(400).send({message: 'Missing data'});
        }
    } catch(err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            res.status(409).send({message: err});
    }
});

router.get('/:editorId', async (req, res) => {
    const editorId = req.params.editorId;
    const {Editors} = req.db;
    const editor = await Editors.findOne({ where: {id: editorId} });
    if (editor) {
        return res.status(200).send(editor);
    } else {
        return res.status(404)
            .send({message: `Editor ${editorId} not found`});
    }
});

router.get('/', async (req, res) => {
    const {Editors} = req.db;
    const {id, name} = req.query;
    const filters = {
        where: {}
    };
    if (id) filters.where.id = id;
    if (name) filters.where.name = name;
    const editors = await Editors.findAll(filters);
    if (editors) {
        return res.status(200).send(editors);
    } else {
        return res.status(404)
            .send({message: `Editors not found`});
    }
});

router.put('/:editorId', async (req, res) => {
    let editorId = req.params.editorId;
    const {Editors} = req.db;
    const {body: givenEditor} = req;
    try {
        if (!givenEditor.name) return res.status(400).send({message: 'Missing editor\'s name'});
        const r = await Editors.update(
            givenEditor,
            { where: { id: editorId } }
        );
        if (r[0]) {
            if (givenEditor.id) editorId = givenEditor.id;
            const editor = await Editors.findOne( { where: { id: editorId } });
            return res.status(200).send(editor);
        } else {
            return res.status(404).send({
                message: `Editor ${editorId} not found`
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(400).send({
            message: e
        });
    }
});

router.delete('/:editorId', async (req, res) => {
   const editorId = req.params.editorId;
   const {Editors} = req.db;
   let editor = await Editors.findOne({where: {id: editorId}});
   if (editor) {
       await Editors.destroy({ where: { id: editorId } });
       return res.status(200).send({message: 'Editor deleted'});
   } else
       return res.status(404).send({message: `Editor ${editorId} not found`});
});

module.exports = router;
