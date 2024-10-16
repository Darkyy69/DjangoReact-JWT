import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

interface User {
  id: number;
  email: string;
  username: string;
  avatar: File | string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
interface JwtPayload {
  user_id: number;
  exp: number;
  iat: number;
  jti: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};


const fetchUserDetails = async (userId: number, token: string) => {
  const response = await api.get(`/api/user/${userId}/`);
  return response.data;
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/token/", credentials);
      const { access, refresh } = response.data;
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
      const decodedToken = jwtDecode<JwtPayload>(access);
      const user = await fetchUserDetails(decodedToken.user_id, access);

      return { token: access, user };
    } catch (error: any) {
      throw error.response.data.detail || "An error occurred during login";
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/user/", userData);

      return { user: response.data };
    } catch (error: any) {
      throw (
        error.response.data.detail ||
        error.response.data[0] ||
        "An error occurred during registration"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User> & { password?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;

      if (!userId) throw new Error("User not authenticated");

      const formData = new FormData();
      if (profileData.username) {
        formData.append("username", profileData.username);
      }
      if (profileData.email) {
        formData.append("email", profileData.email);
      }
      if (profileData.avatar) {
        formData.append("avatar", profileData.avatar);
      }
      if (profileData.password) {
        formData.append("password", profileData.password);
      }


      const response = await api.patch(`/api/user/${userId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "An error occurred while updating profile"
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      throw "No token found";
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if (Date.now() >= decodedToken.exp * 1000) {
        throw new Error("Token expired");
      }

      const user = await fetchUserDetails(decodedToken.user_id, token);
      return { token, user };
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      throw "Invalid token";
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An error occurred";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // state.isAuthenticated = true;
        // state.user = action.payload.user;
        // state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An error occurred";
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
