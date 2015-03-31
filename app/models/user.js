var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
	tableName: 'users',

	authUser: function(username, password, callback){
		console.log(username);
		console.log(this.get('username'));
		console.log(password);
		console.log(this.get('password'));
		if (username === this.get('username') && password === this.get('password')){
			callback(true);
		} else {
			callback(false);
		}
	},

	addUser: function(username, password, callback){
		this.set('username', 'ya');
		this.set('password', 'shaloo');
  
    callback(true);
	}
});


module.exports = User;