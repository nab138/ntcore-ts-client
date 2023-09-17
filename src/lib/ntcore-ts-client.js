"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTables = void 0;
var pubsub_1 = require("./pubsub/pubsub");
var topic_1 = require("./pubsub/topic");
var util_1 = require("./util/util");
/** NetworkTables class for interacting with NetworkTables over a WebSocket connection. */
var NetworkTables = /** @class */ (function () {
    /**
     * Creates a new NetworkTables instance.
     *
     * @param props - The properties to use to create the instance.
     * @throws Error if the team number or URI is not provided.
     */
    function NetworkTables(props) {
        if (props.team) {
            this.uri = util_1.Util.getRobotAddress(props.team);
        }
        else if (props.uri) {
            this.uri = props.uri;
        }
        else {
            throw new Error('Must provide either a team number or URI.');
        }
        this.port = props.port;
        NetworkTables._instances.set("".concat(this.uri, ":").concat(this.port), this);
        this._client = pubsub_1.PubSubClient.getInstance(util_1.Util.createServerUrl(this.uri, this.port));
    }
    Object.defineProperty(NetworkTables.prototype, "client", {
        /**
         * Gets the PubSubClient instance used to establish and manage the connection to the robot.
         *
         * @returns The PubSubClient instance.
         */
        get: function () {
            return this._client;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * DEPRECATED: Creates a new NetworkTables instance if it does not exist.
     *
     * @deprecated Use {@link getInstanceByTeam} instead.
     * @param team - The team number of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the team number is not provided.
     */
    NetworkTables.createInstanceByTeam = function (team, port) {
        if (port === void 0) { port = 5810; }
        return this.getInstanceByTeam(team, port);
    };
    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param team - The team number of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the team number is not provided.
     */
    NetworkTables.getInstanceByTeam = function (team, port) {
        if (port === void 0) { port = 5810; }
        var instance = this._instances.get("".concat(util_1.Util.getRobotAddress(team), ":").concat(port));
        if (!instance) {
            instance = new this({ team: team, port: port });
        }
        return instance;
    };
    /**
     * DEPRECATED: Creates a new NetworkTables instance if it does not exist.
     *
     * @deprecated Use {@link getInstanceByURI} instead.
     * @param uri - The URI of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the URI is not provided.
     */
    NetworkTables.createInstanceByURI = function (uri, port) {
        if (port === void 0) { port = 5810; }
        return this.getInstanceByURI(uri, port);
    };
    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param uri - The URI of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the URI is not provided.
     */
    NetworkTables.getInstanceByURI = function (uri, port) {
        if (port === void 0) { port = 5810; }
        var instance = this._instances.get("".concat(uri, ":").concat(port));
        if (!instance) {
            instance = new this({ uri: uri, port: port });
        }
        return instance;
    };
    /**
     * Returns the URI of the server.
     *
     * @returns The robot address.
     */
    NetworkTables.prototype.getURI = function () {
        return this.uri;
    };
    NetworkTables.prototype.changeURI = function (uri, port) {
        if (port === void 0) { port = 5810; }
        this.uri = uri;
        this._client.reinstantiate(util_1.Util.createServerUrl(uri, port));
    };
    /**
     * Returns the port to connect to the robot on.
     *
     * @returns The port number.
     */
    NetworkTables.prototype.getPort = function () {
        return this.port;
    };
    /**
     * Returns whether the robot is currently connected.
     *
     * @returns Whether the robot is connected.
     */
    NetworkTables.prototype.isRobotConnected = function () {
        return this._client.messenger.socket.isConnected();
    };
    /**
     * Returns whether the robot is currently connecting.
     *
     * @returns Whether the robot is connecting.
     */
    NetworkTables.prototype.isRobotConnecting = function () {
        return this._client.messenger.socket.isConnecting();
    };
    /**
     * Adds a listener for robot connection status updates.
     *
     * @param callback - The callback to call when the connection status changes.
     * @param immediateNotify - Whether to immediately notify the callback of the current connection status.
     * @returns A function to remove the listener.
     */
    NetworkTables.prototype.addRobotConnectionListener = function (callback, immediateNotify) {
        return this._client.messenger.socket.addConnectionListener(callback, immediateNotify);
    };
    /**
     * Creates a new topic.
     *
     * @param name - The name of the topic.
     * @param typeInfo - The type information of the topic.
     * @param defaultValue - The default value of the topic.
     * @returns The topic.
     */
    NetworkTables.prototype.createTopic = function (name, typeInfo, defaultValue) {
        return new topic_1.NetworkTablesTopic(this._client, name, typeInfo, defaultValue);
    };
    /** The instance of the NetworkTables class. */
    NetworkTables._instances = new Map();
    return NetworkTables;
}());
exports.NetworkTables = NetworkTables;
//# sourceMappingURL=ntcore-ts-client.js.map