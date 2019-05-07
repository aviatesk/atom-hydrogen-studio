import { isInDock } from "../common";
import { HydrogenStudioPlotPaneView } from "../views/plot-pane-view";

export class HydrogenStudioPlotPaneController {
  private plotPaneView: null | HydrogenStudioPlotPaneView;

  constructor() {
    this.plotPaneView = null;
  }

  public openPlotPaneView() {
    if (!this.plotPaneView) {
      // When a previous plot pane has been destroyed
      this.plotPaneView = new HydrogenStudioPlotPaneView();
      atom.workspace.open(HydrogenStudioPlotPaneView.URI, {
        activatePane: false,
        split: atom.config.get("Hydrogen-Studio.plotPaneSplit"),
      });
    } else {
      // When a plot pane already exists
      atom.workspace.open(HydrogenStudioPlotPaneView.URI, {
        activatePane: false,
        searchAllPanes: true,
      });
    }

    // When this.plotPane lives in a dock, it's should be opened in addition to `atom.workspace.open`
    if (isInDock(HydrogenStudioPlotPaneView.URI)) {
      const paneContainer = atom.workspace.paneContainerForURI(HydrogenStudioPlotPaneView.URI);
      (paneContainer as any).show(); // `panePane` should be Atom.Dock
    }
  }

  public disposePlotPaneView() {
    this.plotPaneView = null;
  }

  public destory() {
    if (this.plotPaneView) {
      this.plotPaneView.destroy();
    }
  }

  public serialize() {
    if (this.plotPaneView) {
      return this.plotPaneView.serialize();
    }
    return;
  }

  public deserialize() {
    this.plotPaneView = new HydrogenStudioPlotPaneView();
    return this.plotPaneView;
  }
}

export const plotPaneController = new HydrogenStudioPlotPaneController();
