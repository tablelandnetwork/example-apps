import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'equippedTableName',
  initialState: {
    value: 0
  },
  reducers: {
    setName: (state, action) => {
        state.value = action.payload;
    },
  }
});

// Action creators are generated for each case reducer function
export const { setName } = counterSlice.actions

export default counterSlice.reducer;