var _ = require('lodash'),
    debug = require('debug')('drekcast:userRepository'),

    User = require('./user'),

    fs = require('fs');

var UserRepository = function() {

    this.users = [];

}

UserRepository.prototype.loadFromFile = function(path) {
    var self = this;
    fs.readFile(path, 'utf-8', function(err, data) {
        if (err) {
            console.error('Could not load users from file');
            return;
        }

        data = JSON.parse(data);

        _.each(data, function(userConfig) {
            var user = new User(userConfig.username, userConfig.password, userConfig.apiKey, userConfig.isAdmin);
            self.users.push(user);
        });

        debug('Loaded '+self.users.length+' users');
    });
}

UserRepository.prototype.get = function(username, callback) {
    var users = _.where(this.users, { username: username });
    return callback(_.first(users));
}


module.exports = new UserRepository();