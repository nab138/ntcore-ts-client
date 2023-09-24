"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubClient = void 0;
var tslib_1 = require("tslib");
var topic_1 = require("./topic");
var messenger_1 = require("../socket/messenger");
const { NetworkTables } = require("../ntcore-ts-client");
/** The client for the PubSub protocol. */
var PubSubClient = /** @class */ (function () {
  function PubSubClient(serverUrl) {
    var _this = this;
    /**
     * Called by the messenger when a topic is updated.
     *
     * @param message - The message data.
     */
    this.onTopicUpdate = function (message) {
      var topic = _this.getTopicFromId(message.topicId);
      if (!topic) {
        console.warn("Received message for unknown topic", message);
        return;
      }
      _this.updateTopic(topic.name, message.value, message.serverTime);
    };
    /**
     * Called by the messenger when a topic is announced.
     *
     * @param params - The announce message parameters.
     */
    this.onTopicAnnounce = function (params) {
      if (!_this.topicsList.includes(params.name)) {
        _this.topicsList.push(params.name);
      }
      var topic = _this.topics.get(params.name);
      if (!topic) {
        console.warn("Received announce for unknown topic", params);
        // Create the topic
        let topic = new topic_1.NetworkTablesTopic(
          this,
          params.name,
          params.type,
          undefined
        );
        return;
      }
      _this.announce(params.id, params.name);
    };
    /**
     * Called by the messenger when a topic is unannounced.
     *
     * @param params - The unannounce message parameters.
     */
    this.onTopicUnannounce = function (params) {
      if (_this.topicsList.includes(params.name)) {
        _this.topicsList.splice(this.topicsList.indexOf(params.name), 1);
      }
      var topic = _this.topics.get(params.name);
      if (!topic) {
        console.warn("Received unannounce for unknown topic", params);
        return;
      }
      _this.unannounce(params.name);
    };
    this._messenger = messenger_1.Messenger.getInstance(
      serverUrl,
      this.onTopicUpdate,
      this.onTopicAnnounce,
      this.onTopicUnannounce
    );
    this.topics = new Map();
    this.topicsList = [];
    // In the DOM, auto-cleanup
    if (typeof window !== "undefined") {
      window.onbeforeunload = function () {
        _this.cleanup();
      };
    }
  }
  Object.defineProperty(PubSubClient.prototype, "messenger", {
    get: function () {
      return this._messenger;
    },
    enumerable: false,
    configurable: true,
  });
  /**
   * Gets the instance of the NetworkTables client.
   *
   * @param serverUrl - The URL of the server to connect to. This is not used after the first call.
   * @returns The instance of the NetworkTables client.
   */
  PubSubClient.getInstance = function (serverUrl) {
    var instance = this._instances.get(serverUrl);
    if (!instance) {
      instance = new PubSubClient(serverUrl);
      this._instances.set(serverUrl, instance);
    }
    return instance;
  };
  /**
   * Reinstantiates the client by resubscribing to all previously subscribed topics
   * and republishing for all previously published topics.
   *
   * @param url - The URL of the server to connect to.
   */
  PubSubClient.prototype.reinstantiate = function (url) {
    this._messenger.reinstantiate(url);
  };
  /**
   * Registers a topic with this PubSubClient.
   *
   * @param topic - The topic to register
   */
  PubSubClient.prototype.registerTopic = function (topic) {
    if (this.topics.has(topic.name)) {
      throw new Error(
        "Topic ".concat(
          topic.name,
          " already exists. Cannot register a topic with the same name."
        )
      );
    }
    this.topics.set(topic.name, topic);
  };
  /**
   * Marks a topic as announced
   *
   * @param topicId - The ID of the topic to announce
   * @param topicName - The name of the topic to announce
   */
  PubSubClient.prototype.announce = function (topicId, topicName) {
    var topic = this.topics.get(topicName);
    if (!topic) {
      console.warn(
        "Topic ".concat(topicName, " was announced, but does not exist")
      );
      return;
    }
    topic.announce(topicId);
  };
  /**
   * Marks a topic as unannounced
   *
   * @param topicName - The name of the topic to unannounce
   */
  PubSubClient.prototype.unannounce = function (topicName) {
    var topic = this.topics.get(topicName);
    if (!topic) {
      console.warn(
        "Topic ".concat(topicName, " was unannounced, but does not exist")
      );
      return;
    }
    topic.unannounce();
  };
  /**
   * Updates a topic with a new value
   *
   * @param topicName - The name of the topic to update
   * @param value - The new value of the topic
   * @param lastChangedTime - The server time the topic was last changed
   */
  PubSubClient.prototype.updateTopic = function (
    topicName,
    value,
    lastChangedTime
  ) {
    var topic = this.topics.get(topicName);
    if (!topic) {
      console.warn(
        "Topic ".concat(topicName, " was updated, but does not exist")
      );
      return;
    }
    topic.updateValue(value, lastChangedTime);
  };
  /**
   * Updates the value of a topic on the server.
   *
   * @param topic - The topic to update.
   * @param value - The new value of the topic.
   */
  PubSubClient.prototype.updateServer = function (topic, value) {
    this._messenger.sendToTopic(topic, value);
  };
  /**
   * Gets the topic with the given ID.
   *
   * @param topicId - The ID of the topic to get.
   * @returns The topic with the given ID, or null if no topic with that ID exists.
   */
  PubSubClient.prototype.getTopicFromId = function (topicId) {
    var e_1, _a;
    try {
      for (
        var _b = tslib_1.__values(this.topics.values()), _c = _b.next();
        !_c.done;
        _c = _b.next()
      ) {
        var topic = _c.value;
        if (topic.id === topicId) {
          return topic;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return null;
  };
  /**
   * Gets the topic with the given name.
   *
   * @param topicName - The name of the topic to get.
   * @returns The topic with the given name, or null if no topic with that name exists.
   */
  PubSubClient.prototype.getTopicFromName = function (topicName) {
    var _a;
    return (_a = this.topics.get(topicName)) !== null && _a !== void 0
      ? _a
      : null;
  };

  /**
   * Gets the names of all topics that have been announced (subscribe to / with prefix mode to get all topics).
   * @returns The names of all topics that have been announced.
   */
  PubSubClient.prototype.getTopicNames = function () {
    return this.topicsList;
  };

  /**
   * Cleans up the client by unsubscribing from all topics and stopping publishing for all topics.
   */
  PubSubClient.prototype.cleanup = function () {
    this.topics.forEach(function (topic) {
      topic.unsubscribeAll();
      if (topic.publisher) topic.unpublish();
    });
    this._messenger.socket.close();
  };
  PubSubClient._instances = new Map();
  return PubSubClient;
})();
exports.PubSubClient = PubSubClient;
//# sourceMappingURL=pubsub.js.map
