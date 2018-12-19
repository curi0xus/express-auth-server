let mongoose = require('mongoose');

class Database {
  constructor (debug) {
    mongoose.set('debug', true);
    this._connect(debug);
  }

  _connect (debug) {
    mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true })
      .then(_ => {
        debug('Mongoose connected to the database');
      })
      .catch(err => {
        debug('Mongoose connection error');
      })
  }
}

module.exports = Database;
// module.exports = new Database();
