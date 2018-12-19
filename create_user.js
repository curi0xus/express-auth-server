let path = require("path"),
    config = require("./config.json"),
    User = require(path.join(__dirname, "models", "user.js")),
    mongoose_uri = process.env.MONGOOSE_URI || "mongodb://localhost/bookstore";

let args = process.argv.slice(2);

let username = args[0];
let password = args[1];

if (args.length < 2) {
    console.log("usage: node %s %s %s", path.basename(process.argv[1]), "user", "password");
    process.exit();
}

console.log("Username: %s", username);
console.log("Password: %s", password);

console.log("Creating a new user in Mongo");


let mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect(mongoose_uri, { useNewUrlParser: true });
mongoose.connection.on('error', function () {
    console.log('Mongoose connection error', arguments);
});
mongoose.connection.once('open', function callback() {
    console.log("Mongoose connected to the database");

    let user = new User();

    user.username = username;
    user.password = password;

    user.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(user);
        }
        process.exit();
    });

});