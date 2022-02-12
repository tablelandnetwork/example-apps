

export function SelectAll(): string {
    return `SELECT * FROM LootAttributes_3`;
};

export function InsertOrUpdate(tableId: string, slot: string, bag: string): string {
    return `INSERT INTO ${tableId} as le (slot, bag) VALUES ('${slot}', '${bag}') 
    ON CONFLICT (slot) DO UPDATE SET bag = '${bag}' WHERE le.slot = '${slot}';`
}

export function CreateEquippedTable() {
    return `CREATE TABLE LootEquipped (id serial NOT NULL PRIMARY KEY, slot text unique, bag text)`;
}