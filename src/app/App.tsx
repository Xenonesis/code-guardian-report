
import SinglePageApp from "../pages/SinglePageApp";
import { AppProviders } from "./providers/AppProviders";

const App = () => (
  <AppProviders>
    <SinglePageApp />
  </AppProviders>
);

export default App;