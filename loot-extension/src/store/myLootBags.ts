import { createSlice } from '@reduxjs/toolkit';



export const counterSlice = createSlice({
  name: 'myBags',
  initialState: {
    value: [] as any
  },
  reducers: {
    myBags: (state, action) => {
        
        state.value.push(...action.payload);
    },
  }
});

// Action creators are generated for each case reducer function
export const { myBags } = counterSlice.actions

export default counterSlice.reducer;