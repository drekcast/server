var debug = require('debug')('drekcast:passport');
    BasicStrategy   = require('passport-http').BasicStrategy,
    HawkStrategy    = require('passport-hawk').Strategy,

    userRepository = require('../lib/userRepository.js');

module.exports = function (app, passport, config) {

    passport.use(new BasicStrategy(
        function(username, password, done) {

            userRepository.get(username, function(user) {
                if (!user) {
                    debug('User "' + username + '" not found');
                    done('Invalid username');
                } else if (user.password != password) {
                    console.log(password);
                    console.dir(user);
                    debug('Invalid password');
                    done('Invalid password');
                } else {
                    done(null, user);
                }
            });

        }
    ));
}