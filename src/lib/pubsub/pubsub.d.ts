import { Messenger } from "../socket/messenger";
import type { NetworkTablesTopic } from "./topic";
import type { NetworkTablesTypes } from "../types/types";
/** The client for the PubSub protocol. */
export declare class PubSubClient {
  private readonly _messenger;
  private topics;
  private topicsList;
  private static _instances;
  get messenger(): Messenger;
  private constructor();
  /**
   * Gets the instance of the NetworkTables client.
   *
   * @param serverUrl - The URL of the server to connect to. This is not used after the first call.
   * @returns The instance of the NetworkTables client.
   */
  static getInstance(serverUrl: string): PubSubClient;
  /**
   * Reinstantiates the client by resubscribing to all previously subscribed topics
   * and republishing for all previously published topics.
   *
   * @param url - The URL of the server to connect to.
   */
  reinstantiate(url: string): void;
  /**
   * Registers a topic with this PubSubClient.
   *
   * @param topic - The topic to register
   */
  registerTopic<T extends NetworkTablesTypes>(
    topic: NetworkTablesTopic<T>
  ): void;
  /**
   * Called by the messenger when a topic is updated.
   *
   * @param message - The message data.
   */
  private onTopicUpdate;
  /**
   * Called by the messenger when a topic is announced.
   *
   * @param params - The announce message parameters.
   */
  private onTopicAnnounce;
  /**
   * Called by the messenger when a topic is unannounced.
   *
   * @param params - The unannounce message parameters.
   */
  private onTopicUnannounce;
  /**
   * Marks a topic as announced
   *
   * @param topicId - The ID of the topic to announce
   * @param topicName - The name of the topic to announce
   */
  private announce;
  /**
   * Marks a topic as unannounced
   *
   * @param topicName - The name of the topic to unannounce
   */
  private unannounce;
  /**
   * Updates a topic with a new value
   *
   * @param topicName - The name of the topic to update
   * @param value - The new value of the topic
   * @param lastChangedTime - The server time the topic was last changed
   */
  private updateTopic;
  /**
   * Updates the value of a topic on the server.
   *
   * @param topic - The topic to update.
   * @param value - The new value of the topic.
   */
  updateServer<T extends NetworkTablesTypes>(
    topic: NetworkTablesTopic<T>,
    value: T
  ): void;
  /**
   * Gets the topic with the given ID.
   *
   * @param topicId - The ID of the topic to get.
   * @returns The topic with the given ID, or null if no topic with that ID exists.
   */
  private getTopicFromId;
  /**
   * Gets the topic with the given name.
   *
   * @param topicName - The name of the topic to get.
   * @returns The topic with the given name, or null if no topic with that name exists.
   */
  getTopicFromName(topicName: string): NetworkTablesTopic<any> | null;

  /**
   * Gets the names of all topics that have been announced (subscribe to / with prefix mode to get all topics).
   * @returns The names of all topics that have been announced.
   */
  getTopicNames(): string[];

  /**
   * Cleans up the client by unsubscribing from all topics and stopping publishing for all topics.
   */
  cleanup(): void;
}
