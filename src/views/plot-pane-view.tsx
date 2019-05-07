import * as Atom from "atom";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HydrogenStudioView } from "../common";
import HydrogenStudioPlotPaneComponent from "../components/plot-pane-component";
import { plotPaneController } from "../controllers/plot-pane-controller";
import { plotStore } from "../stores/plot-store";

export class HydrogenStudioPlotPaneView extends HydrogenStudioView {
  public static readonly URI = "atom://hydrogen-studio/plot-pane-view";

  constructor() {
    super();

    this.element.classList.add("hydrogen-studio");

    // Add view opener
    this.subscriptions.add(
      atom.workspace.addOpener(uri => {
        if (uri === HydrogenStudioPlotPaneView.URI) {
          return this;
        }
        return;
      })
    );

    // Add commands
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hydrogen-studio:clear-all-plots": () => {
          plotStore.clearAllPlots();
        },
        "hydrogen-studio:clear-current-plot": () => {
          plotStore.clearCurrentPlot();
        },
        "hydrogen-studio:show-previous-plot": () => {
          plotStore.showPreviousPlot();
        },
        "hydrogen-studio:show-next-plot": () => {
          plotStore.showNextPlot();
        },
      })
    );

    this.subscriptions.add(
      atom.commands.add(this.element, {
        "core:move-left": () => {
          plotStore.showPreviousPlot();
        },
        "core:move-right": () => {
          plotStore.showNextPlot();
        },
      })
    );

    this.subscriptions.add(
      new Atom.Disposable(() => {
        plotPaneController.disposePlotPaneView();
      })
    );

    ReactDOM.render(<HydrogenStudioPlotPaneComponent plotStore={plotStore} />, this.element);
  }

  public getDefaultLocation() {
    return atom.config.get("Hydrogen-Studio.plotPaneDefaultLocation");
  }

  public getTitle() {
    return "Hydrogen Plot Area";
  }

  public getURI() {
    return HydrogenStudioPlotPaneView.URI;
  }

  public serialize() {
    return {
      deserializer: "HydrogenStudioPlotPaneView",
    };
  }
}
