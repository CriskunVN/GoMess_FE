import api from "@/lib/axios";
const apiVersion = "api/v1";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    displayName: string
  ) => {
    const res = await api.post(
      `/${apiVersion}/auth/register`,
      {
        username,
        password,
        email,
        displayName,
      },
      { withCredentials: true }
    );

    return res.data;
  },

  login: async (username: string, password: string) => {
    const res = await api.post(
      `/${apiVersion}/auth/login`,
      {
        username,
        password,
      },
      { withCredentials: true }
    );
    return res.data;
  },

  signOut: async () => {
    const res = await api.post(
      `/${apiVersion}/auth/logout`,
      {},
      { withCredentials: true }
    );

    return res.data;
  },

  fetchMe: async () => {
    const res = await api.get(`/${apiVersion}/users/me`, {
      withCredentials: true,
    });

    return res.data.data.user;
  },

  refresh: async () => {
    const res = await api.post(
      `/${apiVersion}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return res.data.accessToken;
  },

  test: async () => {
    const res = await api.get(`/${apiVersion}/auth/test`, {
      withCredentials: true,
    });
    return res.data;
  },
};
