import { configureStore } from "@reduxjs/toolkit";
import lootReducer from './store/lootAttributes';
import myLootReducer from "./store/myLoot";
import lootEquippedReducer from "./store/lootEquipped";

export default configureStore({
  reducer: {
    lootAttributes: lootReducer,
    myLoot: myLootReducer,
    lootEquipped: lootEquippedReducer
  }
});
