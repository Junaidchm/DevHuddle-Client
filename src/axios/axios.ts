import axios, {
  AxiosInstance,
} from "axios";
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

// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    console.log("Request from instance:", config.url);
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Everything is fine, just return
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token is expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await refreshInstance.get("/auth/refresh", { withCredentials: true });

        // Retry the original request again
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        // Redirect to login if refresh fails
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/signIn";
        }, 1500);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // other errors
  }
);

export default axiosInstance;
