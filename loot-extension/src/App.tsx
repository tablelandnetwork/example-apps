import React, { Dispatch, useState } from 'react';
import logo from './logo.png';
import './App.css';
import { runQuery, connect, myTables } from '@textile/tableland';
import { getLoot } from './lib/getLoot';
import { hydrate } from './store/lootAttributes';
import { hydrateLoot } from './store/myLoot';
import { useDispatch } from 'react-redux';
import InventoryList from './components/InventoryList';
import { Helmet } from 'react-helmet';
import { equipLoot } from './store/lootEquipped';
// import  Loot from 'loot-sdk';

(globalThis as any).getLoot = getLoot;

function assessLoot(lootAttrs: Array<Array<string | number>>, myLoot: Array<Array<string | number>>, myEquippedLoot: any) {
  
  const components = myLoot.map(component => {
    let componentComputed = {
      name: component.join(" ").trim(),
      strength: 0,
      speed: 0,
      stealth: 0,
      charm: 0
    }
    component.forEach(componentPiece => {
      
      let attrs = lootAttrs.find(componentPieceQuestionMark => componentPieceQuestionMark[0] === componentPiece);
      if(!attrs) return;
      componentComputed.strength += (attrs[1] as number);
      componentComputed.speed += (attrs[2] as number);
      componentComputed.stealth += (attrs[3] as number);
      componentComputed.charm += (attrs[4] as number);

    });


    return componentComputed
    

  });

  return {
    id: "synthetic",
    components
  };


}

async function updateMyLoot() {
  // This query worked, btw.
  "INSERT INTO LootEquipped_0xbDA5747bFD65F08deb54cb465eB87D40e51B197E as le (slot, bag) VALUES ('weapon', 'cheese') ON CONFLICT (slot) DO UPDATE SET bag = 'cheese' WHERE le.slot = 'weapon';"
}

async function proposeCreateTable() {
  let address = '';
  // Popup: Would you like to create a table to keep the state of your equipment? 
  // `CREATE TABLE ${address} LootEquipped_${address}`
}


async function connectToLoot(dispatch: Dispatch<any>) {
  await connect('https://staging.tableland.xyz');
  let lootAttr = (await (runQuery("SELECT * FROM LootProjectAttributes", "95841d2166874bd5bbf28ecae917bb23")) as any).result.data.rows;
  let myLootStatus = (await (runQuery("SELECT * FROM LootEquipped_0xbDA5747bFD65F08deb54cb465eB87D40e51B197E", "d9163b48670f4549813a6f66888bc1fb") as any));
  dispatch(hydrate(lootAttr));
  let myLoot = await getLoot();  


  dispatch(hydrateLoot(assessLoot(lootAttr, myLoot, myLootStatus)));
  dispatch(equipLoot(myLootStatus));
  let tables = await myTables();
  tables = tables.filter((table: {type: string}, ) => table.type==="LootProjectInventory");  
  if(tables.length===0) {
    proposeCreateTable();
  }
  console.log(tables);
  // console.log(await Loot.getBag(1001));
}

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
          <p>Here you can see the loot you currently have equipped, with your metadata stored in Tableland for each access and updates. You can use loot from the original Loot project, and synthetic look (which is your equipped loot by default). Happy adventuring!</p>
        </div>
        <div className="App-section">
          <InventoryList />
        </div>

      </main>

    </div>
  );
}

export default App;
