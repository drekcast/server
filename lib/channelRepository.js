var _ = require('lodash'),
    debug = require('debug')('drekcast:channelRepository'),

    User = require('./user'),
    Channel = require('./channel'),

    fs = require('fs');

var ChannelRepository = function() {

}

ChannelRepository.prototype.loadConfig = function(config) {

    this.channels = {};

    _.each(config, function(channelConfig) {

        var channel = new Channel(channelConfig);
        this.channels[channel.token] = channel;

    }, this);

    debug('Loaded '+this.channels.length+' channels');

}

ChannelRepository.prototype.loadConfigFromFile = function(path) {
    var self = this;

    fs.readFile(path, 'utf-8', function(err, data) {
        if (err) {
            console.error('Could not load channels from file');
            return;
        }

        data = JSON.parse(data);

        self.loadConfig(data);
    });
}

ChannelRepository.prototype.get = function(token, callback) {

    var channel = this.channels[token];
    callback(channel);

}

ChannelRepository.prototype.findByUsername = function(username, callback) {

    var channels = _.find(this.channels, function(channel) {
        return _.contains(channel.users, username);
    });

    return callback(channels);
}

module.exports = new ChannelRepository();