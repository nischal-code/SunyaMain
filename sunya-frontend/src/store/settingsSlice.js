import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as settingsApi from "../api/settings.api";

/**
 * settingsSlice
 * The single org-wide office-settings document — GET/PATCH /settings
 * (restricted to super_admin/admin/manager to view, super_admin/admin
 * to update — see settings.routes.js).
 */

export const fetchSettings = createAsyncThunk("settings/fetchSettings", async (_, { rejectWithValue }) => {
  try {
    const { data } = await settingsApi.getSettings();
    return data?.data?.settings ?? data?.data ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to load office settings");
  }
});

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await settingsApi.updateSettings(payload);
      return data?.data?.settings ?? data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update office settings");
    }
  }
);

const initialState = {
  settings: null,
  status: "idle",
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const selectOfficeSettings = (state) => state.settings.settings;
export const selectSettingsStatus = (state) => state.settings.status;

export default settingsSlice.reducer;
