import { inspectorPaneController } from "../controllers/inspector-pane-controller";
import { inspectorStore } from "../stores/inspector-store";
import {
  Channel,
  HydrogenKernel,
  HydrogenKernelMiddleware,
  HydrogenKernelMiddlewareThunk,
  HydrogenResultsCallback,
  InspectorReplyMessage,
} from "../typings/hydrogen";

export default class HydrogenStudioInspectorKernelMiddleware implements HydrogenKernelMiddleware {
  /**
   * Hydrogen representation of Jupyter kernel
   */
  private kernel: HydrogenKernel;

  constructor(kernel: HydrogenKernel) {
    this.kernel = kernel;
    inspectorStore.addKernel(kernel);
  }

  public inspect(
    next: HydrogenKernelMiddlewareThunk,
    code: string,
    cursorPos: number,
    onResults: HydrogenResultsCallback
  ) {
    next.inspect(code, cursorPos, (message: InspectorReplyMessage, channel: Channel) => {
      const found = message.content.found;
      const bundle = message.content.data;
      if (found && bundle) {
        // Set the obtained inspector result to inspector data store
        inspectorStore.setInspectorResult(this.kernel, bundle);
        // Always open up the inspector
        inspectorPaneController.openView();
      } else {
        // Call the original callback when inspector result not found
        onResults(message, channel);
      }
    });
  }
}
