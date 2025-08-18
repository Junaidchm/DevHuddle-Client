import { Media } from "@/src/app/types/feed";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface feedMediaState {
  media: Media[];
  currentImageIndex: number;
}
const initialState: feedMediaState = {
  media: [],
  currentImageIndex: 0,
};

const feedMediaSlice = createSlice({
  name: "feedMedia",
  initialState,
  reducers: {
    addMedia: (state, action: PayloadAction<Media[]>) => {
      state.media.push(...action.payload);
    //   if (state.media.length > 0 && state.currentImageIndex === 0) {
    //     state.currentImageIndex = 0;
    //   }
    },
    setMedia: (state, action: PayloadAction<Media[]>) => {
    //   state.currentImageIndex =
    //     action.payload.length > 0 ? 0 : state.currentImageIndex;
    },
    clearMedia: (state) => {
      state.media = [];
      state.currentImageIndex = 0;
    },
    setCurrentImageIndex: (state, action: PayloadAction<number>) => {
      state.currentImageIndex = action.payload;
    },
  },
});
export const { addMedia, clearMedia, setCurrentImageIndex, setMedia } =
  feedMediaSlice.actions;
export default feedMediaSlice.reducer;
