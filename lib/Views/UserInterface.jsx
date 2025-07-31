import PropTypes from "prop-types";
import React, { Suspense } from "react";
import { useSyncExternalStore } from "react";
import "./global.scss";
import { Loader } from "./Loader";
import { terriaStore } from "./terriaStore";

// Lazy load the entire TerriaUserInterface component
const LazyTerriaUserInterface = React.lazy(() =>
  import("./TerriaUserInterface").then((module) => ({
    default: module.TerriaUserInterface
  }))
);

export const UserInterface = ({ themeOverrides }) => {
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

UserInterface.propTypes = {
  themeOverrides: PropTypes.object
};
