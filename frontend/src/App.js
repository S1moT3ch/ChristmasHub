import './App.css';
import ChristmasDomotics from "./components/ChristmasDomotic";
import SmartPlugs from "./components/SmartPlugs";
import LedController from "./components/LedController";

function App() {
  return (
      <div>
        <SmartPlugs />
        <LedController />
      </div>
  );
}

export default App;
