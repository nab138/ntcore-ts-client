"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messenger = void 0;
var socket_1 = require("./socket");
/** NetworkTables client. */
var Messenger = /** @class */ (function () {
    /**
     * Creates a new NetworkTables client.
     *
     * @param serverUrl - The URL of the server to connect to.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     */
    function Messenger(serverUrl, onTopicUpdate, onAnnounce, onUnannounce) {
        var _this = this;
        this.publications = new Map();
        this.subscriptions = new Map();
        /**
         * Called when the socket opens.
         */
        this.onSocketOpen = function () {
            // Send all subscriptions
            _this.subscriptions.forEach(function (params) {
                _this.subscribe(params, true);
            });
            // Send all publications
            _this.publications.forEach(function (params) {
                _this.publish(params, true);
            });
        };
        /**
         * Called when the socket closes.
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.onSocketClose = function () { };
        this._socket = socket_1.NetworkTablesSocket.getInstance(serverUrl, this.onSocketOpen, this.onSocketClose, onTopicUpdate, onAnnounce, onUnannounce);
    }
    Object.defineProperty(Messenger.prototype, "socket", {
        /**
         * Gets the NetworkTablesSocket used by the Messenger.
         *
         * @returns The NetworkTablesSocket used by the Messenger.
         */
        get: function () {
            return this._socket;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the instance of the NetworkTables client.
     *
     * @param serverUrl - The URL of the server to connect to. This is not needed after the first call.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     * @returns The instance of the NetworkTables client.
     */
    Messenger.getInstance = function (serverUrl, onTopicUpdate, onAnnounce, onUnannounce) {
        var instance = this._instances.get(serverUrl);
        if (!instance) {
            instance = new this(serverUrl, onTopicUpdate, onAnnounce, onUnannounce);
            this._instances.set(serverUrl, instance);
        }
        return instance;
    };
    /**
     * Reinstantiates the messenger by resetting the socket with a new URL.
     *
     * @param serverUrl - The URL of the server to connect to.
     */
    Messenger.prototype.reinstantiate = function (serverUrl) {
        this._socket.stopAutoConnect();
        this._socket.reinstantiate(serverUrl);
        this._socket.startAutoConnect();
    };
    /**
     * Gets all publications.
     *
     * @returns An iterator of all publications in the form [id, params].
     */
    Messenger.prototype.getPublications = function () {
        return this.publications.entries();
    };
    /**
     * Gets all subscriptions.
     *
     * @returns An iterator of all subscriptions in the form [id, params].
     */
    Messenger.prototype.getSubscriptions = function () {
        return this.subscriptions.entries();
    };
    /**
     * Publishes a topic to the server.
     *
     * @param params - The publication parameters.
     * @param force - Whether to force the publication.
     */
    Messenger.prototype.publish = function (params, force) {
        // Check if the topic is already published
        if (this.publications.has(params.pubuid) && !force)
            return;
        // Add the topic to the list of published topics
        this.publications.set(params.pubuid, params);
        // Send the message to the server
        var message = {
            method: 'publish',
            params: params,
        };
        this._socket.sendTextFrame(message);
    };
    /**
     * Unpublishes a topic from the server.
     *
     * @param pubuid - The publication ID to unpublish.
     */
    Messenger.prototype.unpublish = function (pubuid) {
        // Check if the topic is not published
        if (!this.publications.delete(pubuid))
            return;
        // Send the message to the server
        var message = {
            method: 'unpublish',
            params: {
                pubuid: pubuid,
            },
        };
        this._socket.sendTextFrame(message);
    };
    /**
     * Subscribes to a topic.
     *
     * @param params - The subscription parameters.
     * @param force - Whether to force the subscription.
     */
    Messenger.prototype.subscribe = function (params, force) {
        if (this.subscriptions.has(params.subuid) && !force)
            return;
        this.subscriptions.set(params.subuid, params);
        // Create the message to send to the server
        var message = {
            method: 'subscribe',
            params: params,
        };
        // Send the message to the server
        this._socket.sendTextFrame(message);
    };
    /**
     * Unsubscribes from a topic.
     *
     * @param subuid - The subscription ID to unsubscribe from.
     */
    Messenger.prototype.unsubscribe = function (subuid) {
        // Check if the topic is not subscribed
        if (!this.subscriptions.has(subuid))
            return;
        // Remove the topic from the list of subscribed topics
        this.subscriptions.delete(subuid);
        // Send the message to the server
        var message = {
            method: 'unsubscribe',
            params: {
                subuid: subuid,
            },
        };
        this._socket.sendTextFrame(message);
    };
    /**
     * Sets the properties of a topic.
     *
     * @param params - The parameters to set
     */
    Messenger.prototype.setProperties = function (params) {
        // Create the message to send to the server
        var message = {
            method: 'setproperties',
            params: params,
        };
        // Send the message to the server
        this._socket.sendTextFrame(message);
    };
    /**
     * Send data to a topic.
     * This should only be called by the PubSubClient.
     *
     * @param topic - The topic to update.
     * @param value - The value to update the topic to.
     * @returns The timestamp of the update, or -1 if the topic is not announced.
     */
    Messenger.prototype.sendToTopic = function (topic, value) {
        var typeInfo = topic.typeInfo;
        if (!topic.publisher || !topic.pubuid) {
            throw new Error("Topic ".concat(topic.name, " is not a publisher, so it cannot be updated"));
        }
        if (!topic.announced) {
            console.warn("Topic ".concat(topic.name, " is not announced, but the new value will be queued"));
        }
        return this._socket.sendValueToTopic(topic.pubuid, value, typeInfo);
    };
    Messenger._instances = new Map();
    return Messenger;
}());
exports.Messenger = Messenger;
//# sourceMappingURL=messenger.js.map