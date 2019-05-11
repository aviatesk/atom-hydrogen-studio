import { HydrogenStudioPaneController } from "../common";
import { HydrogenStudioPlotPaneView } from "../views/plot-pane-view";

class HydrogenStudioPlotPaneController extends HydrogenStudioPaneController {
  protected createView() {
    return new HydrogenStudioPlotPaneView();
  }

  protected getURI() {
    return HydrogenStudioPlotPaneView.URI;
  }
}

export const plotPaneController = new HydrogenStudioPlotPaneController();
