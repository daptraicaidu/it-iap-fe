import { BrowserRouter } from "react-router-dom";
import AppRouter from "../routes/AppRouter";
import "../i18n";

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
