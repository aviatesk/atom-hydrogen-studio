import * as Atom from "atom";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HydrogenStudioPaneView } from "../common";
import HydrogenStudioInspectorPaneComponent from "../components/inspector-pane-component";
import { inspectorPaneController } from "../controllers/inspector-pane-controller";
import { inspectorStore } from "../stores/inspector-store";

export class HydrogenStudioInspectorView extends HydrogenStudioPaneView {
  public static readonly URI = "atom://hydrogen-studio/inspector-pane-view";

  constructor() {
    super();

    // Add view opener
    this.subscriptions.add(
      atom.workspace.addOpener(uri => {
        if (uri === HydrogenStudioInspectorView.URI) {
          return this;
        }
        return;
      })
    );

    this.subscriptions.add(
      new Atom.Disposable(() => {
        inspectorPaneController.disposeView();
      })
    );

    ReactDOM.render(<HydrogenStudioInspectorPaneComponent inspectorStore={inspectorStore} />, this.element);
  }

  public getDefaultLocation() {
    return atom.config.get("Hydrogen-Studio.inspectorPaneDefaultLocation");
  }

  public getTitle() {
    return "Hydrogen Inspector Area";
  }

  public getURI() {
    return HydrogenStudioInspectorView.URI;
  }

  public serialize() {
    return {
      deserializer: "HydrogenStudioInspectorView",
    };
  }
}
