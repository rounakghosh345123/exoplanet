# Exoplanet Candidate Classification

An end-to-end machine learning project for screening Kepler Objects of Interest (KOIs) as likely **Confirmed Exoplanets** or **False Positives** using transit and stellar physics measurements from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/).

The project includes two dashboards:

| Dashboard | Description | Link |
|---|---|---|
| **Streamlit model dashboard** | Python-backed application using the serialized classifier, scaler, and ordered feature list | [Open Streamlit dashboard](https://exoplanet-classification-7bp82btxm5fbmdmiflkxan.streamlit.app/) |
| **Vercel observatory dashboard** | Browser-native futuristic interface built with HTML, CSS, and vanilla JavaScript | [Open Vercel dashboard](https://exoplanet-classification-main.vercel.app/) |

## Project Overview

NASA's Kepler mission identified thousands of transit-like signals. These signals must be assessed to distinguish genuine planetary systems from eclipsing binaries, instrument artifacts, stellar variability, and other false positives.

This project trains a classifier on raw physical measurements rather than NASA's pre-computed false-positive flags. The goal is to create a more honest and generalizable screening model that can help prioritize signals for expert review.

The model is a research and screening aid. A prediction is not an official NASA confirmation and should not replace scientific validation.

## Dataset

- **Source:** NASA Exoplanet Archive — Kepler Objects of Interest Cumulative Table
- **Labels:** `CONFIRMED`, `CANDIDATE`, and `FALSE POSITIVE`
- **Training target:** `CONFIRMED` versus `FALSE POSITIVE`
- **Excluded rows:** `CANDIDATE` rows were excluded from binary training because they remain unresolved
- **Excluded features:** NASA's `koi_fpflag_*` columns were deliberately excluded to avoid target leakage

## Input Features

The classifier uses 11 transit and stellar measurements:

1. Orbital period (`koi_period`)
2. Transit duration (`koi_duration`)
3. Transit depth (`koi_depth`)
4. Planetary radius (`koi_prad`)
5. Equilibrium temperature (`koi_teq`)
6. Insolation flux (`koi_insol`)
7. Transit signal-to-noise ratio (`koi_model_snr`)
8. Stellar effective temperature (`koi_steff`)
9. Stellar surface gravity (`koi_slogg`)
10. Stellar radius (`koi_srad`)
11. Kepler magnitude (`koi_kepmag`)

Missing physical measurements are imputed with medians, and the final feature vector is scaled using the saved preprocessing pipeline.

## Model Results

| Model | Accuracy | F1-Score | ROC-AUC |
|---|---:|---:|---:|
| Logistic Regression | 0.815 | 0.758 | 0.888 |
| Random Forest | 0.928 | 0.902 | 0.975 |
| Tuned XGBoost | **0.940** | **0.940** | **0.980** |

The most influential physical signals in the supplied training analysis are:

- **Planetary radius (`koi_prad`)** — implausibly large radii can indicate eclipsing binaries or other false positives.
- **Transit SNR (`koi_model_snr`)** — weak, noisy signals are harder to distinguish from artifacts.
- **Insolation flux (`koi_insol`)** — extreme radiation values can indicate unusual or implausible orbital configurations.

## Dashboards

### 1. Streamlit model dashboard

The original Python dashboard loads:

- `exoplanet_model.pkl`
- `exoplanet_scaler.pkl`
- `exoplanet_features.pkl`

It applies the same feature ordering and scaling used during training, calls the serialized classifier, and displays the confirmed-planet probability. Signals with probabilities between 0.3 and 0.7 are flagged for manual astronomer review.

**Live link:** [exoplanet-classification-7bp82btxm5fbmdmiflkxan.streamlit.app](https://exoplanet-classification-7bp82btxm5fbmdmiflkxan.streamlit.app/)

### 2. Vercel observatory dashboard

The new dashboard is a static browser interface with a distinct astronomy-console visual style:

- `index.html` — observatory layout and signal controls
- `styles.css` — deep-space styling, orbital graphics, transit visualization, and responsive layout
- `app.js` — interactive inputs, classification states, confidence meter, review flag, and reset controls

It requires no Python, Streamlit, React, or backend server. Since browsers cannot directly execute the supplied Python/XGBoost pickle, the static dashboard contains a lightweight browser-native scoring layer based on the project's physics-driven decision signals. The Streamlit dashboard remains the authoritative serialized-model implementation.

**Live link:** [exoplanet-classification-main.vercel.app](https://exoplanet-classification-main.vercel.app/)

## Repository Structure

```text
.
├── index.html                         # Static Vercel observatory dashboard
├── styles.css                         # Dashboard styling
├── app.js                             # Browser interaction and scoring
├── app.py                             # Streamlit model dashboard
├── exoplanet_model.pkl                # Trained classifier
├── exoplanet_scaler.pkl               # Feature scaler
├── exoplanet_features.pkl             # Ordered model feature names
├── exoplanet_project.ipynb            # Data preparation and modelling workflow
├── data/koi_cumulative.csv            # NASA KOI source data
├── vercel.json                         # Static Vercel deployment config
├── requirements.txt                    # Python dependencies
└── runtime.txt                         # Python runtime version
```

## Run Locally

### Static dashboard

Open `index.html` directly in a browser, or use a local static server:

```bash
npx serve .
```

### Streamlit dashboard

```bash
conda create -n exoplanet python=3.10 -y
conda activate exoplanet
pip install -r requirements.txt
streamlit run app.py
```

### Notebook

```bash
jupyter notebook exoplanet_project.ipynb
```

## Scientific Impact

The tuned model achieved approximately 93.7% accuracy in the supplied evaluation. Using the project’s manual-review probability band of 0.3–0.7, only a small portion of signals would require additional expert review. This demonstrates how a physics-based screening layer could help astronomers prioritize ambiguous cases while preserving human oversight.

## Tech Stack

**Machine learning:** Python, pandas, NumPy, scikit-learn, XGBoost, joblib  
**Original dashboard:** Streamlit  
**Static dashboard:** HTML, CSS, vanilla JavaScript  
**Deployment:** Streamlit Community Cloud and Vercel  
**Data source:** NASA Exoplanet Archive

## Data Attribution

The dataset is sourced from the NASA Exoplanet Archive. Review the archive's usage terms and scientific documentation before using the data or model for research or production decisions.
