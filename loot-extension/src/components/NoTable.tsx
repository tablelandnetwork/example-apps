import { Connection } from '@textile/tableland';
import React, { useEffect, useState } from 'react';
import { tbl } from '../lib/connectToLoot';
import { CreateEquippedTable } from '../lib/queries';
(tbl as Connection);




export function NoTable() {
    let [status, setStatus] = useState("");
    let [tableMintStart, setTableMintStart] = useState(false);
    let [table, setTable] = useState("");
    useEffect(() => {
        if(tableMintStart===true) {
            MintTable();
            setTableMintStart(false);
        }
    },
    [tableMintStart]);


    async function MintTable() {
        const tableCreateReceipt = await (tbl as Connection).create(CreateEquippedTable(), {description: "For my loot stuff"});       
        setTable(tableCreateReceipt.id);   
        console.log(table);
    }



    async function MintTableAndUpdateStore() {
        setStatus("Creating...");
        
        
    }

    const button = <button onClick={MintTableAndUpdateStore}>Mint</button>;
    const content = status ? button : status;

    return (
        <div>
            It looks like you don't have a table tracking which items you have equipped. Would you like to mint one now?
            <br></br>
            {content}
            
        </div>
    )
}