import PropTypes from "prop-types";
import React, { Suspense, useSyncExternalStore } from "react";
import "./global.scss";
import { Loader } from "./Loader";
import { terriaStore } from "./terriaStore";
import Variables from "../Styles/variables.scss";
import { createRoot } from "react-dom/client";

// Lazy load the entire TerriaUserInterface component
const LazyTerriaUserInterface = React.lazy(() =>
  import("./UserInterface").then((module) => ({
    default: module.TerriaUserInterface
  }))
);

const Root = ({ themeOverrides }) => {
  const { terria, viewState, status } = useSyncExternalStore(
    terriaStore.subscribe,
    terriaStore.getSnapshot
  );

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <LazyTerriaUserInterface
        terria={terria}
        viewState={viewState}
        themeOverrides={themeOverrides}
      />
    </Suspense>
  );
};

Root.propTypes = {
  themeOverrides: PropTypes.object
};

export const renderUi = () => {
  const container = document.getElementById("ui");
  if (!container) {
    console.error("Container element with id 'ui' not found.");
    return;
  }

  const root = createRoot(container);
  root.render(<Root themeOverrides={Variables} />);
};
