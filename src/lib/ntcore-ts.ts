import { PubSubClient } from './pubsub/pubsub';
import { Topic } from './pubsub/topic';
import { Util } from './util/util';

import type { NetworkTableTypeInfo, NetworkTableTypes } from './types/types';

/** Properties for creating the NetworkTables class. */
interface NT_PROPS {
    /** The team number of the robot (overrides FQDN). */
    team?: number;
    /** The FQDN of the robot (not used if team is specified). */
    fqdn?: string;
    /** The port to connect to the robot on. */
    port: number;
}

/** NetworkTables class for interacting with NetworkTables over a WebSocket connection. */
export class NetworkTables {
    /** The FQDN of the server. */
    private fqdn: string;

    private port: number;

    /** The PubSubClient instance used to establish and manage the connection to the robot. */
    private _client: PubSubClient;

    /** The instance of the NetworkTables class. */
    private static instance: NetworkTables;

    /**
     * Gets the PubSubClient instance used to establish and manage the connection to the robot.
     *
     * @returns The PubSubClient instance.
     */
    get client() {
        return this._client;
    }

    /**
     * Creates a new NetworkTables instance.
     *
     * @param props - The properties to use to create the instance.
     * @throws Error if the team number or FQDN is not provided.
     */
    private constructor(props: NT_PROPS) {
        if (props.team) {
            this.fqdn = `roborio-frc-${props.team}.local`;
        } else if (props.fqdn) {
            this.fqdn = props.fqdn;
        } else {
            throw new Error('Must provide either a team number or FQDN.');
        }

        this.port = props.port;

        this._client = PubSubClient.getInstance(this.getServerUrl());
    }

    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param team - The team number of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the team number is not provided.
     */
    static createInstanceByTeam(team: number, port = 5810) {
        if (!this.instance) {
            this.instance = new NetworkTables({ team, port });
        }
        return this.instance;
    }

    /**
     * Creates a new NetworkTables instance if it does not exist.
     *
     * @param fqdn - The FQDN of the robot.
     * @param port - The port to connect to the robot on. Defaults to 5810.
     * @returns The NetworkTables instance.
     * @throws Error if the FQDN is not provided.
     */
    static createInstanceByFQDN(fqdn: string, port = 5810) {
        if (!this.instance) {
            this.instance = new NetworkTables({ fqdn, port });
        }
        return this.instance;
    }

    /**
     * Gets the NetworkTables instance if it has been created.
     *
     * @returns The NetworkTables instance.
     * @throws Error if the instance has not been created yet.
     */
    static getInstance() {
        if (this.instance) return this.instance;

        throw new Error('NetworkTables instance has not been created yet.');
    }

    /**
     * Returns the URL of the server to connect to.
     *
     * @returns The server URL.
     */
    getServerUrl(): string {
        return Util.createServerUrl(this.fqdn, this.port);
    }

    /**
     * Returns the FQDN of the server.
     *
     * @returns The robot address.
     */
    getFQDN(): string {
        return this.fqdn;
    }

    changeFQDN(fqdn: string, port = 5810) {
        this.fqdn = fqdn;
        this._client.reinstantiate(Util.createServerUrl(fqdn, port));
    }

    /**
     * Returns the port to connect to the robot on.
     *
     * @returns The port number.
     */
    getPort() {
        return this.port;
    }

    /**
     * Returns whether the robot is currently connected.
     *
     * @returns Whether the robot is connected.
     */
    isRobotConnected() {
        return this._client.messenger.socket.isConnected();
    }

    /**
     * Returns whether the robot is currently connecting.
     *
     * @returns Whether the robot is connecting.
     */
    isRobotConnecting() {
        return this._client.messenger.socket.isConnecting();
    }

    /**
     * Adds a listener for robot connection status updates.
     *
     * @param callback - The callback to call when the connection status changes.
     * @param immediateNotify - Whether to immediately notify the callback of the current connection status.
     * @returns A function to remove the listener.
     */
    addRobotConnectionListener(callback: (_: boolean) => void, immediateNotify?: boolean) {
        return this._client.messenger.socket.addConnectionListener(callback, immediateNotify);
    }

    /**
     * Creates a new topic.
     *
     * @param name - The name of the topic.
     * @param typeInfo - The type information of the topic.
     * @param defaultValue - The default value of the topic.
     * @returns The topic.
     */
    createTopic<T extends NetworkTableTypes>(name: string, typeInfo: NetworkTableTypeInfo, defaultValue?: T) {
        return new Topic<T>(this._client, name, typeInfo, defaultValue);
    }
}
