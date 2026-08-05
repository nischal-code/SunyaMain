import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as dashboardApi from "../api/dashboard.api";

/**
 * dashboardSlice
 * See src/api/dashboard.api.js for the full endpoint list. DashboardPage
 * currently fetches its own data locally (it interleaves employee/org
 * calls with Promise.allSettled); this slice is available for widgets
 * elsewhere in the app that want the same data without duplicating the
 * fetch, e.g. a summary card on another page.
 */

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchDashboardSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getDashboardSummary(params);
      return data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load dashboard summary");
    }
  }
);

export const fetchOrgOverview = createAsyncThunk(
  "dashboard/fetchOrgOverview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getOrgOverview();
      return data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load org overview");
    }
  }
);

export const fetchEmployeeOverview = createAsyncThunk(
  "dashboard/fetchEmployeeOverview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getEmployeeOverview();
      return data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load your overview");
    }
  }
);

const initialState = {
  summary: null,
  orgOverview: null,
  employeeOverview: null,
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchOrgOverview.fulfilled, (state, action) => {
        state.orgOverview = action.payload;
      })
      .addCase(fetchEmployeeOverview.fulfilled, (state, action) => {
        state.employeeOverview = action.payload;
      });
  },
});

export const selectDashboardSummary = (state) => state.dashboard.summary;
export const selectOrgOverview = (state) => state.dashboard.orgOverview;
export const selectEmployeeOverview = (state) => state.dashboard.employeeOverview;
export const selectDashboardStatus = (state) => state.dashboard.status;

export default dashboardSlice.reducer;
