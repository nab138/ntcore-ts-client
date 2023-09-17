"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTablesSocket = void 0;
var tslib_1 = require("tslib");
var msgpack_1 = require("@msgpack/msgpack");
var isomorphic_ws_1 = tslib_1.__importDefault(require("isomorphic-ws"));
var schemas_1 = require("../types/schemas");
var types_1 = require("../types/types");
var util_1 = require("../util/util");
/** Socket for NetworkTables 4.0 */
var NetworkTablesSocket = /** @class */ (function () {
    /**
     * Creates a new NetworkTables socket.
     *
     * @param serverUrl - The URL of the server to connect to.
     * @param onSocketOpen - Called when the socket is opened.
     * @param onSocketClose - Called when the socket is closed.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     * @param autoConnect - Whether to automatically connect to the server.
     */
    function NetworkTablesSocket(serverUrl, onSocketOpen, onSocketClose, onTopicUpdate, onAnnounce, onUnannounce, autoConnect) {
        this.connectionListeners = new Set();
        this.lastHeartbeatDate = 0;
        this.offset = 0;
        this.bestRtt = -1;
        this.autoConnect = true;
        this.messageQueue = [];
        // Connect to the server using the provided URL
        this._websocket = new isomorphic_ws_1.default(serverUrl, 'networktables.first.wpi.edu');
        this.serverUrl = serverUrl;
        this.onSocketOpen = onSocketOpen;
        this.onSocketClose = onSocketClose;
        this.onTopicUpdate = onTopicUpdate;
        this.onAnnounce = onAnnounce;
        this.onUnannounce = onUnannounce;
        this.autoConnect = autoConnect;
        this.init();
    }
    Object.defineProperty(NetworkTablesSocket.prototype, "websocket", {
        get: function () {
            return this._websocket;
        },
        set: function (websocket) {
            this._websocket = websocket;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the instance of the NetworkTables socket.
     *
     * @param serverUrl - The URL of the server to connect to.
     * @param onSocketOpen - Called when the socket is opened.
     * @param onSocketClose - Called when the socket is closed.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     * @param autoConnect - Whether to automatically connect to the server.
     * @returns The instance of the NetworkTables socket.
     */
    NetworkTablesSocket.getInstance = function (serverUrl, onSocketOpen, onSocketClose, onTopicUpdate, onAnnounce, onUnannounce, autoConnect) {
        if (autoConnect === void 0) { autoConnect = true; }
        var instance = this.instances.get(serverUrl);
        if (!instance) {
            instance = new this(serverUrl, onSocketOpen, onSocketClose, onTopicUpdate, onAnnounce, onUnannounce, autoConnect);
            this.instances.set(serverUrl, instance);
        }
        return instance;
    };
    /**
     * Initialization. This is done outside of the constructor to allow for
     * the socket to refresh itself.
     */
    NetworkTablesSocket.prototype.init = function () {
        var _this = this;
        var heartbeatInterval;
        if (this._websocket) {
            // Open handler
            this._websocket.onopen = function () {
                _this.updateConnectionListeners();
                _this.onSocketOpen();
                // eslint-disable-next-line no-console
                console.info('Robot Connected!');
                _this.sendQueuedMessages();
                // Start heartbeat
                heartbeatInterval = setInterval(function () {
                    if (_this.isConnected()) {
                        _this.heartbeat();
                    }
                }, 1000);
            };
            // Close handler
            this._websocket.onclose = function (e) {
                // Notify client and cancel heartbeat
                _this.updateConnectionListeners();
                _this.onSocketClose();
                clearInterval(heartbeatInterval);
                // Lost connection message
                console.warn('Unable to connect to Robot', e.reason);
                // Attempt to reconnect
                if (_this.autoConnect) {
                    console.warn('Reconnect will be attempted in 1 second.');
                    setTimeout(function () {
                        _this._websocket = new isomorphic_ws_1.default(_this.serverUrl, 'networktables.first.wpi.edu');
                        _this.init();
                    }, 1000);
                }
            };
            this._websocket.binaryType = 'arraybuffer';
            // Set up event listeners for messages and errors
            this._websocket.onmessage = function (event) { return _this.onMessage(event); };
            this._websocket.onerror = function (event) { return _this.onError(event); };
        }
    };
    /**
     * Reset the socket and reconnect to the server.
     *
     * @param serverUrl - The URL of the server to connect to.
     */
    NetworkTablesSocket.prototype.reinstantiate = function (serverUrl) {
        this.close();
        this.serverUrl = serverUrl;
        this._websocket = new isomorphic_ws_1.default(this.serverUrl, 'networktables.first.wpi.edu');
        this.init();
    };
    /**
     * Returns whether the socket is connected.
     *
     * @returns Whether the socket is connected.
     */
    NetworkTablesSocket.prototype.isConnected = function () {
        return this._websocket.readyState === isomorphic_ws_1.default.OPEN;
    };
    /**
     * Returns whether the socket is connecting.
     *
     * @returns Whether the socket is connecting.
     */
    NetworkTablesSocket.prototype.isConnecting = function () {
        return this._websocket.readyState === isomorphic_ws_1.default.CONNECTING;
    };
    /**
     * Returns whether the socket is closing.
     *
     * @returns Whether the socket is closing.
     */
    NetworkTablesSocket.prototype.isClosing = function () {
        return this._websocket.readyState === isomorphic_ws_1.default.CLOSING;
    };
    /**
     * Returns whether the socket is closed.
     *
     * @returns Whether the socket is closed.
     */
    NetworkTablesSocket.prototype.isClosed = function () {
        return this._websocket.readyState === isomorphic_ws_1.default.CLOSED;
    };
    /**
     * Create a connection listener.
     *
     * @param callback - Called when the connection state changes.
     * @param immediateNotify - Whether to immediately notify the callback of the current connection state.
     * @returns A function that removes the listener.
     */
    NetworkTablesSocket.prototype.addConnectionListener = function (callback, immediateNotify) {
        var _this = this;
        this.connectionListeners.add(callback);
        if (immediateNotify) {
            callback(this.isConnected());
        }
        return function () { return _this.connectionListeners.delete(callback); };
    };
    /**
     * Updates all connection listeners with the current connection state.
     */
    NetworkTablesSocket.prototype.updateConnectionListeners = function () {
        var _this = this;
        this.connectionListeners.forEach(function (callback) { return callback(_this.isConnected()); });
    };
    /**
     * Stops auto-reconnecting to the server.
     */
    NetworkTablesSocket.prototype.stopAutoConnect = function () {
        this.autoConnect = false;
    };
    /**
     * Starts auto-reconnecting to the server.
     */
    NetworkTablesSocket.prototype.startAutoConnect = function () {
        this.autoConnect = true;
    };
    /**
     * Handle a message from the websocket.
     *
     * @param event - The message event.
     */
    NetworkTablesSocket.prototype.onMessage = function (event) {
        var _this = this;
        var _a;
        (_a = this.connectionListeners) === null || _a === void 0 ? void 0 : _a.forEach(function (f) { return f(_this.isConnected()); });
        if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
            this.handleBinaryFrame(event.data);
        }
        else {
            this.handleTextFrame(event.data);
        }
    };
    /**
     * Handle an error from the websocket.
     *
     * @param event - The error event.
     */
    NetworkTablesSocket.prototype.onError = function (event) {
        // Log the error to the console
        console.error('WebSocket error:', event);
    };
    /**
     * Handle a binary frame from the websocket.
     *
     * @param frame - The frame.
     */
    NetworkTablesSocket.prototype.handleBinaryFrame = function (frame) {
        var e_1, _a;
        try {
            // TODO: Use streams
            for (var _b = tslib_1.__values((0, msgpack_1.decodeMulti)(frame)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var f = _c.value;
                var message = schemas_1.msgPackSchema.parse(f);
                var messageData = {
                    topicId: message[0],
                    serverTime: message[1],
                    typeInfo: util_1.Util.getNetworkTablesTypeFromTypeNum(message[2]),
                    value: message[3],
                };
                // Heartbeat message
                if (messageData.topicId === -1) {
                    this.handleRTT(messageData.serverTime);
                }
                // Normal message
                else {
                    this.onTopicUpdate(messageData);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Handle a text frame from the websocket.
     *
     * @param frame - The frame.
     */
    NetworkTablesSocket.prototype.handleTextFrame = function (frame) {
        var _this = this;
        // Parse the message from the server
        var messageData = JSON.parse(frame);
        var messages = schemas_1.messageSchema.parse(messageData);
        messages.forEach(function (message) {
            // Check the type of the message and handle it accordingly
            switch (message.method) {
                case 'announce':
                    _this.handleAnnounceParams(message.params);
                    break;
                case 'unannounce':
                    _this.handleUnannounceParams(message.params);
                    break;
                case 'properties':
                    _this.handlePropertiesParams(message.params);
                    break;
                default:
                    console.warn('Client does not handle message method:', message.method);
            }
        });
    };
    /**
     * Handle an announce message from the server.
     *
     * @param params - The message params.
     */
    NetworkTablesSocket.prototype.handleAnnounceParams = function (params) {
        this.onAnnounce(params);
    };
    /**
     * Handle an unannounce message from the server.
     *
     * @param params - The message params.
     */
    NetworkTablesSocket.prototype.handleUnannounceParams = function (params) {
        this.onUnannounce(params);
    };
    /**
     * Handle a properties message from the server.
     *
     * @param params - The message params.
     */
    NetworkTablesSocket.prototype.handlePropertiesParams = function (params) {
        // Extract the topic ID and properties from the params
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        var name = params.name, ack = params.ack;
        // TODO: Do we need to do something with this?
    };
    /**
     * Send a text frame to the server.
     *
     * @param message - The message to send.
     */
    NetworkTablesSocket.prototype.sendTextFrame = function (message) {
        // Send the message to the server
        if (this.isConnected()) {
            this._websocket.send(JSON.stringify([message]));
        }
        else {
            this.messageQueue.push(JSON.stringify([message]));
        }
    };
    /**
     * Send a binary frame to the server.
     *
     * @param message - The message to send.
     */
    NetworkTablesSocket.prototype.sendBinaryFrame = function (message) {
        var cleanMsg = schemas_1.msgPackSchema.parse(message);
        // Send the message to the server
        if (this.isConnected()) {
            this._websocket.send((0, msgpack_1.encode)(cleanMsg));
        }
        else {
            this.messageQueue.push((0, msgpack_1.encode)(cleanMsg));
        }
    };
    /**
     * Function to send queued messages whenever the WebSocket connection is opened
     */
    NetworkTablesSocket.prototype.sendQueuedMessages = function () {
        if (this.isConnected()) {
            while (this.messageQueue.length > 0) {
                var message = this.messageQueue.shift();
                if (message) {
                    this._websocket.send(message);
                }
            }
        }
    };
    /**
     * Send a message to a topic.
     *
     * @param id - The topic ID.
     * @param value - The value to send.
     * @param typeInfo - The type info for the value.
     * @returns The time the message was sent.
     */
    NetworkTablesSocket.prototype.sendValueToTopic = function (id, value, typeInfo) {
        var time = Math.ceil(this.getServerTime());
        var message = util_1.Util.createBinaryMessage(id, time, value, typeInfo);
        this.sendBinaryFrame(message);
        return time;
    };
    /**
     * Send a heartbeat message to the server.
     */
    NetworkTablesSocket.prototype.heartbeat = function () {
        var time = util_1.Util.getMicros();
        this.sendValueToTopic(-1, time, types_1.NetworkTablesTypeInfos.kDouble);
        this.lastHeartbeatDate = time;
    };
    /**
     * Handle a round trip time message from the server.
     *
     * This is used to calculate the offset between the client and server time
     * in order to estimate the current server time for binary messages.
     *
     * @param serverTime - The server time.
     */
    NetworkTablesSocket.prototype.handleRTT = function (serverTime) {
        var rtt = this.calcTimeDelta(this.lastHeartbeatDate);
        if (rtt < this.bestRtt || this.bestRtt === -1) {
            this.bestRtt = rtt;
            this.offset = util_1.Util.getMicros() - serverTime;
        }
    };
    /**
     * Get the current server time.
     *
     * @returns The current server time.
     */
    NetworkTablesSocket.prototype.getServerTime = function () {
        return util_1.Util.getMicros() - this.offset + this.bestRtt / 2;
    };
    /**
     * Calculate the time delta between the current time and a given time.
     *
     * @param sentDate - The time to calculate the delta from.
     * @returns The time delta.
     */
    NetworkTablesSocket.prototype.calcTimeDelta = function (sentDate) {
        return util_1.Util.getMicros() - sentDate;
    };
    /**
     * Close the websocket connection.
     */
    NetworkTablesSocket.prototype.close = function () {
        this._websocket.close();
    };
    NetworkTablesSocket.instances = new Map();
    return NetworkTablesSocket;
}());
exports.NetworkTablesSocket = NetworkTablesSocket;
exports.default = NetworkTablesSocket;
//# sourceMappingURL=socket.js.map