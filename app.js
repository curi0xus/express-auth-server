//utiltity and constants
// let debug = require('debug')('app:' + process.pid),
let debug = require('debug')('http'),
    path = require('path'), 
    fs = require('fs'),
    http_port = process.env.HTTP_PORT || 3000,
    https_port = process.env.HTTPS_PORT || 3443,
    jwt = require('express-jwt'),
    config = require('./config.json'),
    onFinished = require('on-finished'),
    NotFoundError = require(path.join(__dirname, 'errors', 'NotFoundError.js')),
    utils = require(path.join(__dirname, 'util.js')),
    unless = require('express-unless');
    

debug('Starting application');

debug('Loading Mongoose functionality');
let Database = require('./database'), mongoose = new Database(debug);

debug('Initializing Express');
let express = require('express'), app = express();

debug('Initializing Redis & Rate Limiter');
let redis = require("redis"), 
    client = redis.createClient(), 
    limiter = require('express-limiter')(app, client);

limiter({
  path: '*',
  method: 'all',
  lookup: ["user.id","headers['cf-connecting-ip']", "headers['x-forwarded-for']", "connection.remoteAddress"] // identify spammer with req.user.id||req.connection.remoteAddress||req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']
});

debug('Attaching Plugins');
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('response-time')());
let bodyParser = require('body-parser');
    // morgan = require('morgan');
    //authentication middleware
    // passport = require('passport');
//database config
//User model
//Port variable
    // jwt = require('jwt-simple'),
    // Genre = require('./models/genres');

//get our request parameters 
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  onFinished(res, function (err) {
      debug("[%s] finished request", req.connection.remoteAddress);
  });
  next();
});

let jwtCheck = jwt({
  secret: config.secret
});
jwtCheck.unless = unless;

app.use(jwtCheck.unless({path: ['/api/login', '/api/register']}));
app.use(utils.middleware().unless({path: ['/api/login', '/api/register'] }));

//for all routes that starts with /api find the file default.js in routes folder 
app.use("/api", require(path.join(__dirname, "routes", "default.js"))());

// all other requests redirect to 404
app.all("*", function (req, res, next) {
    next(new NotFoundError("404"));
});


// error handler for all the applications
app.use(function (err, req, res, next) {
  
  var errorType = typeof err,
      code = 500,
      msg = { message: "Internal Server Error" };

  switch (err.name) {
    case "UnauthorizedError":
      code = err.status;
      msg = undefined;
      break;
    case "BadRequestError":
    case "UnauthorizedAccessError":
    case "NotFoundError":
      code = err.status;
      msg = err.inner;
      break;
    default:
      break;
  }

  return res.status(code).json(msg);
});

debug("Creating HTTP server on port: %s", http_port);
require('http').createServer(app).listen(http_port, function () {
    debug("HTTP Server listening on port: %s, in %s mode", http_port, app.get('env'));
});

// debug("Creating HTTPS server on port: %s", https_port);
// require('https').createServer({
//     key: fs.readFileSync(path.join(__dirname, "keys", "server.key")),
//     cert: fs.readFileSync(path.join(__dirname, "keys", "server.crt")),
//     ca: fs.readFileSync(path.join(__dirname, "keys", "ca.crt")),
//     requestCert: true,
//     rejectUnauthorized: false
// }, app).listen(https_port, function () {
//     debug("HTTPS Server listening on port: %s, in %s mode", https_port, app.get('env'));
// });

//Use the passport package in our application 
// app.use(passport.inititialize());

// app.get('/', function (req, res) {
//   res.send('wfighthinlallalaallas');
// });

// app.get('/api/genres', function (req, res) {
//   Genre.getGenres((err, genres) => {
//     if (err) {
//       throw err;
//     }
//     res.json(genres);
//   });
// });

// app.listen(http_port);