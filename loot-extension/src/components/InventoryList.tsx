import { useSelector, useDispatch } from 'react-redux';
import { inventorySlots } from '../lib/consts';

function InventoryList() {
    const myLoot: any = useSelector<any>(state => state.myLoot.value);
    const lootEquipped: any = useSelector<any>(state => state.lootEquipped.value);
  
    if(myLoot.length === 0) return null;
  
    return (
      <table className='loot-bags'>
        <thead>
          <th>
            <tr>
              <td>Slot</td>
              <td>Name</td>
              <td>Strength</td>
              <td>Speed</td>
              <td>Stealth</td>
              <td>Charm</td>
              <td>Equipped from</td>
            </tr>
          </th>
        </thead>
        <tbody>
  
        {inventorySlots.map((inventorySlot, key) => {
          const equippedItem = lootEquipped[key];
          const equippedItemIndex = myLoot.findIndex((bag: any) => bag.id === equippedItem);
          if(equippedItemIndex===-1) {
            return (
              <tr>
              <th scope="row">{inventorySlot}</th>
              <td> 
                Empty
              </td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td className='switch-items'><span>{lootEquipped[key]}</span><div className='buttons'><button>Prev</button><button>Next</button></div></td>
            </tr>
            )
          }
          const component = myLoot[equippedItemIndex].components[key];
          return (
            <tr>
              <th scope="row">{inventorySlot}</th>
              <td> 
                {component.name}
              </td>
              <td>{component.strength}</td>
              <td>{component.speed}</td>
              <td>{component.stealth}</td>
              <td>{component.charm}</td>
              <td className='switch-items'><span>{lootEquipped[key]}</span><div className='buttons'><button>Prev</button><button>Next</button></div></td>
            </tr>
          );
        })}
  
        </tbody>
      </table>
    );
  }

export default InventoryList;