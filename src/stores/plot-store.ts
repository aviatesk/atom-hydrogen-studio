import * as Atom from "atom";
import { action, observable } from "mobx";
import { Outputs } from "../typings/hydrogen";

/**
 * Keeps kernel `displayName` & plot outputs which can be rendered via `@nteract/display-area/Display`
 */
export interface HydrogenStudioPlotData {
  displayName: string;
  executionCount: number;
  outputs: Outputs;
}

/**
 * Stores plots data and an active plot
 *
 * @note: The exported method that would be used in TSX files should be written in allow function syntax,
 *        becuase this automatically binds the method to this class object globally.
 */
export class HydrogenStudioPlotStore {
  public subscriptions: Atom.CompositeDisposable;
  @observable
  public activePlot: number;
  @observable
  public plotsData: HydrogenStudioPlotData[];

  constructor() {
    this.plotsData = [];
    this.activePlot = -1;

    // Add disposer
    this.subscriptions = new Atom.CompositeDisposable();
    this.subscriptions.add(
      new Atom.Disposable(() => {
        this.plotsData = [];
        this.activePlot = 0;
      })
    );
  }

  public getActivePlotData(): null | HydrogenStudioPlotData {
    if (this.activePlot === -1 || this.plotsData.length === 0) {
      return null;
    }
    return this.plotsData[this.activePlot];
  }

  @action
  public appendPlotData(plotData: HydrogenStudioPlotData) {
    this.plotsData.push(plotData);
    this.activePlot = this.plotsData.length - 1;
  }

  public hasPlot = () => {
    return this.plotsData.length !== 0;
  };

  public hasNextPlot = () => {
    return this.activePlot < this.plotsData.length - 1;
  };

  public hasPreviousPlot = () => {
    return this.activePlot > 0;
  };

  @action
  public showPlot = (plotIndex: number) => {
    if (0 <= plotIndex && plotIndex < this.plotsData.length) {
      this.activePlot = plotIndex;
    } else {
      atom.notifications.addInfo("Hydrogen-Studio", {
        description: `Invalid plot number given: ${plotIndex}`,
      });
    }
  };

  @action
  public showFirstPlot = () => {
    if (this.hasPlot()) {
      this.activePlot = 0;
    }
  };

  @action
  public showPreviousPlot = () => {
    if (this.hasPreviousPlot()) {
      this.activePlot -= 1;
    }
  };

  @action
  public showNextPlot = () => {
    if (this.hasNextPlot()) {
      this.activePlot += 1;
    }
  };

  @action
  public showLastPlot = () => {
    if (this.hasPlot()) {
      this.activePlot = this.plotsData.length - 1;
    }
  };

  @action
  public clearAllPlots = () => {
    this.activePlot = -1;
    this.plotsData = [];
  };

  @action
  public clearCurrentPlot = () => {
    this.plotsData.splice(this.activePlot, 1);
    this.activePlot -= this.activePlot === 0 && this.plotsData.length > 0 ? 0 : 1; // Will be -1 if no more plot
  };
}

export const plotStore = new HydrogenStudioPlotStore();

// For debuggings
if (atom.inDevMode() || atom.inSpecMode()) {
  (window as any).hydrogenStudioPlotStore = plotStore;
}
