# Gulf Watch

## Platform
Web app, public, responsive, embeddable with iframe. Confirmed by the user.

## Purpose
Show daily wave/wind model forecasts and preliminary daily relative screening for sea turbidity and plankton blooms in the Thai marine EEZ in the Gulf of Thailand and Andaman Sea, using public satellite ocean colour and weather/marine forecasts. Refresh the underlying sources and computation daily while the page is closed.

## Evidence and constraints
Existing analysis is in ../marine_20261010_15. No field calibration. Risk colours are relative screening classes, never event probabilities, harmful-species identification, NTU, or navigation guidance. River observations are upstream snapshot context; uncalibrated freshwater model totals must not drive the colours. Never relabel old observations as current. Keep the last successful publication on refresh failures and expose data age and update status.

## Users
The requesting Thai-speaking user and public website visitors. Their specific profession is not supplied.

## Stack
Next.js / React on Vercel. GitHub Actions fetches and validates public ocean, weather and river data daily, preserving the last success on failure. The public API reads versioned GitHub data without redeployment. No database or personal API secrets required.


