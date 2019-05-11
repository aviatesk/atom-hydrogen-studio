import { richestMimetype, transforms } from "@nteract/transforms";
import { observer } from "mobx-react";
import * as React from "react";
import Select from "react-select";
import { HydrogenStudioInspectorStore } from "../stores/inspector-store";
import { HydrogenKernel } from "../typings/hydrogen.d";

/**
 * Creates empty React component with a given message rendered in the center of pane
 */
const makeEmptyComponent = (message: string, position: "absolute" | "relative" = "absolute") => {
  return (
    <ul className="background-message centered" style={{ position: position }}>
      <li>{message}</li>
    </ul>
  );
};

const displayOrder = ["text/html", "text/markdown", "text/plain"];

interface Option {
  value: HydrogenKernel;
  label: string;
}

@observer
export default class HydrogenStudioInspectorPaneComponent extends React.Component<{
  inspectorStore: HydrogenStudioInspectorStore;
}> {
  public render() {
    const inspectorStore = this.props.inspectorStore;
    const { activeKernel, kernelBundleMap } = inspectorStore;
    if (!activeKernel) {
      return makeEmptyComponent("No running kernels");
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

    const bundle = kernelBundleMap.get(activeKernel);
    if (!bundle) {
      return (
        <div className="inspector-pane">
          {selector}
          {makeEmptyComponent("No inspection exectuted yet", "relative")}
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
          {selector}
          {makeEmptyComponent("No introspection available", "relative")}
        </div>
      );
    }

    const Transform = transforms[mimetype];
    return (
      <div className="inspector-pane">
        {selector}
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
