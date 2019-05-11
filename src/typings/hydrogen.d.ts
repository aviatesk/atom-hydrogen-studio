import * as Atom from "atom";

declare type MessageType =
  | "clear_output"
  | "comm_info_request"
  | "complete_request"
  | "display_data"
  | "error"
  | "execute_input"
  | "execute_request"
  | "execute_result"
  | "history_request"
  | "input_reply"
  | "input_request"
  | "inspect_request"
  | "inspect_reply"
  | "is_complete_request"
  | "kernel_info_request"
  | "shutdown_request"
  | "status"
  | "stream"
  | "update_display_data";

declare interface JupyterMessageHeader<MessageType> {
  msg_id: string;
  username: string;
  date: string; // ISO 8601 timestamp
  msg_type: MessageType; // this could be an enum
  version: string; // this could be an enum
}

declare interface JupyterMessage<MessageType, Content> {
  header: JupyterMessageHeader<MessageType>;
  parent_header: JupyterMessageHeader<any> | {};
  metadata: object;
  content: Content;
  buffers?: any[];
}

// declare type ExecuteMessageContent = {
//   code: string;
//   silent: boolean;
//   store_history: boolean;
//   user_expressions: object;
//   allow_stdin: boolean;
//   stop_on_error: boolean;
// };

declare type ExecuteMessageContent = {
  code?: string;
  data?: { [key: string]: object };
  execution_count: number;
};

declare type ExecuteMessage = JupyterMessage<MessageType, ExecuteMessageContent>;

declare type OutputType = "display_data" | "execute_result";

declare interface Output extends ExecuteMessageContent {
  output_type: OutputType;
}

declare type Outputs = Output[];

declare type Bundle = { [key: string]: string };

declare type InspectorReplyContent = {
  data?: Bundle;
  found: boolean;
};

declare type InspectorReplyMessage = JupyterMessage<"inspect_reply", InspectorReplyContent>;

declare type Channel = "shell" | "iopub" | "stdin";

declare type HydrogenResultsCallback = (message: any, channel: Channel) => void;

/**
 * Like HydrogenKernelMiddleware, but doesn't require passing a `next` argument.
 * Hydrogen is responsible for creating these and ensuring that they delegate to
 * the next middleware in the chain (or to the kernel, if there is no more
 * middleware to call)
 */
declare interface HydrogenKernelMiddlewareThunk {
  readonly interrupt: () => void;
  readonly shutdown: () => void;
  readonly restart: (onRestarted: (...args: any[]) => any | null) => void;
  readonly execute: (code: string, onResults: HydrogenResultsCallback) => void;
  readonly complete: (code: string, onResults: HydrogenResultsCallback) => void;
  readonly inspect: (code: string, cursorPos: number, onResults: HydrogenResultsCallback) => void;
}

declare interface HydrogenKernelMiddleware {
  readonly interrupt?: (next: HydrogenKernelMiddlewareThunk) => void;
  readonly shutdown?: (next: HydrogenKernelMiddlewareThunk) => void;
  readonly restart?: (next: HydrogenKernelMiddlewareThunk, onRestarted: (...args: any[]) => any | null) => void;
  readonly execute?: (next: HydrogenKernelMiddlewareThunk, code: string, onResults: HydrogenResultsCallback) => void;
  readonly complete?: (next: HydrogenKernelMiddlewareThunk, code: string, onResults: HydrogenResultsCallback) => void;
  readonly inspect?: (
    next: HydrogenKernelMiddlewareThunk,
    code: string,
    cursorPos: number,
    onResults: HydrogenResultsCallback
  ) => void;
}

/**
 * The Plugin API allows you to make Hydrogen awesome.
 * You will be able to interact with this class in your Hydrogen Plugin using
 * Atom's [Service API](http://blog.atom.io/2015/03/25/new-services-API.html).
 *
 * Take a look at our [Example Plugin](https://github.com/lgeiger/hydrogen-example-plugin)
 * and the [Atom Flight Manual](http://flight-manual.atom.io/hacking-atom/) for
 * learning how to interact with Hydrogen in your own plugin.
 *
 * @version 1.0.0
 */
declare interface Hydrogen {
  /**
   * Calls your callback when the kernel has changed.
   */
  onDidChangeKernel(callback: (kernel: HydrogenKernel | null) => void): void;

  /**
   * Get the `HydrogenKernel` of the currently active text editor.
   * `null` is returned if there is no active kernel for the active text editor.
   */
  getActiveKernel(): HydrogenKernel | null;

  /**
   * Get the `atom$Range` that will run if `hydrogen:run-cell` is called.
   * `null` is returned if no active text editor.
   */
  getCellRange(): Atom.Range;
}

/**
 * The `HydrogenKernel` class wraps Hydrogen's internal representation of kernels
 * and exposes a small set of methods that should be usable by plugins.
 */
declare interface HydrogenKernel {
  /**
   * The language of the kernel, as specified in its kernelspec
   */
  language: string;

  /**
   * The display name of the kernel, as specified in its kernelspec
   */
  displayName: string;

  /**
   * Add a kernel middleware, which allows intercepting and issuing commands to
   * the kernel.
   * If the methods of a `middleware` object are added/modified/deleted after
   * `addMiddleware` has been called, the changes will take effect immediately.
   */
  addMiddleware(middleware: HydrogenKernelMiddleware): void;

  /**
   * Calls your callback when the kernel has been destroyed.
   */
  onDidDestroy(callback: () => void): void;

  /**
   * Get path to the [connection file](http://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Connecting%20with%20the%20Qt%20Console.html) of the kernel.
   */
  getConnectionFile(): string | null;
}
