import { createSlice } from "@reduxjs/toolkit";
import { cachePresetInfo } from "../util/util";

const slice = createSlice({
  name: "model",
  initialState: {},
  reducers: {
    loadPreset(state, action) {
      Object.assign(state, action.payload || {});
    },

    addPreset(state, action) {
      let { userId, filename, identifier, result } = action.payload;
      state[userId] = state[userId] || {};
      state[userId][filename] = state[userId][filename] || {};
      state[userId][filename][identifier] =
        state[userId][filename][identifier] || {};
      let existingKeys = Object.keys(
        state[userId][filename][identifier]
      ).sort();
      let lastIndex = existingKeys.length
        ? existingKeys[existingKeys.length - 1].split(" ")[1]
        : "0";
      let presetName = "Model " + (Number(lastIndex) + 1);
      state[userId][filename][identifier][presetName] = { ...result };
      cachePresetInfo(state);
    },

    updatePreset(state, action) {
      let { userId, filename, identifier, presetName, result } = action.payload;
      state[userId] = state[userId] || {};
      state[userId][filename] = state[userId][filename] || {};
      state[userId][filename][identifier] =
        state[userId][filename][identifier] || {};
      state[userId][filename][identifier][presetName] = { ...result };
      cachePresetInfo(state);
    },

    clearPreset(state, action) {
      let { userId, filename, identifier } = action.payload;
      state[userId] = state[userId] || {};
      state[userId][filename] = state[userId][filename] || {};
      state[userId][filename][identifier] = {};
      cachePresetInfo(state);
    },

    deletePreset(state,action){
        let { userId, filename, identifier, presetName } = action.payload; 
        state[userId] = state[userId] || {};
        state[userId][filename] = state[userId][filename] || {};
        state[userId][filename][identifier] =
        state[userId][filename][identifier] || {};
        if (presetName in state[userId][filename][identifier]){
            delete state[userId][filename][identifier][presetName]
        }
        cachePresetInfo(state);
    }
  },
});

export const { reducer, actions } = slice;
