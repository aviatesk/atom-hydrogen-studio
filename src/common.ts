import PlotlyTransform from "@nteract/transform-plotly";
import { Vega2, Vega3, VegaLite1, VegaLite2 } from "@nteract/transform-vega";
import { registerTransform, standardDisplayOrder, standardTransforms } from "@nteract/transforms";
import * as Atom from "atom";
import * as ReactDOM from "react-dom";

/**
 * Checks whether a pane container where a item with a given URI lives is `Atom.Dock` or `Atom.WorkspaceCenter`.
 * Returns `false` if there is no pane container for a item with a given URI.
 */
function isInDock(uri: string): boolean {
  const paneContainer = atom.workspace.paneContainerForURI(uri);
  if (paneContainer) {
    return (paneContainer as any).getLocation() !== "center";
  }
  return false;
}

/**
 * General view controller class
 */
export abstract class HydrogenStudioPaneController {
  protected view: null | HydrogenStudioPaneView;

  constructor() {
    this.view = null;
  }

  public openView() {
    if (!this.view) {
      // When a previous view has been destroyed
      this.view = this.createView();
      atom.workspace.open(this.getURI(), {
        activatePane: false,
        split: atom.config.get("Hydrogen-Studio.newPaneSplit"),
      });
    } else {
      // When a plot pane already exists
      atom.workspace.open(this.getURI(), {
        activatePane: false,
        searchAllPanes: true,
      });
    }

    // When this.view lives in a dock, it's should be opened in addition to `atom.workspace.open`
    if (isInDock(this.getURI())) {
      const paneContainer = atom.workspace.paneContainerForURI(this.getURI());
      (paneContainer as any).show(); // `panePane` should be Atom.Dock
    }
  }

  public disposeView() {
    this.view = null;
  }

  public destroy() {
    if (this.view) {
      this.view.destroy();
    }
  }

  public serialize() {
    if (this.view) {
      return this.view.serialize();
    }
    return;
  }

  public deserialize() {
    this.view = this.createView();
    return this.view;
  }

  /**
   * Returns an new object of the view, which would be controlled by this controller
   */
  protected abstract createView(): HydrogenStudioPaneView;

  /**
   * Returns an URI string, which is unique to the view, which would be controlled by this controller
   */
  protected abstract getURI(): string;
}

interface Serialized {
  deserializer: string;
}

/**
 * General view class
 */
export abstract class HydrogenStudioPaneView {
  public static readonly URI: string;

  protected element: HTMLElement;
  protected subscriptions: Atom.CompositeDisposable;

  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("hydrogen-studio");

    this.subscriptions = new Atom.CompositeDisposable();

    // Add disposer
    this.subscriptions.add(
      new Atom.Disposable(() => {
        ReactDOM.unmountComponentAtNode(this.element);
        this.element.remove();

        atom.workspace.getPanes().forEach(pane => {
          const item = pane.itemForURI(this.getURI());
          if (item) {
            pane.destroyItem(item);
          }
        });
      })
    );
  }

  public abstract getDefaultLocation(): string;

  public abstract getTitle(): string;

  public abstract getURI(): string;

  public abstract serialize(): Serialized;

  public getAllowedLocations(): string[] {
    return ["center", "left", "bottom", "right"];
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    this.subscriptions.dispose();
  }
}

// We can easily add other transforms here:
const additionalTransforms: any[] = [PlotlyTransform, VegaLite1, VegaLite2, Vega2, Vega3];

export const { transforms, displayOrder } = additionalTransforms.reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder,
});
