// import axios, {
//   AxiosInstance,
// } from "axios";
// import toast from "react-hot-toast";

// export const axiosInstance: AxiosInstance = axios.create({
//   baseURL:
//     process.env.NODE_ENV == "development"
//       ? process.env.LOCAL_APIGATEWAY_URL
//       : process.env.PRODUCT_APIGATEWAY_URL,
//   timeout: 10 * 1000,
//   withCredentials: true,
// });

// const refreshInstance = axios.create({
//   baseURL:
//     process.env.NODE_ENV === "development"
//       ? process.env.LOCAL_APIGATEWAY_URL
//       : process.env.PRODUCT_APIGATEWAY_URL,
//   withCredentials: true,
// });

// // Request Interceptor

// // Add a request interceptor
// axiosInstance.interceptors.request.use(
//   function (config) {
//     console.log("Request from instance:", config.url);
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // If token is expired and not already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Try to refresh token
//         await refreshInstance.get("/auth/refresh", { withCredentials: true });

//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         toast.error("Session expired. Please log in again.");

//         localStorage.clear();
//           window.location.href = "/signIn";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios, { AxiosInstance } from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV == "development"
      ? process.env.LOCAL_APIGATEWAY_URL
      : process.env.PRODUCT_APIGATEWAY_URL,
  timeout: 10 * 1000,
  withCredentials: true,
});

const refreshInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_APIGATEWAY_URL
      : process.env.PRODUCT_APIGATEWAY_URL,
  withCredentials: true,
});

// Request Interceptor

axiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If refresh failed at NextAuth level
    if (error.response?.status === 401) {
      // Destroy session and redirect to sign-in
      localStorage.clear();
      toast.error("Session expired. Please log in again.");
      window.location.href = "/signIn";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
