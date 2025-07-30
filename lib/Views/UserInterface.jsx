import PropTypes from "prop-types";
import { useSyncExternalStore } from "react";
import RelatedMaps from "terriajs/lib/ReactViews/RelatedMaps/RelatedMaps";
import { MenuLeft } from "terriajs/lib/ReactViews/StandardUserInterface/customizable/Groups";
import MenuItem from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuItem";
import StandardUserInterface from "terriajs/lib/ReactViews/StandardUserInterface/StandardUserInterface";
import version from "../../version";
import "./global.scss";
import { Loader } from "./Loader";
import { terriaStore } from "./terriaStore";

export const UserInterface = ({ themeOverrides }) => {
  const { terria, viewState, status } = useSyncExternalStore(
    terriaStore.subscribe,
    terriaStore.getSnapshot
  );

  if (status === "loading") {
    return <Loader />;
  }
  const relatedMaps = viewState.terria.configParameters.relatedMaps;
  const aboutButtonHrefUrl =
    viewState.terria.configParameters.aboutButtonHrefUrl;

  return (
    <StandardUserInterface
      terria={terria}
      viewState={viewState}
      themeOverrides={themeOverrides}
      version={version}
    >
      <MenuLeft>
        {aboutButtonHrefUrl ? (
          <MenuItem
            caption="About"
            href={aboutButtonHrefUrl}
            key="about-link"
          />
        ) : null}
        {relatedMaps && relatedMaps.length > 0 ? (
          <RelatedMaps relatedMaps={relatedMaps} />
        ) : null}
      </MenuLeft>
      {/* <ExperimentalMenu /> */}
    </StandardUserInterface>
  );
};

UserInterface.propTypes = {
  themeOverrides: PropTypes.object
};
