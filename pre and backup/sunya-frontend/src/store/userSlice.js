import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userApi from "../api/user.api";

/**
 * userSlice
 * Org-wide user directory (GET /users, PATCH /users/:id/role, ...) — see
 * src/api/user.api.js for the full endpoint list. Restricted to
 * super_admin/admin/manager on the backend (role.middleware.js).
 */

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await userApi.listUsers(params);
    return data?.data ?? {};
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to load users");
  }
});

export const fetchUserById = createAsyncThunk("users/fetchUserById", async (userId, { rejectWithValue }) => {
  try {
    const { data } = await userApi.getUserById(userId);
    return data?.data?.user ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to load user");
  }
});

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateUserRole(userId, role);
      return data?.data?.user ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update role");
    }
  }
);

export const toggleUserActiveStatus = createAsyncThunk(
  "users/toggleUserActiveStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await userApi.toggleUserActiveStatus(userId);
      return data?.data?.user ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update status");
    }
  }
);

const initialState = {
  items: [],
  selectedUser: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const upsertUser = (state, user) => {
  if (!user) return;
  const index = state.items.findIndex((item) => item._id === user._id);
  if (index >= 0) state.items[index] = user;
  if (state.selectedUser?._id === user._id) state.selectedUser = user;
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.users ?? action.payload ?? [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        upsertUser(state, action.payload);
      })
      .addCase(toggleUserActiveStatus.fulfilled, (state, action) => {
        upsertUser(state, action.payload);
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;

export const selectAllUsers = (state) => state.users.items;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersStatus = (state) => state.users.status;

export default userSlice.reducer;
