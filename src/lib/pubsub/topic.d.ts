import type { PubSubClient } from './pubsub';
import type { NetworkTablesTypeInfo, NetworkTablesTypes, SubscribeOptions, TopicProperties } from '../types/types';
export declare class NetworkTablesTopic<T extends NetworkTablesTypes> {
    private client;
    private _id?;
    private readonly _name;
    private readonly _typeInfo;
    private value;
    private _lastChangedTime?;
    private _announced;
    private _publisher;
    private _pubuid?;
    private _subscribers;
    /**
     * Gets the ID of the topic.
     *
     * @returns The ID of the topic.
     */
    get id(): number | undefined;
    /**
     * Gets the name of the topic.
     *
     * @returns The name of the topic.
     */
    get name(): string;
    /**
     * Gets the type info for the topic.
     *
     * @returns The type info for the topic.
     */
    get typeInfo(): NetworkTablesTypeInfo;
    /**
     * Gets the server time of the last value change.
     *
     * @returns The server time of the last value change.
     */
    get lastChangedTime(): number | undefined;
    /**
     * Whether the topic has been announced.
     *
     * @returns Whether the topic has been announced.
     */
    get announced(): boolean;
    /**
     * Gets whether the client is the publisher of the topic.
     *
     * @returns Whether the client is the publisher of the topic.
     */
    get publisher(): boolean;
    /**
     * Gets the UID of the publisher.
     *
     * @returns The UID of the publisher, or undefined if the client is not the publisher.
     */
    get pubuid(): number | undefined;
    /**
     * Gets the subscribers to the topic.
     *
     * @returns The subscribers to the topic.
     */
    get subscribers(): Map<number, {
        callback: (_: T | null) => void;
        immediateNotify: boolean;
        options: {
            periodic?: number | undefined;
            all?: boolean | undefined;
            topicsonly?: boolean | undefined;
            prefix?: boolean | undefined;
        };
    }>;
    /**
     * Creates a new topic. This should only be done after the
     * base NTCore client has been initialized.
     *
     * @param client - The client that owns the topic.
     * @param name - The name of the topic.
     * @param typeInfo - The type info for the topic.
     * @param defaultValue - The default value for the topic.
     */
    constructor(client: PubSubClient, name: string, typeInfo: NetworkTablesTypeInfo, defaultValue?: T);
    /**
     * Sets the value of the topic.
     * The client must be the publisher of the topic to set the value.
     *
     * @param value - The value to set.
     */
    setValue(value: T): void;
    getValue(): T | null;
    /**
     * Updates the value of the topic.
     * This should only be called by the PubSubClient.
     *
     * @param value - The value to update.
     * @param lastChangedTime - The server time of the last value change.
     */
    updateValue(value: T, lastChangedTime: number): void;
    /** */
    /** */
    /**
     * Marks the topic as announced. This should only be called by the PubSubClient.
     *
     * @param id - The ID of the topic.
     */
    announce(id: number): void;
    /** Marks the topic as unannounced. This should only be called by the PubSubClient. */
    unannounce(): void;
    /** */
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
    subscribe(callback: (_: T | null) => void, immediateNotify?: boolean, options?: SubscribeOptions, id?: number, save?: boolean): number;
    /**
     * Removes a subscriber
     *
     * @param subuid - The UID of the subscriber.
     * @param removeCallback - Whether to remove the callback. Leave this as true unless you know what you're doing.
     */
    unsubscribe(subuid: number, removeCallback?: boolean): void;
    /**
     * Removes all local subscribers.
     */
    unsubscribeAll(): void;
    /**
     * Resubscribes all local subscribers.
     *
     * @param client - The client to resubscribe with.
     */
    resubscribeAll(client: PubSubClient): void;
    /**
     * Notifies all subscribers of the current value.
     */
    private notifySubscribers;
    /** */
    /** */
    /**
     * Publishes the topic.
     *
     * @param properties - The properties to publish the topic with.
     * @param id - The UID of the publisher.
     */
    publish(properties?: TopicProperties, id?: number): void;
    /**
     * Unpublishes the topic.
     */
    unpublish(): void;
    /**
     * Republishes the topic.
     *
     * @param client - The client to republish with.
     */
    republish(client: PubSubClient): void;
    /**
     * Sets the properties of the topic.
     *
     * @param persistent - If true, the last set value will be periodically saved to persistent storage on the server and be restored during server startup. Topics with this property set to true will not be deleted by the server when the last publisher stops publishing.
     * @param retained - Topics with this property set to true will not be deleted by the server when the last publisher stops publishing.
     */
    setProperties(persistent?: boolean, retained?: boolean): void;
}
