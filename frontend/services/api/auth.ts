import api from "./index";

export const login = async (username: string, password: string) => {
  const res = await api.post("/login", {
    username,
    password,
  });

  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};