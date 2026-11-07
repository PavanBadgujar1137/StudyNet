import { apiConnector } from "../apiConnector";
import { careerEndpoints } from "../apis";
import { toast } from "react-hot-toast";

const {
  APPLY_CAREER_API,
  GET_ALL_APPLICATIONS_API,
  UPDATE_APPLICATION_STATUS_API,
  DELETE_APPLICATION_API,
} = careerEndpoints;

// ── Submit Career Application ──────────────────────────────────────────
export const submitCareerApplication = async (formData) => {
  const toastId = toast.loading("Submitting application...");
  try {
    const isFormData = formData instanceof FormData;
    const headers = isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    const response = await apiConnector("POST", APPLY_CAREER_API, formData, headers);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to submit application");
    }

    toast.success("Application submitted successfully! Our team will get in touch.", {
      id: toastId,
    });
    return response.data;
  } catch (error) {
    console.error("submitCareerApplication error:", error);
    const msg = error?.response?.data?.message || error?.message || "Failed to submit application";
    toast.error(msg, { id: toastId });
    throw error;
  }
};

// ── Get All Career Applications (Admin) ────────────────────────────────
export const getAllCareerApplications = async (token, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${GET_ALL_APPLICATIONS_API}?${query}` : GET_ALL_APPLICATIONS_API;

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load applications");
    }

    return response.data;
  } catch (error) {
    console.error("getAllCareerApplications error:", error);
    toast.error(error?.response?.data?.message || "Failed to load applications");
    throw error;
  }
};

// ── Update Application Status (Admin) ──────────────────────────────────
export const updateCareerApplicationStatus = async (token, id, status, adminNotes) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_APPLICATION_STATUS_API}/${id}/status`,
      { status, adminNotes },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to update status");
    }

    toast.success("Application updated successfully");
    return response.data;
  } catch (error) {
    console.error("updateCareerApplicationStatus error:", error);
    toast.error(error?.response?.data?.message || "Failed to update application");
    throw error;
  }
};

// ── Delete Application (Admin) ─────────────────────────────────────────
export const deleteCareerApplication = async (token, id) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_APPLICATION_API}/${id}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete application");
    }

    toast.success("Application deleted");
    return response.data;
  } catch (error) {
    console.error("deleteCareerApplication error:", error);
    toast.error(error?.response?.data?.message || "Failed to delete application");
    throw error;
  }
};
