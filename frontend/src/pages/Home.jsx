import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity, Brain, ShieldCheck, UserPlus, ClipboardList,
  Sparkles, HeartPulse, Stethoscope, TrendingUp, Search, X,
  FileText, Pill, Utensils, Dumbbell, AlertTriangle, Layers, Network
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function PulseDivider() {
  return (
    <div className="pulse-divider" aria-hidden="true">
      <svg viewBox="0 0 1180 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0" />
            <stop offset="15%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="85%" stopColor="#7C6FF0" />
            <stop offset="100%" stopColor="#7C6FF0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="pulse-line-path"
          d="M0,30 L260,30 L285,30 L300,8 L320,52 L340,30 L370,30 L900,30 L920,30 L935,8 L955,52 L975,30 L1000,30 L1180,30"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/symptoms").then((res) => setAllSymptoms(res.data.symptoms || []));
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allSymptoms
      .filter((s) => !selected.includes(s) && s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, allSymptoms, selected]);

  function addSymptom(s) {
    setSelected([...selected, s]);
    setQuery("");
  }
  function removeSymptom(s) {
    setSelected(selected.filter((x) => x !== s));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (selected.length === 0) {
      setError("Select at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/predict", { symptoms: selected });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to get a prediction.");
      } else {
        setError(err.response?.data?.error || "Prediction failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="hero-stage">
        <div className="hero">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              AI Medical Recommendation Engine
            </span>
            <h1>
              Know what's going on <span className="accent">before you Google it wrong.</span>
            </h1>
            <p className="lead">
              Tell us your symptoms. Our machine learning system checks them against real diagnostic
              patterns, highlights expected disease symptoms, predicts candidate risks, and suggests tailored care.
            </p>
            <div className="hero-ctas">
              <a href="#checker" className="btn-primary">Check my symptoms</a>
              <a href="#how-it-works" className="btn-secondary">See how it works</a>
            </div>
            <p className="disclaimer">
              <ShieldCheck size={15} /> Medical AI decision support tool. Consult a physician for official medical diagnosis.
            </p>
          </motion.div>

          <motion.div
            className="hero-card"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <span className="label">Symptoms selected</span>
            <div className="chip-row">
              <span className="demo-chip">Fever</span>
              <span className="demo-chip">Cough</span>
              <span className="demo-chip">Fatigue</span>
            </div>
            <span className="label">Primary Prediction</span>
            <div className="result-row">
              <div className="ring">
                <div className="ring-inner">85%</div>
              </div>
              <div>
                <h3>Common Cold / Respiratory Care</h3>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                  Random Forest + TF-IDF + Cosine Matching
                </span>
              </div>
            </div>
            <span className="label">Expected Disease Symptoms</span>
            <div className="chip-row" style={{ marginTop: 6 }}>
              <span className="demo-chip" style={{ background: "rgba(255,255,255,0.1)", fontSize: "0.75rem" }}>Chills</span>
              <span className="demo-chip" style={{ background: "rgba(255,255,255,0.1)", fontSize: "0.75rem" }}>Sore Throat</span>
              <span className="demo-chip" style={{ background: "rgba(255,255,255,0.1)", fontSize: "0.75rem" }}>Sneezing</span>
            </div>
            <span className="label" style={{ marginTop: 12 }}>Suggested Next Steps</span>
            <div className="med-pill-row" style={{ marginTop: 6 }}>
              <span className="med-pill">Rest &amp; Hydration</span>
              <span className="med-pill">Symptom Monitoring</span>
            </div>
          </motion.div>
        </div>
      </section>

      <PulseDivider />

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section" id="how-it-works">
        <motion.div
          className="section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <span className="eyebrow">Interactive Workflow</span>
          <h2>Three Steps to Medical Intelligence</h2>
          <p>Structure your symptoms, analyze candidate diseases, and track your personalized history.</p>
        </motion.div>

        <div className="steps-grid">
          {[
            { icon: UserPlus, num: "01", title: "Create Your Account", desc: "A private healthcare profile storing your personal prediction history securely." },
            { icon: ClipboardList, num: "02", title: "Select Symptoms & Vitals", desc: "Choose from 230 tracked clinical symptoms with real-time multi-symptom search." },
            { icon: Brain, num: "03", title: "Multi-Model AI Diagnosis", desc: "Receive primary prediction, top 3 candidate diseases, expected symptoms, and risk level." },
          ].map((s, i) => (
            <motion.div
              key={s.num}
              className="step-card glass"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <s.icon size={26} color="var(--primary)" style={{ marginBottom: 14 }} />
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PulseDivider />

      {/* ---------------- SYMPTOM CHECKER (functional) ---------------- */}
      <section className="section" id="checker">
        <motion.div
          className="section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <span className="eyebrow"><Activity size={13} style={{ marginRight: 4 }} />Live Diagnostic Engine</span>
          <h2>Check Your Symptoms &amp; Get Medical Insights</h2>
          <p>Select what you're feeling to view predictions, expected disease symptoms, and top candidate risks.</p>
        </motion.div>

        <motion.div
          className="checker-wrap glass"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
        >
          <form className="checker-form" onSubmit={handleSubmit}>
            <h3>Symptom Checker</h3>
            <p>Search and select every symptom — {allSymptoms.length || "230"} tracked conditions.</p>

            <span className="field-label">Search Symptoms</span>
            <div className="symptom-search">
              <Search size={17} className="symptom-search-icon" />
              <input
                type="text"
                placeholder="e.g. fever, chest pain, pain during pregnancy..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="symptom-suggestions">
                  {suggestions.map((s) => (
                    <button type="button" key={s} onClick={() => addSymptom(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="field-label" style={{ marginTop: 20 }}>
              Selected Symptoms ({selected.length})
            </span>
            <div className="symptom-grid">
              {selected.length === 0 && (
                <span style={{ color: "var(--ink-faint)", fontSize: "0.88rem" }}>
                  No symptoms selected — search above to add your symptoms.
                </span>
              )}
              {selected.map((s) => (
                <button
                  type="button"
                  key={s}
                  className="symptom active"
                  onClick={() => removeSymptom(s)}
                >
                  {s} <X size={13} style={{ marginLeft: 4 }} />
                </button>
              ))}
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? "Analyzing Medical Data..." : user ? "Get Prediction" : "Log in to Get Prediction"}
            </button>

            {error && <p className="predict-error">{error}</p>}
            {!user && (
              <p style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--ink-faint)" }}>
                Don't have an account? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up free</Link>
              </p>
            )}
          </form>

          <div className={result ? "checker-result glass" : "checker-result empty glass"}>
            {!result && (
              <>
                <HeartPulse size={44} style={{ opacity: 0.6, marginBottom: 10 }} />
                <p style={{ fontWeight: 500 }}>Your diagnostic prediction and disease symptoms will appear here.</p>
              </>
            )}
            {result && (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="field-label">Primary AI Prediction</span>
                  <span className={`risk-badge risk-${result.risk}`} style={{ fontWeight: 700, padding: "4px 10px", borderRadius: 12, fontSize: "0.78rem", textTransform: "uppercase" }}>
                    {result.risk} Risk
                  </span>
                </div>
                
                <h3 className="result-disease" style={{ fontSize: "1.5rem", marginTop: 4, textTransform: "capitalize" }}>
                  {result.disease}
                </h3>
                
                <div className="result-meta" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>{result.confidence}% Confidence</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>Random Forest + TF-IDF Model</span>
                </div>

                <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 16 }}>
                  {result.description}
                </p>

                {/* --- EXPECTED DISEASE SYMPTOMS SECTION --- */}
                {result.disease_symptoms?.length > 0 && (
                  <div className="result-block" style={{ background: "rgba(29, 78, 216, 0.06)", padding: "12px 14px", borderRadius: 10, borderLeft: "4px solid var(--primary)", marginBottom: 16 }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.92rem", margin: "0 0 8px 0" }}>
                      <Activity size={15} color="var(--primary)" /> Expected Symptoms for {result.disease}:
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.disease_symptoms.map((sym, i) => (
                        <span key={i} style={{ background: "var(--surface)", border: "1px solid rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 12, fontSize: "0.8rem", textTransform: "capitalize" }}>
                          • {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- TOP 3 CANDIDATE DIAGNOSES --- */}
                {result.top_candidates?.length > 1 && (
                  <div className="result-block" style={{ marginBottom: 16 }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", marginBottom: 8 }}>
                      <Layers size={15} /> Top Candidate Diagnoses:
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {result.top_candidates.map((cand, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 6 }}>
                          <span style={{ textTransform: "capitalize" }}>{i + 1}. {cand.disease}</span>
                          <span style={{ fontWeight: 600 }}>{cand.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- PRECAUTIONS & MEDICATIONS --- */}
                <div className="result-block">
                  <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={15} /> Precautions</h4>
                  <ul>{result.precautions.map((m, i) => <li key={i}>{m}</li>)}</ul>
                </div>

                <div className="result-block">
                  <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}><Pill size={15} /> Suggested Medications</h4>
                  <ul>{result.medications.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>

                {result.diet?.length > 0 && (
                  <div className="result-block">
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}><Utensils size={15} /> Recommended Diet</h4>
                    <ul>{result.diet.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                )}

                {result.workout?.length > 0 && (
                  <div className="result-block">
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}><Dumbbell size={15} /> Recommended Activity</h4>
                    <ul>{result.workout.map((w, i) => <li key={i}>{w}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      <PulseDivider />

      {/* ---------------- WHY PERSONALIZED ---------------- */}
      <section className="section">
        <motion.div
          className="section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <span className="eyebrow"><Sparkles size={13} style={{ marginRight: 4 }} />Personalized AI History</span>
          <h2>It Remembers, so It Gets Sharper Over Time</h2>
          <p>Every check is saved to your private profile history. Health patterns across visits provide deep medical context.</p>
        </motion.div>

        <motion.div
          className="timeline"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
        >
          <div className="timeline-item">
            <div className="timeline-dot"><Stethoscope size={18} /></div>
            <div className="timeline-content">
              <div className="t-title">First Check-in Logged</div>
              <div className="t-desc">Symptom selection saved with local timestamp &amp; risk rating.</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"><Activity size={18} /></div>
            <div className="timeline-content">
              <div className="t-title">Follow-up Analysis</div>
              <div className="t-desc">Symptom progression tracked against previous diagnostic records.</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"><TrendingUp size={18} /></div>
            <div className="timeline-content">
              <div className="t-title">Personalized Recommendation Matrix</div>
              <div className="t-desc">SVD Collaborative Filtering + Content-Based TF-IDF matching tailors care.</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="site-footer">
        <span className="brand">MediCare AI</span>
        <span className="footer-note">Frontend: React · Backend: Flask · ML: scikit-learn &amp; Keras</span>
      </footer>
    </div>
  );
}
