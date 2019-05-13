import { richestMimetype, transforms } from "@nteract/transforms";
import { observer } from "mobx-react";
import * as React from "react";
import Select from "react-select";
import { HydrogenStudioInspectorStore } from "../stores/inspector-store";
import { HydrogenKernel } from "../typings/hydrogen.d";
import { makeEmptyComponent } from "./common-components";

const displayOrder = ["text/html", "text/markdown", "text/plain"];

const noRunningKernel = makeEmptyComponent("No running kernels");
const notExecuted = makeEmptyComponent("No inspection exectuted yet", "relative");
const notAvailable = makeEmptyComponent("No introspection available", "relative");

interface Option {
  value: HydrogenKernel;
  label: string;
}

@observer
export default class HydrogenStudioInspectorPaneComponent extends React.Component<{
  inspectorStore: HydrogenStudioInspectorStore;
}> {
  private container: HTMLElement | null | undefined;

  public componentDidUpdate() {
    if (!this.container) return;
    this.container.insertBefore(this.props.inspectorStore.miniEditor.element, this.container.firstChild);
  }

  public render() {
    const inspectorStore = this.props.inspectorStore;
    const { activeKernel, kernelBundleMap } = inspectorStore;
    if (!activeKernel) {
      return noRunningKernel;
    }

    const options: Option[] = [];
    kernelBundleMap.forEach((_bundle, kernel) => {
      options.push({ value: kernel, label: kernel.displayName });
    });
    const selector = (
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        options={options}
        value={{ value: activeKernel, label: activeKernel.displayName }}
        onChange={this.handleChange}
      />
    );
    const miniEditor = (
      <div
        ref={element => {
          this.container = element;
        }}
      />
    );
    const header = (
      <div className="header" style={{ display: "flex" }}>
        <div className="inline-block selector">{selector}</div>
        <div className="inline-block input-editor" style={{ minWidth: "300px", marginTop: "5px" }}>
          {miniEditor}
        </div>
      </div>
    );

    const bundle = kernelBundleMap.get(activeKernel);
    if (!bundle) {
      return (
        <div className="inspector-pane">
          {header}
          {notExecuted}
        </div>
      );
    }

    const mimetype = richestMimetype(bundle, displayOrder, transforms);
    if (!mimetype) {
      atom.notifications.addWarning("Hydrogen-Studio", {
        description: "Inspection is not available for this type",
      });
      return (
        <div className="inspector-pane">
          {header}
          {notAvailable}
        </div>
      );
    }

    const Transform = transforms[mimetype];
    return (
      <div className="inspector-pane">
        {header}
        <Transform data={bundle[mimetype]} />
      </div>
    );
  }

  private handleChange = (selectedOption: any) => {
    const inspectorStore = this.props.inspectorStore;
    const selectedKernel = selectedOption.value;
    inspectorStore.setActiveKernel(selectedKernel);
  };
}
