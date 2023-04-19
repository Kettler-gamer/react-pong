import Gamefield from "./components/Gamefield";
import "./styling/stylesheet/main.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Pong</h1>
        <Gamefield />
      </header>
    </div>
  );
}

export default App;
