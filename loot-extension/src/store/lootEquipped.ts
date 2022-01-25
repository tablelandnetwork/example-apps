import { createSlice } from '@reduxjs/toolkit';
import { inventorySlots } from '../lib/consts';
import * as _ from "lodash";

interface EquippedRow {
  0: string,
  1: string
}

interface EquippedRows extends Array<any> {
  [index: number]: EquippedRow
}


function parseEquipped(db:EquippedRows, equipped: Array<string>): Array<string> {


  inventorySlots.forEach((slot, key) => {
    const index = db.findIndex((rowFromEquipped: any) => slot===rowFromEquipped[0]);
    if(index!==-1) {
      equipped[key] = db[index][1];
    }
  });

  return equipped;
}

export const counterSlice = createSlice({
  name: 'lootEquipped',
  initialState: {
    value: [
        "synthetic",
        "synthetic",
        "synthetic",
        "synthetic",
        "synthetic",
        "synthetic",
        "synthetic",
        "none"
    ] as any
  },
  reducers: {
    equipLoot: (state: any, action:any) => {
      let stateOld = _.clone(state);
      state.value = parseEquipped(action.payload.result.data.rows, stateOld);
    },
  }
});

// Action creators are generated for each case reducer function
export const { equipLoot } = counterSlice.actions

export default counterSlice.reducer;