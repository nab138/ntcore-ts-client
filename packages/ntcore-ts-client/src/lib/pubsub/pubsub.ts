import { Messenger } from '../socket/messenger';

import { NetworkTablesTopic } from './topic';
import {
  AnnounceMessageParams,
  BinaryMessageData,
  NetworkTablesTypeInfo,
  NetworkTablesTypeInfosLookup,
  NetworkTablesTypes,
  PropertiesMessageParams,
  UnannounceMessageParams,
} from '../types/types';

export type TopicInfo = {
  name: string;
  type: NetworkTablesTypeInfo;
}

/** The client for the PubSub protocol. */
export class PubSubClient {
  private readonly _messenger: Messenger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private topics: Map<string, NetworkTablesTopic<any>>;
  private static _instances = new Map<string, PubSubClient>();
  private topicsList: TopicInfo[] = [];

  get messenger() {
    return this._messenger;
  }

  private constructor(serverUrl: string) {
    this._messenger = Messenger.getInstance(
      serverUrl,
      this.onTopicUpdate,
      this.onTopicAnnounce,
      this.onTopicUnannounce,
      this.onTopicProperties
    );
    this.topics = new Map();

    // In the DOM, auto-cleanup
    if (typeof window !== 'undefined') {
      window.onbeforeunload = () => {
        this.cleanup();
      };
    }
  }

  /**
   * Gets the instance of the NetworkTables client.
   * @param serverUrl - The URL of the server to connect to. This is not used after the first call.
   * @returns The instance of the NetworkTables client.
   */
  static getInstance(serverUrl: string): PubSubClient {
    let instance = this._instances.get(serverUrl);
    if (!instance) {
      instance = new PubSubClient(serverUrl);
      this._instances.set(serverUrl, instance);
    }

    return instance;
  }

  /**
   * Reinstantiates the client by resubscribing to all previously subscribed topics
   * and republishing for all previously published topics.
   * @param url - The URL of the server to connect to.
   */
  reinstantiate(url: string) {
    this._messenger.reinstantiate(url);
    this.topics.forEach((topic) => {
      topic.resubscribeAll(this);
      if (topic.publisher) topic.republish(this);
    });
  }

  /**
   * Registers a topic with this PubSubClient.
   * @param topic - The topic to register
   */
  registerTopic<T extends NetworkTablesTypes>(topic: NetworkTablesTopic<T>) {
    if (this.topics.has(topic.name)) {
      throw new Error(`Topic ${topic.name} already exists. Cannot register a topic with the same name.`);
    }
    this.topics.set(topic.name, topic);
  }

  /**
   * Called by the messenger when a topic is updated.
   * @param message - The message data.
   */
  private onTopicUpdate = (message: BinaryMessageData) => {
    const topic = this.getTopicFromId(message.topicId);
    if (!topic) {
      console.warn('Received message for unknown topic', message);
      return;
    }
    topic.updateValue(message.value, message.serverTime);
  };

  /**
   * Called by the messenger when a topic is announced.
   * @param params - The announce message parameters.
   */
  private onTopicAnnounce = (params: AnnounceMessageParams) => {
    if (this.topicsList.find((t) => t.name === params.name) !== undefined) {
      this.topicsList.push({
        name: params.name,
        type: NetworkTablesTypeInfosLookup[params.type as keyof typeof NetworkTablesTypeInfosLookup],
      });
    }
    let topic = this.topics.get(params.name);
    if (!topic) {
      console.warn('Received announce for unknown topic, registering', params);
      if (!NetworkTablesTypeInfosLookup.hasOwnProperty(params.type)) {
        console.warn(`Unknown type ${params.type} for topic ${params.name}`);
        return;
      }
      let type = params.type as keyof typeof NetworkTablesTypeInfosLookup;
      topic = new NetworkTablesTopic(this, params.name, NetworkTablesTypeInfosLookup[type], undefined);
    }
    topic.announce(params.id, params.pubuid);
  };

  /**
   * Called by the messenger when a topic is unannounced.
   * @param params - The unannounce message parameters.
   */
  private onTopicUnannounce = (params: UnannounceMessageParams) => {
    if (this.topicsList.find((t) => t.name === params.name) !== undefined) {
      this.topicsList.splice(this.topicsList.indexOf(params.name), 1);
    }
    const topic = this.topics.get(params.name);
    if (!topic) {
      console.warn(`Topic ${params.name} was unannounced, but does not exist`);
      return;
    }
    topic.unannounce();
  };

  /**
   * Called by the messenger when a topic's properties are updated.
   * @param params - The properties message parameters.
   */
  private onTopicProperties = (params: PropertiesMessageParams) => {
    const topic = this.topics.get(params.name);
    if (params.ack) {
      if (!topic) {
        console.warn(`Topic ${params.name} properties were updated, but does not exist`);
        return;
      }
    }
  };

  /**
   * Updates the value of a topic on the server.
   * @param topic - The topic to update.
   * @param value - The new value of the topic.
   */
  updateServer<T extends NetworkTablesTypes>(topic: NetworkTablesTopic<T>, value: T) {
    this._messenger.sendToTopic(topic, value);
  }

  /**
   * Gets the topic with the given ID.
   * @param topicId - The ID of the topic to get.
   * @returns The topic with the given ID, or null if no topic with that ID exists.
   */
  private getTopicFromId(topicId: number) {
    for (const topic of this.topics.values()) {
      if (topic.id === topicId) {
        return topic;
      }
    }
    return null;
  }

  /**
   * Gets the topic with the given name.
   * @param topicName - The name of the topic to get.
   * @returns The topic with the given name, or null if no topic with that name exists.
   */
  getTopicFromName(topicName: string) {
    return this.topics.get(topicName) ?? null;
  }

  /**
   * Get the names of all topics this client is aware of.
   * @returns The names of all topics this client is aware of.
   */
  getTopicNames() {
    return this.topicsList.map((topic) => topic.name);
  }

  /**
   * Get the names and types of all topics this client is aware of.
   * @returns The names and types of all topics this client is aware of.
   */
  getTopicInfos() {
    return this.topicsList;
  }

  /**
   * Cleans up the client by unsubscribing from all topics and stopping publishing for all topics.
   */
  cleanup() {
    this.topics.forEach((topic) => {
      topic.unsubscribeAll();

      if (topic.publisher) topic.unpublish();
    });
    this._messenger.socket.close();
  }
}
