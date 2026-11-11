import streamlit as st
import pandas as pd
import numpy as np
import joblib

model = joblib.load('exoplanet_model.pkl')
scaler = joblib.load('exoplanet_scaler.pkl')
model_features = joblib.load('exoplanet_features.pkl')

st.set_page_config(page_title="Exoplanet Classifier", page_icon="🔭")
st.title("🔭 Exoplanet Candidate Classifier")
st.write(
    "Classifies a Kepler mission signal as a likely **Confirmed Exoplanet** or **False Positive**, "
    "using real transit and stellar physics measurements — replicating the same task NASA's own "
    "vetting pipelines perform."
)

st.subheader("Transit & Stellar Measurements")

col1, col2 = st.columns(2)

with col1:
    koi_period = st.number_input("Orbital Period (days)", 0.1, 1000.0, 10.0)
    koi_duration = st.number_input("Transit Duration (hours)", 0.1, 50.0, 4.0)
    koi_depth = st.number_input("Transit Depth (ppm)", 1.0, 100000.0, 500.0)
    koi_prad = st.number_input("Planetary Radius (Earth radii)", 0.1, 50.0, 2.0)
    koi_teq = st.number_input("Equilibrium Temperature (K)", 100, 3000, 500)
    koi_insol = st.number_input("Insolation Flux (Earth flux units)", 0.0, 5000.0, 100.0)

with col2:
    koi_model_snr = st.number_input("Transit Signal-to-Noise Ratio", 1.0, 200.0, 20.0)
    koi_steff = st.number_input("Stellar Effective Temperature (K)", 2000, 10000, 5500)
    koi_slogg = st.number_input("Stellar Surface Gravity (log g)", 2.0, 5.5, 4.4)
    koi_srad = st.number_input("Stellar Radius (solar radii)", 0.1, 20.0, 1.0)
    koi_kepmag = st.number_input("Kepler Magnitude (brightness)", 5.0, 20.0, 14.0)

input_features = pd.DataFrame([{
    'koi_period': koi_period,
    'koi_duration': koi_duration,
    'koi_depth': koi_depth,
    'koi_prad': koi_prad,
    'koi_teq': koi_teq,
    'koi_insol': koi_insol,
    'koi_model_snr': koi_model_snr,
    'koi_steff': koi_steff,
    'koi_slogg': koi_slogg,
    'koi_srad': koi_srad,
    'koi_kepmag': koi_kepmag,
}])[model_features]

scaled_input = scaler.transform(input_features)

if st.button("Classify Signal"):
    prediction = model.predict(scaled_input)[0]
    proba = model.predict_proba(scaled_input)[0][1]

    st.subheader("Classification Result")

    if prediction == 1:
        st.success(f"🪐 Likely CONFIRMED EXOPLANET — {proba*100:.1f}% confidence")
    else:
        st.error(f"❌ Likely FALSE POSITIVE — {(1-proba)*100:.1f}% confidence")

    st.metric("Confirmed-Planet Probability", f"{proba*100:.1f}%")
    st.progress(float(proba))

    if 0.3 < proba < 0.7:
        st.warning("⚠️ Low-confidence prediction — this candidate would be flagged for manual astronomer review.")

    with st.expander("See the measurements used"):
        st.write(f"Orbital Period: {koi_period} days")
        st.write(f"Transit Duration: {koi_duration} hours")
        st.write(f"Transit Depth: {koi_depth} ppm")
        st.write(f"Planetary Radius: {koi_prad} Earth radii")
        st.write(f"Signal-to-Noise Ratio: {koi_model_snr}")
