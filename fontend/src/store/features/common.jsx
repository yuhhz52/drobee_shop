import { createSlice } from "@reduxjs/toolkit"

export const initialState = {
  isLoading: false
}

export const commonSlice = createSlice({
    name: "comomSlice",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            return {
                ...state,
                isLoading: action.payload
            }
        }
    }
    });
export const { setLoading } = commonSlice.actions;
// export const selectIsLoading = (state) => state.comom.isLoading;
export default commonSlice.reducer;