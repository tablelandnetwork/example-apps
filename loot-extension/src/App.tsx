import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import InventoryList from './components/InventoryList';
import connectToLoot from './lib/connectToLoot';
import {  updateMyBags } from './store/myLootBags';
import BagsList from './components/BagsList';
import { useEffect, useState } from 'react';


function csvToArray(val:string) {
  return JSON.parse(`[${val.replace(/,\s*$/, "")}]`);
}

function App() {
  const myBags: any = useSelector<any>(state => state.myBags.value);
  let [connectedStatus, setConnectedStatus] = useState("no");
  
  const dispatch = useDispatch();
  useEffect(() => {
    document.title = 'Loot Equipped';
  });
  useEffect(() => {

    if(connectedStatus==="please-start") {
      let connectUs = async () => {
        setConnectedStatus("started");
        const connected = await connectToLoot(dispatch, myBags);
        setConnectedStatus("connected");
        return connected;
      }
      connectUs();

    }
  }, [connectedStatus, dispatch, myBags]);
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>Loot Equipped</h1>

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
          <label>Comma seperated list of bags you own (or would like to own). Fill in before hitting connect. TY.
          
          <input type="text" defaultValue={JSON.stringify(myBags).slice(1,-1)} onChange={e=>dispatch(updateMyBags(csvToArray(e.target.value)))} ></input></label>
              <h2>{connectedStatus}</h2>
          <BagsList></BagsList>
          <button onClick={async (e) => {
            
            setConnectedStatus("please-start");

          }}>Let's go</button>
          <InventoryList />
        </div>

      </main>

    </div>
  );
}

export default App;
