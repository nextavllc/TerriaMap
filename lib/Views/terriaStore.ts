import type Terria from "terriajs/lib/Models/Terria";
import type ViewState from "terriajs/lib/ReactViewModels/ViewState";

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
    await import("terriajs/lib/Core/prerequisites");

    const { terria, viewState } = await import("../../index.js").then(
      (module) => module.default
    );

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
