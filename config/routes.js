var channelRepository = require('../lib/channelRepository');

module.exports = function(app, passport){

    var authentication = passport.authenticate('basic', { session: false });

    app.get('/me',
        authentication,
        function(req, res) {
            res.send(req.user);
        });
    app.get('/channels',
        authentication,
        function(req, res) {

            channelRepository.findByUsername(req.user.username, function(channels) {

                res.send(channels);

            });
        });
}