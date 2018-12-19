"use strict";

let debug = require('debug')('http'),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    bcrypt = require('bcryptjs'),
    utils = require("../util.js"),
    Router = require("express").Router,
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    BadRequestError = require(path.join(__dirname, "..", "errors", "BadRequestError.js")),
    User = require(path.join(__dirname, "..", "models", "user.js"));
    // jwt = require("express-jwt");

let register = function (req, res, next) {

  debug('Processing register middleware');

  let { username, password } = req.body;
  
  if (_.isEmpty(username) || _.isEmpty(password)) {
    return next(new Error())
  }

  let user = new User();

  user.username = username;
  user.password = password;

  user.save(err => {
    
    if (err) next(new BadRequestError('400', {
      message: 'Please check your parameters'
    }));
    else console.log(user);

  });

};

let authenticate = function (req, res, next) {

    debug("Processing authenticate middleware");

    let username = req.body.username,
        password = req.body.password;

    if (_.isEmpty(username) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {
            message: 'Invalid username or password because username/password empty'
        }));
    }

    process.nextTick(function () {

        User.findOne({
            username: username
        }, function (err, user) {

            if (err || !user) {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password cant find user'
                }));
            }

            user.comparePassword(password, function (err, isMatch) {
                if (isMatch && !err) {
                    debug("User authenticated, generating token");
                    utils.create(user, req, res, next);
                } else {
                    return next(new UnauthorizedAccessError("401", {
                        message: 'Invalid username or password password is wrong'
                    }));
                }
            });
        });

    });


};

module.exports = function () {

    let router = new Router();

    router.route("/verify").get(function (req, res, next) {
        return res.status(200).json(undefined);
    });

    router.route("/logout").get(function (req, res, next) {
        if (utils.expire(req.headers)) {
            delete req.user;
            return res.status(200).json({
                "message": "User has been successfully logged out"
            });
        } else {
            return next(new UnauthorizedAccessError("401"));
        }
    });

    router.route("/register").post(register, function (req, res, next) {
        return res.status(200).json(req.user);
    });

    router.route("/login").post(authenticate, function (req, res, next) {
        return res.status(200).json(req.user);
    });

    router.unless = require("express-unless");

    return router;
};

debug("Loaded");