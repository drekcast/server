var channels = require('./channelRepository');

var User = function(username, password, apiKey, isAdmin) {

    this.username = username;
    this.password = password;
    this.apiKey = apiKey;
    this.isAdmin = isAdmin;

}

User.prototype.getChannels = function() {
    return channels.findByUser(this);
}

module.exports = User;