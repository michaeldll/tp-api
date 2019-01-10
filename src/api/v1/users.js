const express = require('express');
const request = require('request-promise');
const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
		const users = await request({
			uri: 'http://www.mocky.io/v2/5c015e253500006c00ad098f',
			method: 'GET',
			json: true
		});

		const {country, company} = req.query;
		let filteredList = users;
		if (country) {
		  filteredList = users.filter(u => u.country === country);
    }
		if (company) {
			filteredList = users.filter(u => u.company === company);
		}

		res.send(filteredList);
  } catch(err) {
    next(err);
  }
});

router.post('/', async (req, res) => {
	try {
		const {body: givenUser} = req;
		if (givenUser.username && givenUser.fullName && givenUser.country) {
			const {Users} = req.db;
			const user = await Users.create(givenUser);
			res.status(201).send(user);
		} else {
			res.status(400).send({message: 'Missing data'});
		}
	} catch(err) {
		if (err.name === 'SequelizeUniqueConstraintError')
			res.status(409).send({message: err});
	}
});

router.get('/:username', async (req, res) => {
	const username = req.params.username;
	const {Users} = req.db;
	const user = await Users.findOne({ where: {username: username} });
	if (user) {
		return res.status(200).send(user);
	} else {
		return res.status(404)
			.send({message: `Username ${username} not found`});
	}
});

router.put('/:username', async (req, res) => {
	const username = req.params.username;
	const {Users} = req.db;
	const {body: givenUser} = req;
	try {
		if (givenUser.country) {
			const r = await Users.update(
				{ country: givenUser.country },
				{ where: { username: username } }
			);
			if (r[0]) {
				const user = await Users.findOne( { where: { username: username } });
				return res.status(200).send(user);
			} else {
				return res.status(404).send({
					message: `Username ${username} not found`
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

module.exports = router;
