import { createSlice } from '@reduxjs/toolkit';



export const counterSlice = createSlice({
  name: 'myLoot',
  initialState: {
    value: [] as any
  },
  reducers: {
    hydrateLoot: (state, action) => {
        
        state.value.push(...action.payload);
    },
  }
});

// Action creators are generated for each case reducer function
export const { hydrateLoot } = counterSlice.actions

export default counterSlice.reducer;