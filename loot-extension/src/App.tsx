import './App.css';
import { useDispatch } from 'react-redux';
import InventoryList from './components/InventoryList';
import { Helmet } from 'react-helmet';
import connectToLoot from './lib/connectToLoot';



function App() {


  const dispatch = useDispatch();


  return (
    <div className="App">
        <Helmet>
          <title>Loot Equipped</title>
        </Helmet>
      <header className="App-header">
        <h1>Loot Equipped</h1>
        <button onClick={async (e) => {
            
            if(e.target instanceof Element) e.target.remove();
            connectToLoot(dispatch);        

          }}>Connect</button>
      </header>
      <main>
        <div className="App-intro App-section">
          <h2>Loot Equipped</h2>
          <p>
            Here you can see the loot you currently have equipped, 
             with your metadata stored in Tableland for each access
            and updates. You can use loot from the original 
            Loot project, and synthetic look (which is your equipped
            loot by default). Happy adventuring!
          </p>
        </div>
        <div className="App-section">

          <InventoryList />
        </div>

      </main>

    </div>
  );
}

export default App;
