var _ = require('lodash'),
    debug = require('debug')('drekcast:channel'),

    Screen = require('./screen'),
    Overlay = require('./overlay'),
    DataProvider = require('./dataProvider');

var Channel = function(config) {

    this.name = undefined;
    this.token = undefined;

    this.screens = [];
    this.overlays = [];
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
        this.screens.push(screen);
    }, this);

    // Load Overlays
    _.each(config.overlays, function(overlayConfig, overlayName) {
        var options = overlayConfig;
        var visible = options._visible || false;
        delete(options._visible);
        var overlay = new Overlay(overlayName, overlayConfig, visible);
        this.overlays.push(overlay);
    }, this);

    return this;
}

Channel.prototype.join = function(client) {

    this.clients.push(client);

    if (!this.isRunning) {
        this.start();
    }

    // Throw event
}

Channel.prototype.leave = function(client) {

    this.clients = _.without(this.clients, client);

    if (this.isRunning && this.clients.length == 0) {
        this.stop();
    }
}

Channel.prototype.start = function() {
    this.isRunning = true;

    _.each(this.dataProviders, function(dataProvider) {
        dataProvider.start();
    });
}

Channel.prototype.stop = function () {
    this.isRunning = false;


    _.each(this.dataProviders, function(dataProvider) {
        dataProvider.stop();
    });
}

Channel.prototype.setScreen = function(screenName, options) {

    this.activeScreen = screenName;

    if (options) {
        this.setScreen(screenName, options);
    }
}

Channel.prototype.getScreen = function(screenName) {

    return _.where(this.screens, { name: screenName });

}

Channel.prototype.setScreenOptions = function(screenName, options) {
    this.getScreen(screenName).setOptions(options);
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
}

Channel.prototype.getOverlay = function(overlayName) {
    return _.where(this.overlays, { name: overlayName });
}

Channel.prototype.toClientJSON = function() {

}

Channel.prototype.toStorageJSON = function() {

}

module.exports = Channel;