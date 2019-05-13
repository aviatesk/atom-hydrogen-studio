import * as Atom from "atom";
import { inspectorPaneController } from "./controllers/inspector-pane-controller";
import { plotPaneController } from "./controllers/plot-pane-controller";
import HydrogenStudioInspectorKernelMiddleware from "./middlewares/inspector-middleware";
import HydrogenStudioPlotKernelMiddleware from "./middlewares/plot-middleware";
import { inspectorStore } from "./stores/inspector-store";
import { plotStore } from "./stores/plot-store";
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
        plotStore.subscriptions.dispose();
        inspectorPaneController.destroy();
        inspectorStore.subscriptions.dispose();
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
    if (this.kernelSet.size > 0) {
      atom.notifications.addInfo("Hydrogen-Studio", {
        description: `You have ${this.kernelSet.size} running kernels, do you want to shutdown them all ?`,
        detail:
          "If you keep the kernels running, they will continue to try to connect Hydrogen-Studio and it may cause " +
          "some problem.",
        dismissable: true,
        buttons: [
          {
            text: "Shutdown",
            onDidClick: () => {
              this.kernelSet.forEach(kernel => {
                /**
                 * @note: `destroy` is not provided, so this may cause some error when Hydrogen gets updated
                 */
                (kernel as any).destroy();
              });
            },
          },
          {
            text: "Not shutdown",
            onDidClick: () => {
              return;
            },
          },
        ],
      });
    }
    this.subscriptions.dispose();
  }
}

export const hydrogenStudio = new HydrogenStudio();

// For debugging
if (atom.inDevMode() || atom.inSpecMode()) {
  (window as any).hydrogenStudio = hydrogenStudio;
}
