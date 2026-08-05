import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as projectApi from "../api/project.api";

/**
 * projectSlice
 * See src/api/project.api.js for the full endpoint list.
 */

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.listProjects(params);
      return data?.data ?? {};
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load projects");
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.getProjectById(projectId);
      return data?.data?.project ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load project");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.createProject(payload);
      return data?.data?.project ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.updateProject(projectId, payload);
      return data?.data?.project ?? null;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete project");
    }
  }
);

const initialState = {
  items: [],
  pagination: null,
  selectedProject: null,
  status: "idle",
  error: null,
};

const upsertProject = (state, project) => {
  if (!project) return;
  const index = state.items.findIndex((item) => item._id === project._id);
  if (index >= 0) state.items[index] = project;
  else state.items.unshift(project);
  if (state.selectedProject?._id === project._id) state.selectedProject = project;
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.projects ?? action.payload ?? [];
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.selectedProject = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        upsertProject(state, action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        upsertProject(state, action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.selectedProject?._id === action.payload) state.selectedProject = null;
      });
  },
});

export const { clearSelectedProject } = projectSlice.actions;

export const selectAllProjects = (state) => state.projects.items;
export const selectProjectsPagination = (state) => state.projects.pagination;
export const selectSelectedProject = (state) => state.projects.selectedProject;
export const selectProjectsStatus = (state) => state.projects.status;

export default projectSlice.reducer;
