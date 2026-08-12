import { useEffect, useState } from "react";
import { Activity, Clock, ShieldCheck, Pill, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/history")
      .then((res) => setHistory(res.data.history || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading" style={{ padding: "40px 0", textAlign: "center" }}>Loading your personal healthcare history...</div>;

  return (
    <div className="dashboard-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>Your Personal Prediction History</h1>
        <p style={{ color: "var(--ink-soft)" }}>Comprehensive log of all AI diagnostic checks, symptoms, and health risk assessments.</p>
      </div>

      {history.length === 0 ? (
        <div className="glass" style={{ padding: 30, textAlign: "center", borderRadius: 12 }}>
          <p style={{ color: "var(--ink-soft)" }}>No predictions yet — try checking symptoms on the home page.</p>
        </div>
      ) : (
        <div className="history-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {history.map((h) => (
            <div className="history-card glass" key={h.id} style={{ padding: 20, borderRadius: 14, borderLeft: `5px solid ${h.risk_level === 'high' ? '#EF4444' : h.risk_level === 'medium' ? '#F59E0B' : '#10B981'}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <h3 style={{ textTransform: "capitalize", fontSize: "1.25rem", margin: "0 0 4px 0" }}>{h.predicted_disease}</h3>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: "0.85rem", color: "var(--ink-faint)" }}>
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>Confidence: {h.confidence}%</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> {new Date(h.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`risk-badge risk-${h.risk_level}`} style={{ textTransform: "uppercase", padding: "4px 12px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 700 }}>
                  {h.risk_level} Risk
                </span>
              </div>

              {/* User Input Symptoms */}
              {h.symptoms_input?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-faint)", fontWeight: 600 }}>Submitted Symptoms:</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {h.symptoms_input.map((s, idx) => (
                      <span key={idx} style={{ background: "rgba(29, 78, 216, 0.12)", color: "var(--primary)", padding: "2px 10px", borderRadius: 12, fontSize: "0.78rem" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice / Precautions */}
              {h.advice?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
                    <ShieldCheck size={14} color="var(--primary)" /> Care Guidance:
                  </div>
                  <div style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {h.advice.join(" • ")}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
