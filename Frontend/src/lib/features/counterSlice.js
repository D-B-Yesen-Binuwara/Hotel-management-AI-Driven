import { createSlice } from "@reduxjs/toolkit";

const initialState = 0;

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state, action) => {
      console.log(state, action);

      return (state += 1);
    },
    decrement: (state) => {
      return (state -= 1);
    },
    incrementByAmount: (state, action) => {
      console.log(state, action);
      return (state += action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
