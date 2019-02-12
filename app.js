const fs = require('fs');
const jsyaml = require('js-yaml');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const createSwaggerUiMiddleware = require('@coorpacademy/swagger-ui-express');
const database = require('./src/database');

// TODO: require here your routes files
const editorsRouter = require('./src/api/v1/editors');
const eventsRouter  = require('./src/api/v1/events');
const genresRouter  = require('./src/api/v1/genres');
const awardsRouter  = require('./src/api/v1/awards');
const authorsRouter  = require('./src/api/v1/authors');

const createServer = () => {
	const app = express();

// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');

	app.use(logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'src/public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	// Custom middleware to center the database model
	app.use(function(req, res, next) {
		req.db = database;
		next();	// On any middleware, next should be called to avoid the timeout error and go to the next middleware!
	});

	// TODO: define here your endpoints and attach them to the routes
	app.use('/api/v1/editors', editorsRouter);
	app.use('/api/v1/events', eventsRouter);
	app.use('/api/v1/genres', genresRouter);
	app.use('/api/v1/awards', awardsRouter);
	app.use('/api/v1/authors', authorsRouter);

	const spec = fs.readFileSync(path.resolve(__dirname, 'swagger.yaml'), 'utf8');
	const swaggerDoc = jsyaml.safeLoad(spec);

	app.use(
		createSwaggerUiMiddleware({
			swaggerDoc,
			swaggerUi: '/explorer'
		})
	);

	// BONUS: Si vous souhaitez ajouter la gestion de l'authentification
	// vous pouvez decommenter ce ligne et implementer le code nécessaire
	//app.use(auth());

// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		next(createError(404));
	});

// error handler
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		if (process.env.NODE_ENV !== 'test') console.log(err);
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
		res.status(err.status || 500);

		if (req.accepts('application/json')) {
			return res.send(err);
		}
		// render the error page
		res.render('error');
	});
	return app;
};

module.exports = createServer;
