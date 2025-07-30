import { UserInterface } from "./lib/Views/UserInterface";
import Variables from "./lib/Styles/variables.scss";
import { createRoot } from "react-dom/client";

const container = document.getElementById("ui");
const root = createRoot(container);

root.render(<UserInterface themeOverrides={Variables} />);
