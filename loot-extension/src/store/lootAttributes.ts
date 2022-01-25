import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'lootAttributes',
  initialState: {
    value: 0
  },
  reducers: {
    hydrate: (state, action) => {
        state.value = action.payload;
    },
  }
});

// Action creators are generated for each case reducer function
export const { hydrate } = counterSlice.actions

export default counterSlice.reducer;