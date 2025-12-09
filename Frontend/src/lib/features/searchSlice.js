import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
  isAiSearch: false,
  aiResponse: "",
  aiHotels: [],
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setAiSearch: (state, action) => {
      state.query = action.payload.query;
      state.isAiSearch = true;
      state.aiResponse = action.payload.response;
      state.aiHotels = action.payload.hotels;
    },
    resetQuery: (state) => {
      state.query = "";
      state.isAiSearch = false;
      state.aiResponse = "";
      state.aiHotels = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const { setQuery, setAiSearch, resetQuery } = searchSlice.actions;

export default searchSlice.reducer;
