import * as Atom from "atom";
import { action, observable } from "mobx";
import { Bundle, HydrogenKernel } from "../typings/hydrogen.d";

interface TextEditor extends Atom.TextEditor {
  element: HTMLElement;
}

const miniEditor = new Atom.TextEditor({
  mini: true,
}) as TextEditor;
miniEditor.element.classList.add("inspector-input");
miniEditor.setPlaceholderText("Enter code to inspect");

/**
 * Mimic Hydrogen's inspection error message
 */
const onResults = () => {
  atom.notifications.addInfo("Hydrogen-Studio", {
    detail: "No introspection available for !",
  });
};

/**
 * Stores inspector kernels and inspected data and an active inspector
 *
 * @note: The exported method that would be used in TSX files should be written in allow function syntax,
 *        becuase this automatically binds the method to this class object globally.
 */
export class HydrogenStudioInspectorStore {
  public subscriptions: Atom.CompositeDisposable;
  @observable
  public activeKernel: HydrogenKernel | null;
  @observable
  public kernelBundleMap: Map<HydrogenKernel, Bundle | null>;
  public miniEditor: TextEditor = miniEditor;

  constructor() {
    this.activeKernel = null;
    this.kernelBundleMap = new Map();

    this.subscriptions = new Atom.CompositeDisposable();

    // Add commands
    atom.commands.add(this.miniEditor.element, "core:confirm", () => {
      this.onConfirm();
    });

    // Add disposer
    this.subscriptions.add(
      new Atom.Disposable(() => {
        this.activeKernel = null;
        this.kernelBundleMap.clear();
        this.miniEditor.element.remove();
      })
    );
  }

  @action
  public addKernel(kernel: HydrogenKernel) {
    this.kernelBundleMap.set(kernel, null);
    if (!this.activeKernel) {
      this.setActiveKernel(kernel);
    }
  }

  @action
  public setInspectorResult(kernel: HydrogenKernel, bundle: Bundle) {
    this.kernelBundleMap.set(kernel, bundle);
    this.setActiveKernel(kernel);
  }

  @action
  public deleteKernel(kernel: HydrogenKernel) {
    if (this.activeKernel === kernel) {
      this.activeKernel = null;
    }
    this.kernelBundleMap.delete(kernel);

    // Select a random kernel as an active kernel if exist
    for (const keyKernel of this.kernelBundleMap.keys()) {
      this.setActiveKernel(keyKernel);
      break;
    }
  }

  @action
  public setActiveKernel = (kernel: HydrogenKernel) => {
    this.activeKernel = kernel;
  };

  private onConfirm() {
    const code = this.miniEditor.getText();
    const cursorPos = this.miniEditor.getCursorBufferPosition().column;
    /**
     * @note: Inspection is not provided, so this may cause some error when Hydrogen gets updated
     */
    ((this.activeKernel as any)._kernel as any).inspect(code, cursorPos, onResults);
  }
}

export const inspectorStore = new HydrogenStudioInspectorStore();

// For debuggings
if (atom.inDevMode() || atom.inSpecMode()) {
  (window as any).hydrogenStudioInspectorStore = inspectorStore;
}
