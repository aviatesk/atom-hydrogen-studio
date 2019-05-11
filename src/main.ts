import { inspectorPaneController } from "./controllers/inspector-pane-controller";
import { plotPaneController } from "./controllers/plot-pane-controller";
import { hydrogenStudio } from "./hydrogen-studio";
import { Hydrogen } from "./typings/hydrogen";

export function activate() {
  hydrogenStudio.activate();
}

export function deactivate() {
  hydrogenStudio.deactivate();
}

export function consumeHydrogen(hydrogen: Hydrogen) {
  hydrogenStudio.consumeHydrogen(hydrogen);
}

export function serialize() {
  return {
    plotPaneView: plotPaneController.serialize(),
    inspectorPaneView: inspectorPaneController.serialize(),
  };
}

export function deserializeHydrogenStudioPlotPaneView(_deserialized: {}) {
  return plotPaneController.deserialize();
}

export function deserializeHydrogenStudioInspectorView(_deserialized: {}) {
  return inspectorPaneController.deserialize();
}
