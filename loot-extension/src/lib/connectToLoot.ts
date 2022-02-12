import { connect, Connection } from "@textile/tableland";
import { Dispatch } from 'react';
import { hydrate } from "../store/lootAttributes";
import { equipLoot } from "../store/lootEquipped";
import { hydrateLoot } from "../store/myLoot";
import { getLoot } from "./getLoot";
import { CreateEquippedTable, SelectAll } from "./queries";
import { LootBag } from './getLoot';
import assessLoot from "./assessLoot";
import { setName } from '../store/equippedTableName';

export let tbl: null | Connection = null; 

export default async function connectToLoot(dispatch: Dispatch<any>, bags: Array<number>) {
    tbl = await connect({network: 'testnet', host: 'https://testnet.tableland.network'});
    let lootAttr = (await (tbl.query(SelectAll())) as any).data.rows;

  
    let tables: any[];
  
    tables = await tbl.list();

    tables = tables.filter((table: {name: string, structure: string}, ) => table.structure==="e9d6a97954e91f68ae411cee2782f21aadaa02460969dd818dba2e3aec7e9bcb");
    
    let myLootStatus;
    
    if(tables.length===0) {
  
      let { name } = await tbl.create(CreateEquippedTable(), {description:"Loot Project Inventory"});
      dispatch(setName(name));
    } else {
      dispatch(setName(tables[0].name));
      myLootStatus = (await (tbl.query(`SELECT * FROM ${tables[0].name}`) as any));
    }
    let loot: LootBag[] = await getLoot(bags);  
    dispatch(hydrate(lootAttr));
    dispatch(hydrateLoot(assessLoot(lootAttr, loot, myLootStatus)));
    dispatch(equipLoot(myLootStatus));
    return;
  
  }
  