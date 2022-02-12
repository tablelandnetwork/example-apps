
import { LootBag, LootItem } from './getLoot';

export default function assessLoot(lootAttrs: Array<Array<string | number>>, myLoot: LootBag[], myEquippedLoot: any) {
 

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
          
          let attrs = lootAttrs.find(componentPieceQuestionMark => componentPieceQuestionMark[1] === componentPiece);
          if(!attrs) return;
          componentComputed.strength += (attrs[2] as number);
          componentComputed.speed += (attrs[3] as number);
          componentComputed.stealth += (attrs[4] as number);
          componentComputed.charm += (attrs[5] as number);
  
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
  