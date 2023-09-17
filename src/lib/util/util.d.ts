import type { BinaryMessage, NetworkTablesTypeInfo, NetworkTablesTypes, TypeNum, TypeString } from '../types/types';
/**
 * Class for holding utility functions.
 */
export declare class Util {
    private static usedIds;
    /**
     * Get the DOM time in microseconds.
     *
     * @returns The current microseconds of the DOM.
     */
    static getMicros(): number;
    /**
     * Given a number, determine if it is a double
     *
     * @param x - A number.
     * @returns Whether it is a double.
     */
    static isDouble(x: number): boolean;
    /**
     * Given a value, find the NT type number.
     *
     * @param data - The value.
     * @returns The NT type number.
     */
    static getNetworkTablesTypeFromObject(data: NetworkTablesTypes): NetworkTablesTypeInfo;
    static getNetworkTablesTypeFromTypeNum(typeNum: TypeNum): NetworkTablesTypeInfo;
    /**
     * Get the type info from a type string.
     *
     * @param typeString - The type string.
     * @returns The type info.
     */
    static getNetworkTablesTypeFromTypeString(typeString: TypeString): NetworkTablesTypeInfo;
    /**
     * Create a binary message from a topic.
     *
     * @param topicId - The topic ID.
     * @param timestamp - The timestamp of the message, matching the server.
     * @param data - The data.
     * @param typeInfo - The type info.
     * @returns The binary message.
     */
    static createBinaryMessage(topicId: number, timestamp: number, data: NetworkTablesTypes, typeInfo?: NetworkTablesTypeInfo): BinaryMessage;
    /**
     * Get a decently unique integer ID.
     *
     * It is not guaranteed to be unique, but it uses uuidv4 to generate an integer ID.
     *
     * @returns An ID.
     */
    static generateUid(): number;
    /**
     * Splits an ArrayBuffer into chunks of a specified size.
     *
     * @param buffer - The ArrayBuffer to split.
     * @param chunkSize - The size of each chunk, in bytes.
     * @returns An array of ArrayBuffer chunks.
     * @throws Error If the chunk size is not divisible by the ArrayBuffer size.
     */
    static splitArrayBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[];
    /**
     * Create a server URL for connecting to the robot.
     *
     * @param uri - The URI of the robot.
     * @param port - The port of NT server on the robot.
     * @returns The server URL with a unique client ID.
     */
    static createServerUrl(uri: string, port: number): string;
    /**
     * Get the mDNS address of a robot.
     *
     * @param team - The team number.
     * @returns The mDNS address of the robot.
     */
    static getRobotAddress(team: number): string;
}
