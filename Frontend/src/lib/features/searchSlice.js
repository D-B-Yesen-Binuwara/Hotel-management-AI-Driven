import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    resetQuery: (state) => {
      state.query = "";
    },
  },
});

// Action creators are generated for each case reducer function
export const { setQuery, resetQuery } = searchSlice.actions;

export default searchSlice.reducer;
