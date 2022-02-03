

export function SelectAll(tableId:string): string {
    return `SELECT * FROM ${tableId}`;
};

export function InsertOrUpdate(tableId: string, slot: string, bag: string): string {
    return `INSERT INTO ${tableId} as le (slot, bag) VALUES ('${slot}', '${bag}}') 
    ON CONFLICT (slot) DO UPDATE SET bag = '${bag}' WHERE le.slot = '${slot}';`
}

export function CreateEquippedTable(sig:string) {
    return `CREATE TABLE LootProjectInventory (id int primary key, slot text unique, bag text)`;
}