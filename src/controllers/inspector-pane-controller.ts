import { HydrogenStudioPaneController } from "../common";
import { HydrogenStudioInspectorView } from "../views/inspector-pane-view";

export class HydrogenStudioInspectorController extends HydrogenStudioPaneController {
  protected createView() {
    return new HydrogenStudioInspectorView();
  }

  protected getURI() {
    return HydrogenStudioInspectorView.URI;
  }
}

export const inspectorPaneController = new HydrogenStudioInspectorController();
