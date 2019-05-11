import { action, observable } from "mobx";
import { Bundle, HydrogenKernel } from "../typings/hydrogen.d";

/**
 * Stores inspector kernels and inspected data and an active inspector
 *
 * @note: The exported method that would be used in TSX files should be written in allow function syntax,
 *        becuase this automatically binds the method to this class object globally.
 */
export class HydrogenStudioInspectorStore {
  @observable
  public activeKernel: HydrogenKernel | null;
  @observable
  public kernelBundleMap: Map<HydrogenKernel, Bundle | null>;

  constructor() {
    this.activeKernel = null;
    this.kernelBundleMap = new Map();
  }

  @action
  public addKernel(kernel: HydrogenKernel) {
    this.kernelBundleMap.set(kernel, null);
    if (!this.activeKernel) {
      this.activeKernel = kernel;
    }
  }

  @action
  public setInspectorResult(kernel: HydrogenKernel, bundle: Bundle) {
    this.setActiveKernel(kernel);
    this.kernelBundleMap.set(kernel, bundle);
  }

  @action
  public deleteKernel(kernel: HydrogenKernel) {
    if (this.activeKernel === kernel) {
      this.activeKernel = null;
    }
    this.kernelBundleMap.delete(kernel);

    // Select a random kernel as an active kernel if exist
    for (const keyKernel of this.kernelBundleMap.keys()) {
      this.activeKernel = keyKernel;
      break;
    }
  }

  @action
  public setActiveKernel = (kernel: HydrogenKernel) => {
    this.activeKernel = kernel;
  };
}

export const inspectorStore = new HydrogenStudioInspectorStore();

// For debuggings
if (atom.inDevMode() || atom.inSpecMode()) {
  (window as any).hydrogenStudioInspectorStore = inspectorStore;
}
