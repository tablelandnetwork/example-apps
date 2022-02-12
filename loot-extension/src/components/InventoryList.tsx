import { Connection } from '@textile/tableland';
import { tbl } from '../lib/connectToLoot';
import { useSelector, useDispatch } from 'react-redux';
import { inventorySlots } from '../lib/consts';
import { InsertOrUpdate } from '../lib/queries';
import { equipItem } from '../store/lootEquipped';

function InventoryList() {
    const myBags: any = useSelector<any>(state => state.myBags.value);
    const myLoot: any = useSelector<any>(state => state.myLoot.value);
    const lootEquipped: any = useSelector<any>(state => state.lootEquipped.value);
    const equippedTableName: any = useSelector<any>(state => state.equippedTableName.value);

    const dispatch = useDispatch();
    if(myLoot.length === 0) return null;
  
    let strength:number=0, speed:number=0, stealth:number=0, charm:number=0;
    return (
      <table className='loot-bags'>
        <thead>

            <tr>
              <td>Slot</td>
              <td>Name</td>
              <td>Strength</td>
              <td>Speed</td>
              <td>Stealth</td>
              <td>Charm</td>
              <td>Equipped from</td>
            </tr>

        </thead>
        <tbody>
  
        {inventorySlots.map((inventorySlot, key) => {
          const equippedItem = lootEquipped[key];
          const equippedItemIndex = myLoot.findIndex((bag: any) => bag.id === equippedItem);
          
          const component = myLoot[equippedItemIndex]?.components[key] ?? {name:"Empty"};
          strength = strength + (component.strength ?? 0);
          speed = speed + (component.speed ?? 0);
          stealth = stealth + (component.stealth ?? 0);
          charm = charm + (component.charm ?? 0);
          return (
            <tr key={inventorySlot}>
              <th scope="row">{inventorySlot}</th>
              <td> 
                {component.name}
              </td>
              <td>{component.strength}</td>
              <td>{component.speed}</td>
              <td>{component.stealth}</td>
              <td>{component.charm}</td>
              <td className='switch-items'><select className='custom-select' onChange={(e)=>{
                dispatch(equipItem({key, bag:e.target.value}));
                let updateSlot = InsertOrUpdate(equippedTableName, inventorySlots[key], e.target.value);
                (tbl as Connection).query(updateSlot);
              }} value={lootEquipped[key]}><option>Empty</option><option>synthetic</option>{myBags.map((bag:number) => {
                return <option key={bag}>loot@{bag}</option>                
              })}
                
              </select></td>
            </tr>
          );
        })}
        <tr>
          <th scope="row">Totals</th>
          <td></td>
          <td>{strength}</td>
          <td>{speed}</td>
          <td>{stealth}</td>
          <td>{charm}</td>
          <td></td>
        </tr>
        </tbody>
      </table>
    );
  }

export default InventoryList;