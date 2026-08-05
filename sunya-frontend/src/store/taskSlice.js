import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as taskApi from "../api/task.api";

/**
 * taskSlice
 * See src/api/task.api.js for the full endpoint list.
 */

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await taskApi.listTasks(params);
    return data?.data ?? {};
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to load tasks");
  }
});

export const fetchTaskById = createAsyncThunk("tasks/fetchTaskById", async (taskId, { rejectWithValue }) => {
  try {
    const { data } = await taskApi.getTaskById(taskId);
    return data?.data?.task ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to load task");
  }
});

export const createTask = createAsyncThunk("tasks/createTask", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await taskApi.createTask(payload);
    return data?.data?.task ?? null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to create task");
  }
});

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.updateTask(taskId, payload);
      return data?.data?.task ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update task");
    }
  }
);

export const changeTaskStatus = createAsyncThunk(
  "tasks/changeTaskStatus",
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.changeTaskStatus(taskId, status);
      return data?.data?.task ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update task status");
    }
  }
);

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (taskId, { rejectWithValue }) => {
  try {
    await taskApi.deleteTask(taskId);
    return taskId;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Failed to delete task");
  }
});

const initialState = {
  items: [],
  pagination: null,
  selectedTask: null,
  status: "idle",
  error: null,
};

const upsertTask = (state, task) => {
  if (!task) return;
  const index = state.items.findIndex((item) => item._id === task._id);
  if (index >= 0) state.items[index] = task;
  else state.items.unshift(task);
  if (state.selectedTask?._id === task._id) state.selectedTask = task;
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.tasks ?? action.payload ?? [];
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        upsertTask(state, action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        upsertTask(state, action.payload);
      })
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        upsertTask(state, action.payload);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.selectedTask?._id === action.payload) state.selectedTask = null;
      });
  },
});

export const { clearSelectedTask } = taskSlice.actions;

export const selectAllTasks = (state) => state.tasks.items;
export const selectTasksPagination = (state) => state.tasks.pagination;
export const selectSelectedTask = (state) => state.tasks.selectedTask;
export const selectTasksStatus = (state) => state.tasks.status;

export default taskSlice.reducer;
