import { configureStore } from "@reduxjs/toolkit";
import lootReducer from './store/lootAttributes';
import myLootReducer from "./store/myLoot";
import lootEquippedReducer from "./store/lootEquipped";
import bagsReducer from "./store/myLootBags";
import equippedTableName from "./store/equippedTableName";

export default configureStore({
  reducer: {
    lootAttributes: lootReducer,
    myLoot: myLootReducer,
    lootEquipped: lootEquippedReducer,
    myBags: bagsReducer,
    equippedTableName
  }
});
