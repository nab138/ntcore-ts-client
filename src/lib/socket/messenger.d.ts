import { NetworkTablesSocket } from './socket';
import type { NetworkTablesTopic } from '../pubsub/topic';
import type { PublishMessageParams, SetPropertiesMessageParams, SubscribeMessageParams, NetworkTablesTypes, BinaryMessageData, AnnounceMessageParams, UnannounceMessageParams } from '../types/types';
/** NetworkTables client. */
export declare class Messenger {
    private readonly _socket;
    private readonly publications;
    private readonly subscriptions;
    private static _instances;
    /**
     * Gets the NetworkTablesSocket used by the Messenger.
     *
     * @returns The NetworkTablesSocket used by the Messenger.
     */
    get socket(): NetworkTablesSocket;
    /**
     * Creates a new NetworkTables client.
     *
     * @param serverUrl - The URL of the server to connect to.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     */
    private constructor();
    /**
     * Gets the instance of the NetworkTables client.
     *
     * @param serverUrl - The URL of the server to connect to. This is not needed after the first call.
     * @param onTopicUpdate - Called when a topic is updated.
     * @param onAnnounce - Called when a topic is announced.
     * @param onUnannounce - Called when a topic is unannounced.
     * @returns The instance of the NetworkTables client.
     */
    static getInstance(serverUrl: string, onTopicUpdate: (_: BinaryMessageData) => void, onAnnounce: (_: AnnounceMessageParams) => void, onUnannounce: (_: UnannounceMessageParams) => void): Messenger;
    /**
     * Reinstantiates the messenger by resetting the socket with a new URL.
     *
     * @param serverUrl - The URL of the server to connect to.
     */
    reinstantiate(serverUrl: string): void;
    /**
     * Gets all publications.
     *
     * @returns An iterator of all publications in the form [id, params].
     */
    getPublications(): IterableIterator<[number, {
        type: "string" | "boolean" | "float" | "double" | "int" | "json" | "raw" | "rpc" | "msgpack" | "protobuf" | "boolean[]" | "double[]" | "int[]" | "float[]" | "string[]";
        name: string;
        properties: {
            persistent?: boolean | undefined;
            retained?: boolean | undefined;
        };
        pubuid: number;
    }]>;
    /**
     * Gets all subscriptions.
     *
     * @returns An iterator of all subscriptions in the form [id, params].
     */
    getSubscriptions(): IterableIterator<[number, {
        options: {
            periodic?: number | undefined;
            all?: boolean | undefined;
            topicsonly?: boolean | undefined;
            prefix?: boolean | undefined;
        };
        topics: string[];
        subuid: number;
    }]>;
    /**
     * Called when the socket opens.
     */
    onSocketOpen: () => void;
    /**
     * Called when the socket closes.
     */
    onSocketClose: () => void;
    /**
     * Publishes a topic to the server.
     *
     * @param params - The publication parameters.
     * @param force - Whether to force the publication.
     */
    publish(params: PublishMessageParams, force?: boolean): void;
    /**
     * Unpublishes a topic from the server.
     *
     * @param pubuid - The publication ID to unpublish.
     */
    unpublish(pubuid: number): void;
    /**
     * Subscribes to a topic.
     *
     * @param params - The subscription parameters.
     * @param force - Whether to force the subscription.
     */
    subscribe(params: SubscribeMessageParams, force?: boolean): void;
    /**
     * Unsubscribes from a topic.
     *
     * @param subuid - The subscription ID to unsubscribe from.
     */
    unsubscribe(subuid: number): void;
    /**
     * Sets the properties of a topic.
     *
     * @param params - The parameters to set
     */
    setProperties(params: SetPropertiesMessageParams): void;
    /**
     * Send data to a topic.
     * This should only be called by the PubSubClient.
     *
     * @param topic - The topic to update.
     * @param value - The value to update the topic to.
     * @returns The timestamp of the update, or -1 if the topic is not announced.
     */
    sendToTopic<T extends NetworkTablesTypes>(topic: NetworkTablesTopic<T>, value: T): number;
}
