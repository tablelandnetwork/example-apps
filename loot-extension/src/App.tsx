import React, { Dispatch } from 'react';
import './App.css';
import { runQuery, connect, myTables, createTable } from '@textile/tableland';
import { getLoot, LootBag, LootItem } from './lib/getLoot';
import  { hydrate } from './store/lootAttributes';
import { hydrateLoot } from './store/myLoot';
import { useDispatch } from 'react-redux';
import InventoryList from './components/InventoryList';
import { Helmet } from 'react-helmet';
import { equipLoot } from './store/lootEquipped';
import { CreateEquippedTable, SelectAll } from './lib/queries';
import { fauxEquippedToken, fauxLootTableId, fauxLootTableName, fauxPubSig } from './lib/fauxnstants';
// import  Loot from 'loot-sdk';

(globalThis as any).getLoot = getLoot;


function assessLoot(lootAttrs: Array<Array<string | number>>, myLoot: LootBag[], myEquippedLoot: any) {
 

  const bags = myLoot.map(lootBag => {

    const components = lootBag.items.map((component: LootItem) => {
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
      id: lootBag.id,
      components
    }
  });



  return bags;
}






async function connectToLoot(dispatch: Dispatch<any>) {
  await connect('https://testnet.tableland.network');
  let lootAttr = (await (runQuery(SelectAll(fauxLootTableName), fauxLootTableId)) as any).result.data.rows;
  
  let myLootStatus = (await (runQuery(`SELECT * FROM LootEquipped_${fauxPubSig}`, fauxEquippedToken) as any));
  dispatch(hydrate(lootAttr));
  let loot: LootBag[] = await getLoot([1200,1279,1555,0]);  


  dispatch(hydrateLoot(assessLoot(lootAttr, loot, myLootStatus)));
  dispatch(equipLoot(myLootStatus));
  let tables = await myTables();
  tables = tables.filter((table: {type: string}, ) => table.type==="LootProjectInventory");  
  if(tables.length===0) {
    createTable(CreateEquippedTable((await connect('https://testnet.tableland.network')).ethAccounts[0]));
  }
  console.log(tables);
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
