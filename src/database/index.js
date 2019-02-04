'use strict';
const path = require('path');
const Sequelize = require('sequelize');

const url = (process.env.DATABASE_URL || '').match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
const DB_name     = url ? url[6] : null;
const user        = url ? url[2] : null;
const pwd         = url ? url[3] : null;
const protocol    = url ? url[1] : null;
const dialect     = url ? url[1] : 'sqlite';
const port        = url ? url[5] : null;
const host        = url ? url[4] : null;

// Here we verify the environmental variable to know if we're on test, development or production
const storage     = process.env.NODE_ENV === 'test' ? 'database-test.sqlite' : process.env.DATABASE_STORAGE || 'database.sqlite';

const sequelize = new Sequelize(DB_name, user, pwd, {
	dialect,
	protocol,
	port,
	host,
	storage,
	omitNull: true,
	logging: process.env.NODE_ENV !== 'test'
});

sequelize.sync()
	.then(() => {
		console.log('DB loaded');
	})
;

// TODO: Add here all your mapped models of your database
const Editors = sequelize.import(path.join(__dirname, 'editors'));
const Events = sequelize.import(path.join(__dirname, 'events'));
const Awards = sequelize.import(path.join(__dirname, 'awards'));
const Authors = sequelize.import(path.join(__dirname, 'authors'));
const Genres = sequelize.import(path.join(__dirname, 'genres'));
const Books = sequelize.import(path.join(__dirname, 'books'));


// Foreign keys
Authors.hasMany(Awards, {as: 'AuthorAwards'});
Books.hasMany(Genres, {as: 'BookGenres'});
Books.belongsTo(Editors);
Books.belongsTo(Authors);


// TODO: And export them
exports.Editors = Editors;
exports.Events = Events;
exports.Awards = Awards;
exports.Authors = Authors;
exports.Genres = Genres;
exports.Books = Books;

// Exporting sequelize object to allow raw queries if needed
exports.sequelize = sequelize;
