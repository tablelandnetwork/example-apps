import { createSlice } from '@reduxjs/toolkit';



export const counterSlice = createSlice({
  name: 'myBags',
  initialState: {
    value: [867, 5309, 1278] as any
  },
  reducers: {
    updateMyBags: (state, action) => {
        
        state.value = action.payload;
    },
  }
});

// Action creators are generated for each case reducer function
export const { updateMyBags } = counterSlice.actions

export default counterSlice.reducer;