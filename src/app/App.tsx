
import SinglePageApp from "../views/SinglePageApp";
import { AppProviders } from "./providers/AppProviders";

const App = () => (
  <AppProviders>
    <SinglePageApp />
  </AppProviders>
);

export default App;