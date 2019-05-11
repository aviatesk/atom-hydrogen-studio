import * as Atom from "atom";
import { inspectorPaneController } from "./controllers/inspector-pane-controller";
import { plotPaneController } from "./controllers/plot-pane-controller";
import HydrogenStudioInspectorKernelMiddleware from "./middlewares/inspector-middleware";
import HydrogenStudioPlotKernelMiddleware from "./middlewares/plot-middleware";
import { inspectorStore } from "./stores/inspector-store";
import { Hydrogen, HydrogenKernel } from "./typings/hydrogen";

class HydrogenStudio {
  private subscriptions: Atom.CompositeDisposable;
  private hydrogen: null | Hydrogen;
  private kernelSet: Set<HydrogenKernel>;
  private plotMiddlewareSet: Set<HydrogenStudioPlotKernelMiddleware>;

  constructor() {
    this.subscriptions = new Atom.CompositeDisposable();
    this.hydrogen = null;
    this.kernelSet = new Set();
    this.plotMiddlewareSet = new Set();
  }

  public activate() {
    // Add commands
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hydrogen-studio:open-plot-pane": () => {
          plotPaneController.openView();
        },
        "hydrogen-studio:open-inspector-pane": () => {
          inspectorPaneController.openView();
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
        plotPaneController.destroy();
      })
    );
    this.subscriptions.add(
      new Atom.Disposable(() => {
        inspectorPaneController.destroy();
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
      const inspectorMiddleware = new HydrogenStudioInspectorKernelMiddleware(kernel);
      kernel.addMiddleware(plotMiddleware);
      kernel.addMiddleware(inspectorMiddleware);

      this.kernelSet.add(kernel);
      this.plotMiddlewareSet.add(plotMiddleware);

      kernel.onDidDestroy(() => {
        this.kernelSet.delete(kernel);
        this.plotMiddlewareSet.delete(plotMiddleware);
        inspectorStore.deleteKernel(kernel);
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
if (atom.inDevMode() || atom.inSpecMode()) {
  (window as any).hydrogenStudio = hydrogenStudio;
}
