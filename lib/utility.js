var request = require('request');
var Bookshelf = require('bookshelf');
var db = require('../app/config');
var Users = require('../app/collections/users');
var User = require('../app/models/user');
var Links = require('../app/collections/links');
var Link = require('../app/models/link');
var Click = require('../app/models/click');
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/


exports.authUser = function(req, res, next){
  //check auth
  var username = req.body.username;
  var password = req.body.password;

  new User({'username': username}).fetch().then(function(user){

    if(!user){
      res.redirect('/login');
      return;
    }

    bcrypt.compare(password, user.get('password'), function(err, result){
      if(result === true){
        //send a token
        exports.createSession(req, res, user);
      }else{
        res.redirect('/login');
      }
    });
  });
}

exports.checkAuth = function(req, res, next){
  if(req.session && req.session.user){
    next();
  }else{
    res.redirect('/login');
  }
}

exports.createSession = function(req, res, newUser) {
  return req.session.regenerate(function() {
    req.session.user = newUser;
    res.redirect('/');
  });
}

exports.createUser = function(req, res, next){

  var username = req.body.username;
  var password = req.body.password;

  //become salty
  bcrypt.genSalt(10, function(err, salt) {
    //do something cool with the password
    console.log(salt);
    bcrypt.hash(password, salt, null, function(err, hash) {
      console.log(hash)
      new User({
        'username': username,
        'password': hash
      }).save().then(function(newUser){
        exports.createSession(req, res, newUser);
        Users.add(newUser);
      });
    });
  });
  //add to database



}