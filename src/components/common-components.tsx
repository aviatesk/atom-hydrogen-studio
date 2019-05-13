import * as React from "react";

/**
 * Creates empty React component with a given message rendered in the center of pane
 *
 * @param message - String to be rendered in the center of component
 * @param position - Set `"relative"` when there are some other component with clicking action
 */
export function makeEmptyComponent(message: string, position: "absolute" | "relative" = "absolute") {
  return (
    <ul className="background-message centered" style={{ position: position }}>
      <li>{message}</li>
    </ul>
  );
}
