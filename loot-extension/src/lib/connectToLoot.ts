import { connect, myTables, createTable, runQuery } from "@textile/tableland";
import { Dispatch } from 'react';
import { hydrate } from "../store/lootAttributes";
import { equipLoot } from "../store/lootEquipped";
import { hydrateLoot } from "../store/myLoot";
import { fauxEquippedToken, fauxLootTableId, fauxLootTableName, fauxPubSig } from "./fauxnstants";
import { getLoot } from "./getLoot";
import { CreateEquippedTable, SelectAll } from "./queries";
import { LootBag } from './getLoot';
import assessLoot from "./assessLoot";
import { ethers, Signer } from "ethers";
let signer: Signer;

export default async function connectToLoot(dispatch: Dispatch<any>) {
    await connect('https://testnet.tableland.network');
    let lootAttr = (await (runQuery(SelectAll(fauxLootTableName), fauxLootTableId)) as any).result.data.rows;
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    signer = provider.getSigner();
    let myLootStatus = (await (runQuery(`SELECT * FROM LootEquipped_${await signer.getAddress()}`, fauxEquippedToken) as any));
    
    
  
    let tables: any[];

    tables = await myTables();

    tables = tables.filter((table: {name: string}, ) => table.name==="LootProjectInventory");  
    
    if(tables.length===0) {
  
      createTable(CreateEquippedTable((await connect('https://testnet.tableland.network')).ethAccounts[0]), {type:"LootProjectInventory"});
    }
    let loot: LootBag[] = await getLoot([1200,1279,1555,0]);  
    dispatch(hydrate(lootAttr));
    dispatch(hydrateLoot(assessLoot(lootAttr, loot, myLootStatus)));
    dispatch(equipLoot(myLootStatus));
  
  }
  