import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as attendanceApi from "../api/attendance.api";

/**
 * attendanceSlice
 * Org-wide + personal attendance state. See src/api/attendance.api.js
 * for the full endpoint list (clock-in/out, manual entries, reports).
 */

export const clockIn = createAsyncThunk("attendance/clockIn", async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.clockIn();
    return data?.data?.attendance ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to clock in");
  }
});

export const clockOut = createAsyncThunk("attendance/clockOut", async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.clockOut();
    return data?.data?.attendance ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to clock out");
  }
});

export const fetchMyTodayAttendance = createAsyncThunk(
  "attendance/fetchMyTodayAttendance",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.getMyTodayAttendance();
      return data?.data?.attendance ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load today's attendance");
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMyAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.getMyAttendance(params);
      return data?.data ?? {};
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load your attendance");
    }
  }
);

export const fetchAttendanceList = createAsyncThunk(
  "attendance/fetchAttendanceList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.listAttendance(params);
      return data?.data ?? {};
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load attendance");
    }
  }
);

const initialState = {
  today: null,
  myRecords: [],
  records: [],
  status: "idle",
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clockIn.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(fetchMyTodayAttendance.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(fetchMyAttendance.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myRecords = action.payload?.attendance ?? action.payload ?? [];
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAttendanceList.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAttendanceList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload?.attendance ?? action.payload ?? [];
      })
      .addCase(fetchAttendanceList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const selectTodayAttendance = (state) => state.attendance.today;
export const selectMyAttendanceRecords = (state) => state.attendance.myRecords;
export const selectAttendanceRecords = (state) => state.attendance.records;
export const selectAttendanceStatus = (state) => state.attendance.status;

export default attendanceSlice.reducer;
