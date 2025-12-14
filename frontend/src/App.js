import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Presepe from "./components/Presepe";
import SmartPlugs from "./components/SmartPlugs";
import LedController from "./components/LedController";
import SmartPlugsBasic from "./components/SmartPlugsBasic";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/advanced" element={<Presepe />} />
                <Route path="/basic" element={<div><SmartPlugsBasic /><LedController /></div>} />
                <Route path="*" element={<h2>Pagina non trovata</h2>} />
            </Routes>
        </Router>
    );
}

export default App;
