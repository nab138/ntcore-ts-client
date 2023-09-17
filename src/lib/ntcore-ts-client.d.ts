import { PubSubClient } from './pubsub/pubsub';
import { NetworkTablesTopic } from './pubsub/topic';
import type { NetworkTablesTypeInfo, NetworkTablesTypes } from './types/types';
/** NetworkTables class for interacting with NetworkTables over a WebSocket connection. */
export declare class NetworkTables {
    /** The URI of the server. */
    private uri;
    private port;
    /** The PubSubClient instance used to establish and manage the connection to the robot. */
    private _client;
    /** The instance of the NetworkTables class. */
    private static _instances;
    /**
     * Gets the PubSubClient instance used to establish and manage the connection to the robot.
     *
     * @returns The PubSubClient instance.
     */
    get client(): PubSubClient;
    /**
     * Creates a new NetworkTables instance.
     *
     * @param props - The properties to use to create the instance.
     * @throws Error if the team number or URI is not provided.
     */
    private constructor();
    /**
     * DEPRECATED: Creates a new NetworkTables instance if it does not exist.
     *
     * @deprecated Use {@link getInstanceByTeam} instead.
     * @param team - The team number of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the team number is not provided.
     */
    static createInstanceByTeam(team: number, port?: number): NetworkTables;
    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param team - The team number of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the team number is not provided.
     */
    static getInstanceByTeam(team: number, port?: number): NetworkTables;
    /**
     * DEPRECATED: Creates a new NetworkTables instance if it does not exist.
     *
     * @deprecated Use {@link getInstanceByURI} instead.
     * @param uri - The URI of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the URI is not provided.
     */
    static createInstanceByURI(uri: string, port?: number): NetworkTables;
    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param uri - The URI of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the URI is not provided.
     */
    static getInstanceByURI(uri: string, port?: number): NetworkTables;
    /**
     * Returns the URI of the server.
     *
     * @returns The robot address.
     */
    getURI(): string;
    changeURI(uri: string, port?: number): void;
    /**
     * Returns the port to connect to the robot on.
     *
     * @returns The port number.
     */
    getPort(): number;
    /**
     * Returns whether the robot is currently connected.
     *
     * @returns Whether the robot is connected.
     */
    isRobotConnected(): boolean;
    /**
     * Returns whether the robot is currently connecting.
     *
     * @returns Whether the robot is connecting.
     */
    isRobotConnecting(): boolean;
    /**
     * Adds a listener for robot connection status updates.
     *
     * @param callback - The callback to call when the connection status changes.
     * @param immediateNotify - Whether to immediately notify the callback of the current connection status.
     * @returns A function to remove the listener.
     */
    addRobotConnectionListener(callback: (_: boolean) => void, immediateNotify?: boolean): () => boolean;
    /**
     * Creates a new topic.
     *
     * @param name - The name of the topic.
     * @param typeInfo - The type information of the topic.
     * @param defaultValue - The default value of the topic.
     * @returns The topic.
     */
    createTopic<T extends NetworkTablesTypes>(name: string, typeInfo: NetworkTablesTypeInfo, defaultValue?: T): NetworkTablesTopic<T>;
}
