import sLootAbi from './sLootAbi.json';
import lootAbi from './lootAbi.json';
import lootProperties from './lootItemComponents.json';
import { ethers, providers, Signer } from 'ethers';
let signer: Signer;
let providerMain:any;

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


export interface LootBag {
    id: string | number,
    items: LootItem[]
}
export interface LootItem extends Array<any> {
    [index: number]: LootComponent
}
export interface LootComponent extends Array<any> {
    [index: number]: string 
}


async function GetSyntheticLoot() {
    const sLootContract = new ethers.Contract(synthLoot.address, synthLoot.abi, providerMain);
    let userAddress = await signer.getAddress();
    let synth = await Promise.all([
        sLootContract.weaponComponents(userAddress),
        sLootContract.chestComponents(userAddress),
        sLootContract.headComponents(userAddress),
        sLootContract.waistComponents(userAddress),
        sLootContract.footComponents(userAddress),
        sLootContract.handComponents(userAddress),
        sLootContract.neckComponents(userAddress),
        sLootContract.ringComponents(userAddress)
    ]);

    return {id: "synthetic", items: synth.map(ComponentEnumToObject)};
}



async function GetRealLoot(bags: number[]) {
    providerMain = new ethers.providers.InfuraProvider("mainnet", "92f6902cf1214401ae5b08a1e117eb91");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    signer = provider.getSigner();
    

    const lootContract = new ethers.Contract(loot.address, loot.abi, providerMain);



    let populatedBags = await bags.map(async (bag): Promise<LootBag> => {
        let realLootBag = await Promise.all([
            lootContract.getWeapon(bag),
            lootContract.getChest(bag),
            lootContract.getHead(bag),
            lootContract.getWaist(bag),
            lootContract.getFoot(bag),
            lootContract.getHand(bag),
            lootContract.getNeck(bag),
            lootContract.getRing(bag)        
        ]);
        
        
        let realLootBagComponents = realLootBag.map(realLootItem => {
            let it:any = {};
            Object.entries(lootProperties).forEach(lootProperty => {
                lootProperty[1].forEach(lootComponent => {
                    let spot = realLootItem.search(`("| |^)${lootComponent}("| |$)`);
                    if(spot!==-1 && lootComponent!=="") {
                        let prop =  ["namePrefixes", "nameSuffixes", "suffixes"].includes(lootProperty[0]) ? lootProperty[0] : "base"; 
                        it[prop] = lootComponent;
                    }
                });
        
                
            });
    
            return [it.namePrefixes, it.nameSuffixes, it.base, it.suffixes, it.plusOne];
        });
        return {
            id: `loot@${bag}`,
            items: realLootBagComponents
        }
    });
    
    return await Promise.all(populatedBags);
}



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


export async function getLoot(bags: number[]) : Promise<LootBag[]> {

    let realLootBags = await GetRealLoot(bags);


    realLootBags.push(await GetSyntheticLoot());

    return realLootBags;
}