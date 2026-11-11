const fields = ["period", "duration", "depth", "prad", "teq", "insol", "snr", "steff", "slogg", "srad", "kepmag"];
const $ = (id) => document.getElementById(id);

function readSignal() {
  return Object.fromEntries(fields.map((id) => [id, Number($(id).value)]));
}

/*
 * The supplied classifier is a Python/XGBoost pickle and cannot run in a
 * browser without a server. This browser-only score mirrors the project's
 * physics-driven decision signals and keeps the UI usable as a static site.
 */
function estimateConfirmedProbability(signal) {
  let score = 0.48;
  score += Math.min(0.28, Math.max(-0.2, (signal.prad < 5 ? (5 - signal.prad) * 0.055 : (5 - signal.prad) * 0.035)));
  score += Math.min(0.2, Math.max(-0.16, (signal.snr - 18) * 0.006));
  score += Math.min(0.16, Math.max(-0.15, (signal.insol < 500 ? (80 - Math.abs(Math.log10(Math.max(signal.insol, 0.1)))) * 0.0015 : -0.12)));
  score += Math.min(0.1, Math.max(-0.1, (signal.depth < 5000 ? 0.06 : -0.12)));
  score += Math.min(0.08, Math.max(-0.08, (signal.prad <= 3 ? 0.05 : -0.08)));
  score += Math.min(0.05, Math.max(-0.05, (signal.slogg - 3.8) * 0.04));
  return Math.max(0.004, Math.min(0.996, score));
}

function render() {
  const probability = estimateConfirmedProbability(readSignal());
  const percentage = (probability * 100).toFixed(1);
  const confirmed = probability >= 0.5;
  const uncertain = probability > 0.3 && probability < 0.7;
  $("probabilityValue").textContent = `${percentage}%`;
  $("probabilityBar").style.width = `${percentage}%`;
  $("verdict").textContent = confirmed ? "LIKELY CONFIRMED" : "LIKELY FALSE POSITIVE";
  $("verdict").style.color = confirmed ? "var(--green)" : "var(--red)";
  $("verdictDetail").textContent = confirmed
    ? "Signal profile is consistent with a planetary transit."
    : "Signal profile is more consistent with noise or a stellar false positive.";
  $("reviewFlag").className = `review-flag${uncertain ? " review" : ""}`;
  $("reviewFlag").innerHTML = uncertain
    ? "<span>⚠</span><div><b>MANUAL REVIEW ADVISED</b><small>Probability falls inside the astronomer review zone.</small></div>"
    : confirmed
      ? "<span>✦</span><div><b>HIGH CONFIDENCE</b><small>Automated screening can proceed.</small></div>"
      : "<span>×</span><div><b>LOW PLANETARY SIGNAL</b><small>Candidate should be reviewed as a likely false positive.</small></div>";
  $("reviewFlag").style.color = uncertain ? "var(--amber)" : confirmed ? "var(--green)" : "var(--red)";
  $("reviewFlag").style.background = uncertain ? "rgba(255,197,110,.08)" : confirmed ? "rgba(115,232,174,.08)" : "rgba(255,117,139,.08)";
  $("actionNote").textContent = `UPDATED // ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

fields.forEach((id) => $(id).addEventListener("input", () => render()));
$("classifyButton").addEventListener("click", () => {
  render();
  $("verdict").animate([{ opacity: 0.2, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 400, easing: "ease-out" });
});
$("resetButton").addEventListener("click", () => {
  const defaults = { period: 10, duration: 4, depth: 500, prad: 2, teq: 500, insol: 100, snr: 20, steff: 5500, slogg: 4.4, srad: 1, kepmag: 14 };
  Object.entries(defaults).forEach(([id, value]) => { $(id).value = value; });
  render();
  $("actionNote").textContent = "NEW SIGNAL // DEFAULTS LOADED";
});
render();
