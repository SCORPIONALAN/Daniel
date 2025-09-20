// lib/api.js

export const API_URL = "http://localhost:3003/api";

// endpoints
export const ENDPOINTS = {
  checkAuth: `${API_URL}/usuarios/check`,
  login: `${API_URL}/usuarios/login`,
  logout: `${API_URL}/usuarios/logout`,
  register: `${API_URL}/usuarios/register`
};
