import PlotlyTransform from "@nteract/transform-plotly";
import { Vega2, Vega3, VegaLite1, VegaLite2 } from "@nteract/transform-vega";
import { registerTransform, standardDisplayOrder, standardTransforms } from "@nteract/transforms";
import * as Atom from "atom";
import * as ReactDOM from "react-dom";

interface Serialized {
  deserializer: string;
}

/**
 * General view class which implements basic default methods needed by Atom
 */
export abstract class HydrogenStudioView {
  public static readonly URI: string;

  protected element: HTMLElement;
  protected subscriptions: Atom.CompositeDisposable;

  constructor() {
    this.element = document.createElement("div");
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

/**
 * Checks whether a pane container where a item with a given URI lives is `Atom.Dock` or `Atom.WorkspaceCenter`.
 * Returns `false` if there is no pane container for a item with a given URI.
 */
export function isInDock(uri: string): boolean {
  const paneContainer = atom.workspace.paneContainerForURI(uri);
  if (paneContainer) {
    return (paneContainer as any).getLocation() !== "center";
  }
  return false;
}

// We can easily add other transforms here:
const additionalTransforms: any[] = [PlotlyTransform, VegaLite1, VegaLite2, Vega2, Vega3];

export const { transforms, displayOrder } = additionalTransforms.reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder,
});
