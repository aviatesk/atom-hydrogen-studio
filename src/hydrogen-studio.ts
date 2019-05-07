import * as Atom from "atom";
import { plotPaneController } from "./controllers/plot-pane-controller";
import HydrogenStudioPlotKernelMiddleware from "./middlewares/plot-middleware";
import { Hydrogen, HydrogenKernel } from "./typings/hydrogen";

class HydrogenStudio {
  private subscriptions: Atom.CompositeDisposable;
  private hydrogen: null | Hydrogen;
  private kernelSet: WeakSet<HydrogenKernel>;
  private plotMiddlewareSet: Set<HydrogenStudioPlotKernelMiddleware>;

  constructor() {
    this.subscriptions = new Atom.CompositeDisposable();
    this.hydrogen = null;
    this.kernelSet = new WeakSet();
    this.plotMiddlewareSet = new Set();
  }

  public activate() {
    // Add commands
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hydrogen-studio:open-plot-pane": () => {
          plotPaneController.openPlotPaneView();
        },
      })
    );

    // Add config listeners
    this.subscriptions.add(
      atom.config.onDidChange("Hydrogen-Studio.openPlotPaneOnExecution", ({ newValue }) => {
        this.plotMiddlewareSet.forEach(plotMiddleware => {
          plotMiddleware.setOpenPlotPaneOnExecution(newValue);
        });
      })
    );

    // Add Disposer
    this.subscriptions.add(
      new Atom.Disposable(() => {
        plotPaneController.destory();
      })
    );
  }

  public consumeHydrogen(hydrogen: Hydrogen) {
    this.hydrogen = hydrogen;

    this.hydrogen.onDidChangeKernel(kernel => {
      if (!kernel || this.kernelSet.has(kernel)) {
        return;
      }

      const plotMiddleware = new HydrogenStudioPlotKernelMiddleware(kernel);
      kernel.addMiddleware(plotMiddleware);

      this.kernelSet.add(kernel);
      this.plotMiddlewareSet.add(plotMiddleware);

      kernel.onDidDestroy(() => {
        this.kernelSet.delete(kernel);
        this.plotMiddlewareSet.delete(plotMiddleware);
      });
    });

    return new Atom.Disposable(() => {
      this.hydrogen = null;
    });
  }

  public deactivate() {
    this.subscriptions.dispose();
  }
}

export const hydrogenStudio = new HydrogenStudio();

// For debugging
(window as any).hydrogenStudio = hydrogenStudio;
