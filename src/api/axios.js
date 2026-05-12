import axios from "axios";

const api = axios.create({
  baseURL: "http://k8s-miniproj-appingre-81c01d55c9-1855530779.ap-northeast-2.elb.amazonaws.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;