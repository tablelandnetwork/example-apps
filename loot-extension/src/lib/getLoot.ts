import sLootAbi from './sLootAbi.json';
import lootAbi from './lootAbi.json';
import lootProperties from './lootItemComponents.json';
import { ethers } from 'ethers';


const synthLoot = {
  "address": "0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE",
  "abi": sLootAbi
}

const loot = {
    "address": "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7",
    "abi": lootAbi
}

const slots: Array<string> = [
    "weapons",
    "chestArmor",
    "headArmor",
    "waistArmor",
    "footArmor",
    "handArmor",
    "necklaces",
    "rings",
    "suffixes",
    "namePrefixes",
    "nameSuffixes"
];

function ComponentEnumToObject(item_hex: Array<{_hex: string}>, key: number) {
    const item = item_hex.map(property => {
        return parseInt(property._hex, 16);
    });

    let lootProps: any = (lootProperties as any);
    let slot: string = slots[key];
    let base = lootProps[slot][item[0]];
    let suffix = lootProps.suffixes[item[1]];
    let namePrefix = lootProps.namePrefixes[item[2]];
    let nameSuffix = lootProps.nameSuffixes[item[3]];
    let plusOne = item[4] === 1 ? "+1" : "";


    return [namePrefix, nameSuffix, base, suffix, plusOne];
}


export async function getLoot() : Promise<Array<Array<string | number>>> {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    const signer = provider.getSigner();
    const sLootContract = new ethers.Contract(synthLoot.address, synthLoot.abi, signer);

    const lootContract = new ethers.Contract(loot.address, loot.abi, signer);

    
    await provider.send("eth_requestAccounts", []);
    
    let userAddress = await signer.getAddress();
    

    // let bag = 1279;

    
    
    // let realLootBag = Promise.all([
    //     lootContract.getWeapon(bag),
    //     lootContract.getChest(bag)
    // ]);

    // function ItemAssignComponents() {
    //     let it:any = {};
    //     Object.entries(lootProperties).forEach(lootProperty => {
    //         lootProperty[1].forEach(lootComponent => {
    //             let spot = realLoot.search(`("| |$)${lootComponent}("| |$)`);
    //             if(spot!==-1 && lootComponent!=="") {
    //                 it[lootProperty[0]] = lootComponent;
    //                 console.log(lootComponent, lootProperty[0]);
    //             }
    //         });
    
    //         console.log([it.namePrefix, it.nameSuffix, it.base, it.suffix, it.plusOne]);
    //     })
    // }






    
    let items = await Promise.all([
        sLootContract.weaponComponents(userAddress),
        sLootContract.chestComponents(userAddress),
        sLootContract.headComponents(userAddress),
        sLootContract.waistComponents(userAddress),
        sLootContract.footComponents(userAddress),
        sLootContract.handComponents(userAddress),
        sLootContract.neckComponents(userAddress),
        sLootContract.ringComponents(userAddress)
    ]);

    return items.map(ComponentEnumToObject);
}