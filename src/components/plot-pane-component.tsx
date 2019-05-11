import { Display } from "@nteract/display-area";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import Slider from "react-rangeslider";
import { displayOrder, transforms } from "../common";
import { HydrogenStudioPlotStore } from "../stores/plot-store";

/**
 * Component class that is suppposed to be used when there is no plot
 */
class EmptyMessage extends React.Component {
  public render() {
    return (
      <ul className="background-message centered">
        <li>No plot to display</li>
      </ul>
    );
  }
}

@observer
export default class HydrogenStudioPlotPaneComponent extends React.Component<{ plotStore: HydrogenStudioPlotStore }> {
  public render() {
    const plotStore = this.props.plotStore;
    const plotData = plotStore.getActivePlotData();
    if (!plotData) {
      return <EmptyMessage />;
    }

    return (
      <div className="plot-pane">
        <div className="slider">
          <div className=" btn-group btn-group-sm" style={{ position: "absolute", left: "0px" }}>
            <button
              className="btn icon icon-move-left"
              onClick={plotStore.showFirstPlot}
              disabled={!plotStore.hasPreviousPlot()}
              title={"Show first plot"}
            />
            <button
              className="btn icon icon-arrow-left"
              onClick={plotStore.showPreviousPlot}
              disabled={!plotStore.hasPreviousPlot()}
              title={"Show previous plot"}
            />
          </div>

          <Slider
            min={0}
            max={plotStore.plotsData.length - 1}
            value={plotStore.activePlot}
            onChange={plotStore.showPlot}
            tooltip={false}
          />

          <div
            style={{
              position: "absolute",
              pointerEvents: "none",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {plotStore.activePlot + 1} / {plotStore.plotsData.length}
          </div>

          <div>
            <div className="btn-group btn-group-sm" style={{ position: "absolute", right: "0px" }}>
              <button
                className="btn icon icon-arrow-right"
                onClick={plotStore.showNextPlot}
                disabled={!plotStore.hasNextPlot()}
                title={"Show next plot"}
              />
              <button
                className="btn icon icon-move-right"
                onClick={plotStore.showLastPlot}
                disabled={!plotStore.hasNextPlot()}
                title={"Show last plot"}
              />
            </div>
          </div>
        </div>

        <div className="plot-info">
          <ul className="info-messages block" style={{ position: "absolute", left: "0px" }}>
            <li>
              {plotData.displayName} (Generated at: <code>In[{plotData.executionCount}]</code>)
            </li>
          </ul>
          <div style={{ position: "absolute", right: "0px" }}>
            <div className="btn-group btn-group-sm">
              <button className="btn icon icon-x" onClick={plotStore.clearCurrentPlot}>
                Delete
              </button>
              <button className="btn icon icon-trashcan" onClick={plotStore.clearAllPlots}>
                Delete All
              </button>
            </div>
          </div>
        </div>

        <Display
          outputs={toJS(plotData.outputs)}
          displayOrder={displayOrder}
          transforms={transforms}
          theme="light"
          models={{}}
          expanded={true}
        />
      </div>
    );
  }
}
