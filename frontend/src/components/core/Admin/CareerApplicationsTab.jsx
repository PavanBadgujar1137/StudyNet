import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FiBriefcase,
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiExternalLink,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiX,
  FiMessageSquare,
  FiUser,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiFileText
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  getAllCareerApplications,
  updateCareerApplicationStatus,
  deleteCareerApplication,
} from "../../../services/operations/careerAPI";

const STATUS_COLORS = {
  New: { bg: "#EDE9FE", text: "#7C3AED", border: "#DDD6FE" },
  "In Review": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  Shortlisted: { bg: "#DBEAFE", text: "#2563EB", border: "#BFDBFE" },
  Interviewing: { bg: "#E0F2FE", text: "#0284C7", border: "#BAE6FD" },
  Hired: { bg: "#D1FAE5", text: "#059669", border: "#A7F3D0" },
  Rejected: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
};

export default function CareerApplicationsTab() {
  const { token } = useSelector((s) => s.auth);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inReview: 0,
    shortlisted: 0,
    interviewing: 0,
    rejected: 0,
    hired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "All") params.status = statusFilter;
      if (roleFilter !== "All") params.jobTitle = roleFilter;

      const data = await getAllCareerApplications(token, params);
      if (data?.success) {
        setApplications(data.applications || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("fetchApplications error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateCareerApplicationStatus(token, appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      await updateCareerApplicationStatus(
        token,
        selectedApp._id,
        selectedApp.status,
        adminNotes
      );
      setSelectedApp((prev) => ({ ...prev, adminNotes }));
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? { ...a, adminNotes } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const promptDelete = (app, e) => {
    e?.stopPropagation();
    setAppToDelete(app);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setDeleting(true);
    try {
      await deleteCareerApplication(token, appToDelete._id);
      setApplications((prev) => prev.filter((a) => a._id !== appToDelete._id));
      if (selectedApp?._id === appToDelete._id) setSelectedApp(null);
      setAppToDelete(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const openDetails = (app) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || "");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── KPI STATS CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Total Applications", value: stats.total, color: "#4F46E5", bg: "#EEF2FF" },
          { label: "New Candidates", value: stats.new, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "In Review", value: stats.inReview, color: "#D97706", bg: "#FFFBEB" },
          { label: "Shortlisted", value: stats.shortlisted, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Interviewing", value: stats.interviewing, color: "#0284C7", bg: "#F0F9FF" },
          { label: "Hired", value: stats.hired, color: "#059669", bg: "#ECFDF5" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "18px 20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {kpi.label}
              </div>
              <div style={{ color: "#0F172A", fontSize: 26, fontWeight: 800, marginTop: 4 }}>
                {kpi.value}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: kpi.bg,
                color: kpi.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <FiBriefcase />
            </div>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR: SEARCH & FILTERS ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "16px 20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: 280, flex: "1 1 300px" }}>
          <FiSearch
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              fontSize: 16,
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, email, phone, company..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              fontSize: 13,
              color: "#0F172A",
              outline: "none",
            }}
          />
        </div>

        {/* Filters and Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              fontSize: 13,
              color: "#0F172A",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="All">All Roles</option>
            <option value="Practitioner Success Associate">Practitioner Success</option>
            <option value="Community & Growth Manager">Community & Growth</option>
            <option value="Head – Practitioner Experience & Partnerships">Head – Partnerships</option>
            <option value="General / Open Application">Open Application</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              fontSize: 13,
              color: "#0F172A",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchApplications}
            title="Refresh list"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── APPLICATIONS TABLE ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Applicant</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Role Applied</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Experience & Org</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Resume & Links</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Applied On</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <FiRefreshCw className="animate-spin" />
                      Loading applications...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>No career applications found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      Applications submitted via the Careers page will appear here instantly.
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const statusStyle = STATUS_COLORS[app.status] || STATUS_COLORS.New;
                  return (
                    <tr
                      key={app._id}
                      onClick={() => openDetails(app)}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Candidate Name & Info */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                              color: "#FFF",
                              fontWeight: 800,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {app.fullName?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>{app.fullName}</div>
                            <div style={{ color: "#64748B", fontSize: 11, display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                              <span>{app.email}</span>
                              {app.phone && <span>• {app.phone}</span>}
                              {app.city && <span>• {app.city}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Applied */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{app.jobTitle}</div>
                        <div style={{ color: "#7C3AED", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                          {app.expertise}
                        </div>
                      </td>

                      {/* Experience & Company */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>
                          {app.experience} {Number(app.experience) === 1 ? "Year" : "Years"}
                        </div>
                        <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>
                          {app.currentOrg || "Fresher / Unspecified"}
                        </div>
                      </td>

                      {/* Resume & Links */}
                      <td style={{ padding: "14px 18px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "#EFF6FF",
                                color: "#2563EB",
                                fontSize: 11,
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              <FiDownload size={12} />
                              <span>Resume</span>
                            </a>
                          ) : app.resumeName ? (
                            <span style={{ fontSize: 11, color: "#64748B" }}>📄 {app.resumeName}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#94A3B8" }}>No file</span>
                          )}

                          {app.linkedin && (
                            <a
                              href={app.linkedin.startsWith("http") ? app.linkedin : `https://${app.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              title="LinkedIn Profile"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                color: "#0A66C2",
                                fontSize: 13,
                              }}
                            >
                              <FiExternalLink />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "14px 18px", color: "#64748B", fontSize: 12 }}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "—"}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px" }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="New">New</option>
                          <option value="In Review">In Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            onClick={() => openDetails(app)}
                            title="View Full Profile"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#F1F5F9",
                              border: "none",
                              color: "#475569",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={(e) => promptDelete(app, e)}
                            title="Delete Application"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#FEE2E2",
                              border: "none",
                              color: "#DC2626",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── APPLICANT DETAILS MODAL ── */}
      {selectedApp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              background: "#FFFFFF",
              borderRadius: 24,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    color: "#FFF",
                    fontSize: 20,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedApp.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0F172A" }}>
                    {selectedApp.fullName}
                  </h2>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    Applied for: <strong style={{ color: "#2563EB" }}>{selectedApp.jobTitle}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: (STATUS_COLORS[selectedApp.status] || STATUS_COLORS.New).bg,
                    color: (STATUS_COLORS[selectedApp.status] || STATUS_COLORS.New).text,
                    border: `1px solid ${(STATUS_COLORS[selectedApp.status] || STATUS_COLORS.New).border}`,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="New">New</option>
                  <option value="In Review">In Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setSelectedApp(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#E2E8F0",
                    border: "none",
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Contact & Meta Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Email</div>
                  <div style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    <a href={`mailto:${selectedApp.email}`} style={{ color: "#2563EB", textDecoration: "none" }}>
                      {selectedApp.email}
                    </a>
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Phone Number</div>
                  <div style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    <a href={`tel:${selectedApp.phone}`} style={{ color: "#2563EB", textDecoration: "none" }}>
                      {selectedApp.phone}
                    </a>
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Location</div>
                  <div style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    {selectedApp.city || "Not provided"}
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Experience</div>
                  <div style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    {selectedApp.experience} Years ({selectedApp.currentOrg || "Fresher"})
                  </div>
                </div>
              </div>

              {/* External Profile Links */}
              {(selectedApp.linkedin || selectedApp.portfolio) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {selectedApp.linkedin && (
                    <a
                      href={selectedApp.linkedin.startsWith("http") ? selectedApp.linkedin : `https://${selectedApp.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 10,
                        background: "#0A66C2",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <FiExternalLink />
                      <span>View LinkedIn Profile</span>
                    </a>
                  )}
                  {selectedApp.portfolio && (
                    <a
                      href={selectedApp.portfolio.startsWith("http") ? selectedApp.portfolio : `https://${selectedApp.portfolio}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 10,
                        background: "#F1F5F9",
                        color: "#0F172A",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        border: "1px solid #CBD5E1",
                      }}
                    >
                      <FiExternalLink />
                      <span>View Portfolio / Website</span>
                    </a>
                  )}
                </div>
              )}

              {/* Dedicated Resume / CV Card */}
              <div
                style={{
                  background: "#F8FAFC",
                  padding: "16px 20px",
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <FiFileText size={15} style={{ color: "#7C3AED" }} />
                    <span>Resume / CV</span>
                  </span>
                  {selectedApp.resumeUrl ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#15803D",
                        background: "#DCFCE7",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontWeight: 700,
                      }}
                    >
                      Attached
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#B45309",
                        background: "#FEF3C7",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      {selectedApp.resumeName ? "File Name Only" : "Not Provided"}
                    </span>
                  )}
                </div>

                {selectedApp.resumeUrl ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#FFFFFF",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: "#EEF2FF",
                          color: "#4F46E5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        📄
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                          {selectedApp.resumeName || "Candidate_Resume.pdf"}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          Uploaded document • Click button to view or download
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a
                        href={selectedApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 10,
                          background: "#2563EB",
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                        }}
                      >
                        <FiDownload size={14} />
                        <span>Download Resume</span>
                      </a>
                      <a
                        href={selectedApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 14px",
                          borderRadius: 10,
                          background: "#F1F5F9",
                          color: "#334155",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <FiExternalLink size={14} />
                        <span>Open In Tab</span>
                      </a>
                    </div>
                  </div>
                ) : selectedApp.resumeName ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#FFFFFF",
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                        {selectedApp.resumeName}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                        File name recorded during application
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "#FFFBEB",
                      border: "1px dashed #FCD34D",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#92400E" }}>
                      No resume file was attached with this application.
                    </span>
                  </div>
                )}
              </div>

              {/* Cover Note / Why OpenHand? */}
              <div style={{ background: "#F8FAFC", padding: "18px 20px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                <div style={{ color: "#475569", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Why OpenHand? / Candidate Statement
                </div>
                <div style={{ color: "#1E293B", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selectedApp.coverNote || "No cover note provided."}
                </div>
              </div>

              {/* Admin Evaluation Notes */}
              <div>
                <label style={{ display: "block", color: "#475569", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add evaluation comments, interview feedback, or next steps..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    fontSize: 13,
                    color: "#0F172A",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      background: "#0F172A",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {savingNotes ? "Saving Notes..." : "Save Notes"}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
              }}
            >
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                Submitted: {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString("en-IN") : "—"}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => promptDelete(selectedApp, e)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete Application
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* ── CUSTOM DELETE CONFIRMATION MODAL ── */}
      {appToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: 16,
          }}
          onClick={() => !deleting && setAppToDelete(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              maxWidth: 440,
              width: "100%",
              padding: "28px 24px 22px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              textAlign: "center",
              border: "1px solid #F1F5F9",
              animation: "fadeIn 0.15s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
                border: "4px solid #FEF2F2",
              }}
            >
              <FiAlertTriangle />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>
              Delete Application?
            </h3>

            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px", lineHeight: 1.6 }}>
              Are you sure you want to permanently delete the application for{" "}
              <strong style={{ color: "#0F172A" }}>{appToDelete.fullName}</strong> applied for{" "}
              <span style={{ color: "#7C3AED", fontWeight: 600 }}>{appToDelete.jobTitle}</span>? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                disabled={deleting}
                onClick={() => setAppToDelete(null)}
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: 12,
                  background: "#F1F5F9",
                  color: "#475569",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: 12,
                  background: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: deleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
              >
                <FiTrash2 size={15} />
                <span>{deleting ? "Deleting..." : "Delete Application"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
