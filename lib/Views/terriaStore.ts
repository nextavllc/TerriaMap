import ConsoleAnalytics from "terriajs/lib/Core/ConsoleAnalytics";
import GoogleAnalytics from "terriajs/lib/Core/GoogleAnalytics";
import registerCatalogMembers from "terriajs/lib/Models/Catalog/registerCatalogMembers";
import registerSearchProviders from "terriajs/lib/Models/SearchProviders/registerSearchProviders";
import ShareDataService from "terriajs/lib/Models/ShareDataService";
import Terria from "terriajs/lib/Models/Terria";
import ViewState from "terriajs/lib/ReactViewModels/ViewState";
import registerCustomComponentTypes from "terriajs/lib/ReactViews/Custom/registerCustomComponentTypes";
import updateApplicationOnHashChange from "terriajs/lib/ViewModels/updateApplicationOnHashChange";
import updateApplicationOnMessageFromParentWindow from "terriajs/lib/ViewModels/updateApplicationOnMessageFromParentWindow";

import loadPlugins from "../Core/loadPlugins";
import showGlobalDisclaimer from "./showGlobalDisclaimer";
import plugins from "../../plugins";

const initTerria = async () => {
  console.log("Initializing TerriaJS...", Date.now());
  await import("terriajs/lib/Core/prerequisites");

  const terriaOptions: ConstructorParameters<typeof Terria>[0] = {
    baseUrl: "build/TerriaJS"
  };

  // we check exact match for development to reduce chances that production flag isn't set on builds(?)
  if (process.env.NODE_ENV === "development") {
    terriaOptions.analytics = new ConsoleAnalytics();
  } else {
    terriaOptions.analytics = new GoogleAnalytics();
  }

  // Construct the TerriaJS application, arrange to show errors to the user, and start it up.
  const terria = new Terria(terriaOptions);

  // Create the ViewState before terria.start so that errors have somewhere to go.
  // @ts-expect-error: test
  const viewState = new ViewState({
    terria: terria
  });

  // Register all types of catalog members in the core TerriaJS.  If you only want to register a subset of them
  // (i.e. to reduce the size of your application if you don't actually use them all), feel free to copy a subset of
  // the code in the registerCatalogMembers function here instead.
  registerCatalogMembers();

  // Register custom search providers in the core TerriaJS. If you only want to register a subset of them, or to add your own,
  // insert your custom version of the code in the registerSearchProviders function here instead.
  registerSearchProviders();

  // Register custom components in the core TerriaJS.  If you only want to register a subset of them, or to add your own,
  // insert your custom version of the code in the registerCustomComponentTypes function here instead.
  registerCustomComponentTypes(terria);

  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error: test
    window.viewState = viewState;
  }

  await terria
    .start({
      applicationUrl: window.location,
      configUrl: "config.json",
      shareDataService: new ShareDataService({
        terria: terria
      }),
      beforeRestoreAppState: () => {
        // Load plugins before restoring app state because app state may
        // reference plugin components and catalog items.
        return loadPlugins(viewState, plugins).catch((error) => {
          console.error(`Error loading plugins`);
          console.error(error);
        });
      }
    })
    .catch(function (e) {
      terria.raiseErrorToUser(e);
    })
    .finally(function () {
      // Override the default document title with appName. Check first for default
      // title, because user might have already customized the title in
      // index.ejs
      if (document.title === "Terria Map") {
        document.title = terria.appName;
      }

      // Load init sources like init files and share links
      terria.loadInitSources().then((result) => result.raiseError(terria));

      try {
        // Automatically update Terria (load new catalogs, etc.) when the hash part of the URL changes.
        updateApplicationOnHashChange(terria, window);
        updateApplicationOnMessageFromParentWindow(terria, window);

        // Show a modal disclaimer before user can do anything else.
        if (terria.configParameters.globalDisclaimer) {
          showGlobalDisclaimer(viewState);
        }

        // Add font-imports
        const fontImports = terria.configParameters.theme?.fontImports;
        if (fontImports) {
          const styleSheet = document.createElement("style");
          styleSheet.type = "text/css";
          styleSheet.innerText = fontImports;
          document.head.appendChild(styleSheet);
        }
      } catch (e) {
        console.error(e);
        console.error((e as Error).stack);
      }
    });

  console.log("TerriaJS initialized successfully");
  return { terria, viewState };
};

type State =
  | {
      terria: Terria;
      viewState: ViewState;
      status: "ready";
    }
  | {
      terria: undefined;
      viewState: undefined;
      status: "loading";
    };

let state: State = {
  terria: undefined,
  viewState: undefined,
  status: "loading"
};
type Listener = () => void;
let listeners: Listener[] = [];

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const terriaStore = {
  async init() {
    const { terria, viewState } = await initTerria();
    state = {
      terria,
      viewState,
      status: "ready"
    };

    emitChange();
  },
  subscribe(listener: Listener) {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getSnapshot() {
    return state;
  }
};

terriaStore.init();
