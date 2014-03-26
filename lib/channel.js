var _ = require('lodash'),
    debug = require('debug')('drekcast:channel'),

    Screen = require('./screen'),
    Overlay = require('./overlay'),
    DataProvider = require('./dataProvider');

var Channel = function(config) {

    this.name = undefined;
    this.token = undefined;

    this.screens = {};
    this.overlays = {};
    this.files = [];
    this.dataProviders = {};

    this.users = [];
    this.clients = [];

    this.activeScreen = false;

    this.isRunning = false;

    if (config) {
        this.loadConfig(config);
    }

}

Channel.prototype.loadConfig = function(config) {

    this.name = config.name;
    this.token = config.token;

    // Load users
    this.users = config.users;

    // Load Data providers
    _.each(config.dataProviders, function(providerConfig, key) {
        var provider = new DataProvider(providerConfig, key);
        // TODO: instantiate correct dataprovider
        this.dataProviders[key] = provider;
    }, this);

    // Load Screens
    _.each(config.screens, function(screenConfig, screenName) {
        var options = screenConfig;
        var screen = new Screen(screenName, options);
        this.screens[screenName] = screen;
    }, this);

    // Load Overlays
    _.each(config.overlays, function(overlayConfig, overlayName) {
        var options = overlayConfig;
        var visible = options._visible || false;
        delete(options._visible);
        var overlay = new Overlay(overlayName, overlayConfig, visible);
        this.overlays[overlayName] = overlay;
    }, this);

    return this;
}

Channel.prototype.join = function(client) {

    this.clients.push(client);

    if (!this.isRunning) {
        this.start();
    }

    this.sendExcept(client, 'channel:join', { id: client.id });
    this.sendClient(client, 'channel:join', { id: client.id, channel: this.toClientJSON() });
}

Channel.prototype.leave = function(client) {

    this.clients = _.without(this.clients, client);

    if (this.isRunning && this.clients.length == 0) {
        this.stop();
    }

    this.send('channel:leave', { id: client.id });
}

Channel.prototype.start = function() {
    this.isRunning = true;

    _.each(this.dataProviders, function(dataProvider) {
        dataProvider.start();
    });

    this.send('channel:start');
}

Channel.prototype.stop = function () {
    this.isRunning = false;

    _.each(this.dataProviders, function(dataProvider) {
        dataProvider.stop();
    });

    this.send('channel:stop');
}

Channel.prototype.setScreen = function(screenName, options) {

    if (this.activeScreen == screenName) {
        return false;
    }
    
    var screen = this.getScreen(screenName);
    if (!screen) {
        return false;
    }

    this.activeScreen = screenName;

    if (options) {
        screen.setOptions(options);
    }

    this.send('channel:screen', { screen: screenName, options: screen.getClientOptions() });
}

Channel.prototype.getScreen = function(screenName) {

    return this.screens[screenName];

}

Channel.prototype.setScreenOptions = function(screenName, options) {
    var screen = this.getScreen(screenName);
    if (screen) {
        screen.setOptions(options);
        return true;
    } else {
        return false;
    }
}

Channel.prototype.toggleOverlay = function(overlayName, visible, options) {

    var overlay = this.getOverlay(overlayName);

    if (typeof visible == undefined) {
        visible = !overlay.visible;
    }
    overlay.setVisible(visible);

    if (options) {
        overlay.setOptions(options);
    }

    this.send('channel:overlay', { overlay: overlayName, visible: visible, options: overlay.getClientOptions() });
}

Channel.prototype.getOverlay = function(overlayName) {
    return this.overlays[overlayName];
}

Channel.prototype.toClientJSON = function() {
    var data = _.pick(this, ['name', 'token', 'activeScreen']);
    data.screens = _.keys(this.screens);
    data.overlays = this.overlays;
    return data;
}

Channel.prototype.toStorageJSON = function() {

}

Channel.prototype.send = function(message, parameters) {
    _.forEach(this.clients, function(client) {
        client.write([message, parameters || null]);
    });
}

Channel.prototype.sendExcept = function(client, message, parameters) {
    _.forEach(this.clients, function(c) {
        if (c.id == client.id) return;
        c.write([message, parameters || null]);
    });
}

Channel.prototype.sendClient = function(client, message, parameters) {
    client.write([message, parameters || null]);
}

module.exports = Channel;