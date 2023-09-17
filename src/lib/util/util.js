"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
var uuid_1 = require("uuid");
var types_1 = require("../types/types");
/**
 * Class for holding utility functions.
 */
var Util = /** @class */ (function () {
    function Util() {
    }
    /**
     * Get the DOM time in microseconds.
     *
     * @returns The current microseconds of the DOM.
     */
    Util.getMicros = function () {
        return performance.now() * 1000;
    };
    /**
     * Given a number, determine if it is a double
     *
     * @param x - A number.
     * @returns Whether it is a double.
     */
    Util.isDouble = function (x) {
        if (typeof x === 'number' && Number.isFinite(x) && !Number.isInteger(x)) {
            return true;
        }
        return false;
    };
    /**
     * Given a value, find the NT type number.
     *
     * @param data - The value.
     * @returns The NT type number.
     */
    Util.getNetworkTablesTypeFromObject = function (data) {
        var _this = this;
        if (typeof data === 'boolean') {
            return types_1.NetworkTablesTypeInfos.kBoolean;
        }
        else if (typeof data === 'number') {
            if (this.isDouble(data)) {
                return types_1.NetworkTablesTypeInfos.kDouble;
            }
            return types_1.NetworkTablesTypeInfos.kInteger;
        }
        else if (typeof data === 'string') {
            return types_1.NetworkTablesTypeInfos.kString;
        }
        else if (data instanceof ArrayBuffer) {
            return types_1.NetworkTablesTypeInfos.kArrayBuffer;
        }
        else if (Array.isArray(data)) {
            if (new Set(data.map(function (x) { return typeof x; })).size <= 1) {
                if (typeof data[0] === 'boolean') {
                    return types_1.NetworkTablesTypeInfos.kBooleanArray;
                }
                else if (typeof data[0] === 'number') {
                    if (data.every(function (e) { return _this.isDouble(e); })) {
                        return types_1.NetworkTablesTypeInfos.kDoubleArray;
                    }
                    return types_1.NetworkTablesTypeInfos.kIntegerArray;
                }
                else if (typeof data[0] === 'string') {
                    return types_1.NetworkTablesTypeInfos.kStringArray;
                }
            }
        }
        throw new Error("Invalid data for NT: ".concat(data));
    };
    Util.getNetworkTablesTypeFromTypeNum = function (typeNum) {
        switch (typeNum) {
            case types_1.NetworkTablesTypeInfos.kBoolean[0]:
                return types_1.NetworkTablesTypeInfos.kBoolean;
            case types_1.NetworkTablesTypeInfos.kDouble[0]:
                return types_1.NetworkTablesTypeInfos.kDouble;
            case types_1.NetworkTablesTypeInfos.kInteger[0]:
                return types_1.NetworkTablesTypeInfos.kInteger;
            case types_1.NetworkTablesTypeInfos.kString[0]:
                return types_1.NetworkTablesTypeInfos.kString;
            case types_1.NetworkTablesTypeInfos.kArrayBuffer[0]:
                return types_1.NetworkTablesTypeInfos.kArrayBuffer;
            case types_1.NetworkTablesTypeInfos.kBooleanArray[0]:
                return types_1.NetworkTablesTypeInfos.kBooleanArray;
            case types_1.NetworkTablesTypeInfos.kDoubleArray[0]:
                return types_1.NetworkTablesTypeInfos.kDoubleArray;
            case types_1.NetworkTablesTypeInfos.kIntegerArray[0]:
                return types_1.NetworkTablesTypeInfos.kIntegerArray;
            case types_1.NetworkTablesTypeInfos.kStringArray[0]:
                return types_1.NetworkTablesTypeInfos.kStringArray;
            default:
                throw new Error("Invalid type number: ".concat(typeNum));
        }
    };
    /**
     * Get the type info from a type string.
     *
     * @param typeString - The type string.
     * @returns The type info.
     */
    Util.getNetworkTablesTypeFromTypeString = function (typeString) {
        switch (typeString) {
            case types_1.NetworkTablesTypeInfos.kBoolean[1]:
                return types_1.NetworkTablesTypeInfos.kBoolean;
            case types_1.NetworkTablesTypeInfos.kDouble[1]:
                return types_1.NetworkTablesTypeInfos.kDouble;
            case types_1.NetworkTablesTypeInfos.kInteger[1]:
                return types_1.NetworkTablesTypeInfos.kInteger;
            case types_1.NetworkTablesTypeInfos.kString[1]:
                return types_1.NetworkTablesTypeInfos.kString;
            case types_1.NetworkTablesTypeInfos.kArrayBuffer[1]:
                return types_1.NetworkTablesTypeInfos.kArrayBuffer;
            case types_1.NetworkTablesTypeInfos.kBooleanArray[1]:
                return types_1.NetworkTablesTypeInfos.kBooleanArray;
            case types_1.NetworkTablesTypeInfos.kDoubleArray[1]:
                return types_1.NetworkTablesTypeInfos.kDoubleArray;
            case types_1.NetworkTablesTypeInfos.kIntegerArray[1]:
                return types_1.NetworkTablesTypeInfos.kIntegerArray;
            case types_1.NetworkTablesTypeInfos.kStringArray[1]:
                return types_1.NetworkTablesTypeInfos.kStringArray;
            default:
                throw new Error("Unsupported type string: ".concat(typeString));
        }
    };
    /**
     * Create a binary message from a topic.
     *
     * @param topicId - The topic ID.
     * @param timestamp - The timestamp of the message, matching the server.
     * @param data - The data.
     * @param typeInfo - The type info.
     * @returns The binary message.
     */
    Util.createBinaryMessage = function (topicId, timestamp, data, typeInfo) {
        var type = typeInfo !== null && typeInfo !== void 0 ? typeInfo : this.getNetworkTablesTypeFromObject(data);
        return [topicId, timestamp, type[0], data];
    };
    /**
     * Get a decently unique integer ID.
     *
     * It is not guaranteed to be unique, but it uses uuidv4 to generate an integer ID.
     *
     * @returns An ID.
     */
    Util.generateUid = function () {
        var uuid = (0, uuid_1.v4)();
        var id = 0;
        for (var i = 0; i < uuid.length; i++) {
            id += uuid.charCodeAt(i);
        }
        var uid = id + Date.now();
        // Just in case
        if (Util.usedIds.has(uid)) {
            return this.generateUid();
        }
        Util.usedIds.add(uid);
        return uid;
    };
    /**
     * Splits an ArrayBuffer into chunks of a specified size.
     *
     * @param buffer - The ArrayBuffer to split.
     * @param chunkSize - The size of each chunk, in bytes.
     * @returns An array of ArrayBuffer chunks.
     * @throws Error If the chunk size is not divisible by the ArrayBuffer size.
     */
    Util.splitArrayBuffer = function (buffer, chunkSize) {
        if (buffer.byteLength % chunkSize !== 0) {
            throw new Error('Chunk size must be divisible by ArrayBuffer size');
        }
        var chunks = [];
        var offset = 0;
        while (offset < buffer.byteLength) {
            var chunk = buffer.slice(offset, offset + chunkSize);
            chunks.push(chunk);
            offset += chunkSize;
        }
        return chunks;
    };
    /**
     * Create a server URL for connecting to the robot.
     *
     * @param uri - The URI of the robot.
     * @param port - The port of NT server on the robot.
     * @returns The server URL with a unique client ID.
     */
    Util.createServerUrl = function (uri, port) {
        return "ws://".concat(uri, ":").concat(port, "/nt/ntcore-ts-").concat(Util.generateUid());
    };
    /**
     * Get the mDNS address of a robot.
     *
     * @param team - The team number.
     * @returns The mDNS address of the robot.
     */
    Util.getRobotAddress = function (team) {
        return "roborio-".concat(team, "-frc.local");
    };
    Util.usedIds = new Set();
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=util.js.map