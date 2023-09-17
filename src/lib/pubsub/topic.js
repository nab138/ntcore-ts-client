"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTablesTopic = void 0;
var util_1 = require("../util/util");
var NetworkTablesTopic = /** @class */ (function () {
    /**
     * Creates a new topic. This should only be done after the
     * base NTCore client has been initialized.
     *
     * @param client - The client that owns the topic.
     * @param name - The name of the topic.
     * @param typeInfo - The type info for the topic.
     * @param defaultValue - The default value for the topic.
     */
    function NetworkTablesTopic(client, name, typeInfo, defaultValue) {
        this.client = client;
        this._name = name;
        this._typeInfo = typeInfo;
        this.value = defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        this._announced = false;
        this._publisher = false;
        this._subscribers = new Map();
        var existingTopic = this.client.getTopicFromName(name);
        if (existingTopic) {
            return existingTopic;
        }
        this.client.registerTopic(this);
    }
    Object.defineProperty(NetworkTablesTopic.prototype, "id", {
        /**
         * Gets the ID of the topic.
         *
         * @returns The ID of the topic.
         */
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "name", {
        /**
         * Gets the name of the topic.
         *
         * @returns The name of the topic.
         */
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "typeInfo", {
        /**
         * Gets the type info for the topic.
         *
         * @returns The type info for the topic.
         */
        get: function () {
            return this._typeInfo;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "lastChangedTime", {
        /**
         * Gets the server time of the last value change.
         *
         * @returns The server time of the last value change.
         */
        get: function () {
            return this._lastChangedTime;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "announced", {
        /**
         * Whether the topic has been announced.
         *
         * @returns Whether the topic has been announced.
         */
        get: function () {
            return this._announced;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "publisher", {
        /**
         * Gets whether the client is the publisher of the topic.
         *
         * @returns Whether the client is the publisher of the topic.
         */
        get: function () {
            return this._publisher;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "pubuid", {
        /**
         * Gets the UID of the publisher.
         *
         * @returns The UID of the publisher, or undefined if the client is not the publisher.
         */
        get: function () {
            return this._pubuid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetworkTablesTopic.prototype, "subscribers", {
        /**
         * Gets the subscribers to the topic.
         *
         * @returns The subscribers to the topic.
         */
        get: function () {
            return this._subscribers;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the value of the topic.
     * The client must be the publisher of the topic to set the value.
     *
     * @param value - The value to set.
     */
    NetworkTablesTopic.prototype.setValue = function (value) {
        if (!this.publisher) {
            throw new Error('Cannot set value on topic without being the publisher');
        }
        this.value = value;
        this.notifySubscribers();
        this.client.updateServer(this, value);
    };
    NetworkTablesTopic.prototype.getValue = function () {
        return this.value;
    };
    /**
     * Updates the value of the topic.
     * This should only be called by the PubSubClient.
     *
     * @param value - The value to update.
     * @param lastChangedTime - The server time of the last value change.
     */
    NetworkTablesTopic.prototype.updateValue = function (value, lastChangedTime) {
        this.value = value;
        this._lastChangedTime = lastChangedTime;
        this.notifySubscribers();
    };
    /** */
    /* ANNOUNCEMENTS */
    /** */
    /**
     * Marks the topic as announced. This should only be called by the PubSubClient.
     *
     * @param id - The ID of the topic.
     */
    NetworkTablesTopic.prototype.announce = function (id) {
        this._announced = true;
        this._id = id;
    };
    /** Marks the topic as unannounced. This should only be called by the PubSubClient. */
    NetworkTablesTopic.prototype.unannounce = function () {
        this._announced = false;
        this._id = undefined;
    };
    /** */
    /* SUBSCRIBING */
    /** */
    /**
     * Creates a new subscriber. This should only be called by the PubSubClient.
     *
     * @param callback - The callback to call when the topic value changes.
     * @param immediateNotify - Whether to immediately notify the subscriber of the current value.
     * @param options - The options for the subscriber.
     * @param id - The UID of the subscriber.
     * @param save - Whether to save the subscriber.
     * @returns The UID of the subscriber.
     */
    NetworkTablesTopic.prototype.subscribe = function (callback, immediateNotify, options, id, save) {
        if (immediateNotify === void 0) { immediateNotify = false; }
        if (options === void 0) { options = {}; }
        if (save === void 0) { save = true; }
        var subuid = id || util_1.Util.generateUid();
        var subscribeParams = {
            topics: [this.name],
            subuid: subuid,
            options: options,
        };
        this.client.messenger.subscribe(subscribeParams);
        if (immediateNotify)
            callback(this.value);
        if (save)
            this.subscribers.set(subuid, { callback: callback, immediateNotify: immediateNotify, options: options });
        return subuid;
    };
    /**
     * Removes a subscriber
     *
     * @param subuid - The UID of the subscriber.
     * @param removeCallback - Whether to remove the callback. Leave this as true unless you know what you're doing.
     */
    NetworkTablesTopic.prototype.unsubscribe = function (subuid, removeCallback) {
        if (removeCallback === void 0) { removeCallback = true; }
        this.client.messenger.unsubscribe(subuid);
        if (removeCallback)
            this.subscribers.delete(subuid);
    };
    /**
     * Removes all local subscribers.
     */
    NetworkTablesTopic.prototype.unsubscribeAll = function () {
        var _this = this;
        this.subscribers.forEach(function (_, subuid) { return _this.unsubscribe(subuid); });
    };
    /**
     * Resubscribes all local subscribers.
     *
     * @param client - The client to resubscribe with.
     */
    NetworkTablesTopic.prototype.resubscribeAll = function (client) {
        var _this = this;
        this.client = client;
        this.subscribers.forEach(function (info, subuid) {
            _this.subscribe(info.callback, info.immediateNotify, info.options, subuid, false);
        });
    };
    /**
     * Notifies all subscribers of the current value.
     */
    NetworkTablesTopic.prototype.notifySubscribers = function () {
        var _this = this;
        this.subscribers.forEach(function (info) { return info.callback(_this.value); });
    };
    /** */
    /* PUBLISHING */
    /** */
    /**
     * Publishes the topic.
     *
     * @param properties - The properties to publish the topic with.
     * @param id - The UID of the publisher.
     */
    NetworkTablesTopic.prototype.publish = function (properties, id) {
        if (properties === void 0) { properties = {}; }
        if (this.publisher)
            return;
        this._publisher = true;
        this._pubuid = id !== null && id !== void 0 ? id : util_1.Util.generateUid();
        var publishParams = {
            type: this.typeInfo[1],
            name: this.name,
            pubuid: this._pubuid,
            properties: properties,
        };
        this.client.messenger.publish(publishParams);
    };
    /**
     * Unpublishes the topic.
     */
    NetworkTablesTopic.prototype.unpublish = function () {
        if (!this.publisher || !this._pubuid) {
            throw new Error('Cannot unpublish topic without being the publisher');
        }
        this.client.messenger.unpublish(this._pubuid);
        this._publisher = false;
        this._pubuid = undefined;
    };
    /**
     * Republishes the topic.
     *
     * @param client - The client to republish with.
     */
    NetworkTablesTopic.prototype.republish = function (client) {
        this.client = client;
        if (!this.publisher || !this._pubuid) {
            throw new Error('Cannot republish topic without being the publisher');
        }
        this.publish({}, this._pubuid);
    };
    /**
     * Sets the properties of the topic.
     *
     * @param persistent - If true, the last set value will be periodically saved to persistent storage on the server and be restored during server startup. Topics with this property set to true will not be deleted by the server when the last publisher stops publishing.
     * @param retained - Topics with this property set to true will not be deleted by the server when the last publisher stops publishing.
     */
    NetworkTablesTopic.prototype.setProperties = function (persistent, retained) {
        var setPropertiesParams = {
            name: this.name,
            update: {
                persistent: persistent,
                retained: retained,
            },
        };
        this.client.messenger.setProperties(setPropertiesParams);
    };
    return NetworkTablesTopic;
}());
exports.NetworkTablesTopic = NetworkTablesTopic;
//# sourceMappingURL=topic.js.map