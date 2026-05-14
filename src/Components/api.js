const BASE_URL = "https://crainoai.runasp.net";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // =========================
    // 401 Unauthorized
    // =========================
    if (res.status === 401) {
      console.log("401 on endpoint:", endpoint);
      console.error("Unauthorized - login again");
      localStorage.removeItem("token");
      window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    // =========================
    // قراءة الرد (حتى لو فاضي)
    // =========================

    const text = await res.text();

    // لو الرد فاضي، ومش OK، نرمي خطأ بالـ status
    if (!text && !res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Response is not JSON:", text, err);
        throw new Error("Invalid JSON response from server");
      }
    }

    if (!res.ok) {
      throw new Error(
        data?.message || `Request failed with status ${res.status}`,
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

export default BASE_URL;
