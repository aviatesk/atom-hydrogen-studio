import PlotlyTransform from "@nteract/transform-plotly";
import { GIFTransform, JPEGTransform, PNGTransform, SVGTransform } from "@nteract/transforms";
import { plotPaneController } from "../controllers/plot-pane-controller";
import { HydrogenStudioPlotData, plotStore } from "../stores/plot-store";
import {
  Channel,
  ExecuteMessage,
  HydrogenKernel,
  HydrogenKernelMiddleware,
  HydrogenKernelMiddlewareThunk,
  HydrogenResultsCallback,
  Outputs,
} from "../typings/hydrogen";
import { HydrogenStudioPlotPaneView } from "../views/plot-pane-view";

/**
 * MIMETYPEs that would be sent to Hydrogen-Studio's plot pane
 */
const PLOTMIMETYPES = [
  GIFTransform.MIMETYPE,
  JPEGTransform.MIMETYPE,
  PNGTransform.MIMETYPE,
  SVGTransform.MIMETYPE,
  PlotlyTransform.MIMETYPE,
];

export default class HydrogenStudioPlotKernelMiddleware implements HydrogenKernelMiddleware {
  /**
   * Hydrogen representation of Jupyter kernel
   */
  private kernel: HydrogenKernel;
  /**
   * Keeps track of current execution count
   */
  private currentExecutionCount: number;
  /**
   * If true, open plot pane on every execution
   */
  private openPlotPaneOnExecution: boolean;

  constructor(kernel: HydrogenKernel) {
    this.kernel = kernel;
    this.currentExecutionCount = 0;
    this.openPlotPaneOnExecution = atom.config.get("Hydrogen-Studio.openPlotPaneOnExecution");
  }

  public setOpenPlotPaneOnExecution(openPlotPaneOnExecution: boolean) {
    this.openPlotPaneOnExecution = openPlotPaneOnExecution;
  }

  public execute(next: HydrogenKernelMiddlewareThunk, code: string, onResults: HydrogenResultsCallback) {
    next.execute(code, (message: ExecuteMessage, channel: Channel) => {
      const { msg_type } = message.header;
      const { data } = message.content;
      let sentToPlotPane = false;

      // Updates `this.currentExecutionCount`
      if (msg_type === "execute_input") {
        this.currentExecutionCount = message.content.execution_count;
      }

      // Fire when a plot result comes
      if ((msg_type === "execute_result" || msg_type === "display_data") && data) {
        // Check whether the execution result is an image
        PLOTMIMETYPES.forEach(PLOT_MEDIA_TYPE => {
          if (data.hasOwnProperty(PLOT_MEDIA_TYPE)) {
            // Create output data which would be rendered by @nteract/display-are/`Display`
            const outputs: Outputs = [
              {
                ...message.content,
                output_type: msg_type,
              },
            ];

            // Append the plot data to plot data store
            const plotData: HydrogenStudioPlotData = {
              displayName: this.kernel.displayName.slice(0), // Should be immutable
              executionCount: this.currentExecutionCount,
              outputs: outputs,
            };
            plotStore.appendPlotData(plotData);

            // Don't sent message to Hydrogen when the image has been shown in a plot pane
            const pane = atom.workspace.paneForURI(HydrogenStudioPlotPaneView.URI);
            if (pane && (pane.getActiveItem() as any).getURI() === HydrogenStudioPlotPaneView.URI) {
              sentToPlotPane = true;
            } else {
              // Open plot pane
              if (this.openPlotPaneOnExecution) {
                plotPaneController.openView();
                sentToPlotPane = true;
              }
            }
          }
        });
      }

      if (!sentToPlotPane) {
        onResults(message, channel);
      }
    });
  }
}
