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
    return res;
  },

  signOut: async () => {
    const res = await api.post(
      `/${apiVersion}/auth/logout`,
      {},
      { withCredentials: true }
    );

    return res.data;
  },
};
