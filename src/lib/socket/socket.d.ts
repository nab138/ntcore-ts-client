import WebSocket from "isomorphic-ws";
import type {
  AnnounceMessageParams,
  Message,
  UnannounceMessageParams,
  NetworkTablesTypes,
  NetworkTablesTypeInfo,
  BinaryMessageData,
} from "../types/types";
/** Socket for NetworkTables 4.0 */
export declare class NetworkTablesSocket {
  private static instances;
  private readonly connectionListeners;
  private lastHeartbeatDate;
  private offset;
  private bestRtt;
  private _websocket;
  get websocket(): WebSocket;
  set websocket(websocket: WebSocket);
  private serverUrl;
  private readonly onSocketOpen;
  private readonly onSocketClose;
  private readonly onTopicUpdate;
  private readonly onAnnounce;
  private readonly onUnannounce;
  private autoConnect;
  private messageQueue;
  /**
   * Creates a new NetworkTables socket.
   *
   * @param serverUrl - The URL of the server to connect to.
   * @param onSocketOpen - Called when the socket is opened.
   * @param onSocketClose - Called when the socket is closed.
   * @param onTopicUpdate - Called when a topic is updated.
   * @param onAnnounce - Called when a topic is announced.
   * @param onUnannounce - Called when a topic is unannounced.
   * @param autoConnect - Whether to automatically connect to the server.
   */
  private constructor();
  /**
   * Gets the instance of the NetworkTables socket.
   *
   * @param serverUrl - The URL of the server to connect to.
   * @param onSocketOpen - Called when the socket is opened.
   * @param onSocketClose - Called when the socket is closed.
   * @param onTopicUpdate - Called when a topic is updated.
   * @param onAnnounce - Called when a topic is announced.
   * @param onUnannounce - Called when a topic is unannounced.
   * @param autoConnect - Whether to automatically connect to the server.
   * @returns The instance of the NetworkTables socket.
   */
  static getInstance(
    serverUrl: string,
    onSocketOpen: () => void,
    onSocketClose: () => void,
    onTopicUpdate: (_: BinaryMessageData) => void,
    onAnnounce: (_: AnnounceMessageParams) => void,
    onUnannounce: (_: UnannounceMessageParams) => void,
    autoConnect?: boolean
  ): NetworkTablesSocket;
  /**
   * Initialization. This is done outside of the constructor to allow for
   * the socket to refresh itself.
   */
  private init;
  /**
   * Reset the socket and reconnect to the server.
   *
   * @param serverUrl - The URL of the server to connect to.
   */
  reinstantiate(serverUrl: string): void;
  /**
   * Returns whether the socket is connected.
   *
   * @returns Whether the socket is connected.
   */
  isConnected(): boolean;
  /**
   * Returns whether the socket is connecting.
   *
   * @returns Whether the socket is connecting.
   */
  isConnecting(): boolean;
  /**
   * Returns whether the socket is closing.
   *
   * @returns Whether the socket is closing.
   */
  isClosing(): boolean;
  /**
   * Returns whether the socket is closed.
   *
   * @returns Whether the socket is closed.
   */
  isClosed(): boolean;
  /**
   * Create a connection listener.
   *
   * @param callback - Called when the connection state changes.
   * @param immediateNotify - Whether to immediately notify the callback of the current connection state.
   * @returns A function that removes the listener.
   */
  addConnectionListener(
    callback: (_: boolean) => void,
    immediateNotify?: boolean
  ): () => boolean;
  /**
   * Updates all connection listeners with the current connection state.
   */
  private updateConnectionListeners;
  /**
   * Stops auto-reconnecting to the server.
   */
  stopAutoConnect(): void;
  /**
   * Starts auto-reconnecting to the server.
   */
  startAutoConnect(): void;
  /**
   * Handle a message from the websocket.
   *
   * @param event - The message event.
   */
  private onMessage;
  /**
   * Handle an error from the websocket.
   *
   * @param event - The error event.
   */
  private onError;
  /**
   * Handle a binary frame from the websocket.
   *
   * @param frame - The frame.
   */
  private handleBinaryFrame;
  /**
   * Handle a text frame from the websocket.
   *
   * @param frame - The frame.
   */
  private handleTextFrame;
  /**
   * Handle an announce message from the server.
   *
   * @param params - The message params.
   */
  private handleAnnounceParams;
  /**
   * Handle an unannounce message from the server.
   *
   * @param params - The message params.
   */
  private handleUnannounceParams;
  /**
   * Handle a properties message from the server.
   *
   * @param params - The message params.
   */
  private handlePropertiesParams;
  /**
   * Send a text frame to the server.
   *
   * @param message - The message to send.
   */
  sendTextFrame(message: Message): void;
  /**
   * Send a binary frame to the server.
   *
   * @param message - The message to send.
   */
  private sendBinaryFrame;
  /**
   * Function to send queued messages whenever the WebSocket connection is opened
   */
  private sendQueuedMessages;
  /**
   * Send a message to a topic.
   *
   * @param id - The topic ID.
   * @param value - The value to send.
   * @param typeInfo - The type info for the value.
   * @returns The time the message was sent.
   */
  sendValueToTopic(
    id: number,
    value: NetworkTablesTypes,
    typeInfo?: NetworkTablesTypeInfo
  ): number;
  /**
   * Send a heartbeat message to the server.
   */
  private heartbeat;
  /**
   * Handle a round trip time message from the server.
   *
   * This is used to calculate the offset between the client and server time
   * in order to estimate the current server time for binary messages.
   *
   * @param serverTime - The server time.
   */
  private handleRTT;
  /**
   * Get the current server time.
   *
   * @returns The current server time.
   */
  getServerTime(): number;
  /**
   * Calculate the time delta between the current time and a given time.
   *
   * @param sentDate - The time to calculate the delta from.
   * @returns The time delta.
   */
  private calcTimeDelta;
  /**
   * Close the websocket connection.
   */
  close(): void;
}
export default NetworkTablesSocket;
