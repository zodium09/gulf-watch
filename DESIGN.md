---
name: Gulf Watch
description: A bright Thai marine atlas for the general public.
colors:
  ink: "#163f54"
  muted: "#526c7b"
  teal: "#007c87"
  ocean: "#096eac"
  paper: "#f0f7fa"
  surface: "#ffffff"
  line: "#d5e5eb"
  sea: "#d8f2f8"
  land: "#f7faf1"
  wave-surface: "#def0fc"
  wind-surface: "#daf3ed"
  rain-surface: "#eee9fa"
  sst-surface: "#ffeddc"
  no-data: "#d4dfe0"
  focus: "#cf7d15"
typography:
  display:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "42px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-1px"
  title:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  measurement:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  surface: "16px"
  metric: "12px"
  control: "9px"
  selection: "7px"
spacing:
  desktop-gutter: "44px"
  mobile-gutter: "16px"
  metric-gap: "14px"
  inspector: "23px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  workspace:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
  wave-metric:
    backgroundColor: "{colors.wave-surface}"
    rounded: "{rounded.metric}"
    padding: "19px 22px 16px"
---

# Design System: Gulf Watch

## Overview

**Creative North Star: "A Marine Atlas for Everyone"**

Bright ocean blue and turquoise make the Thai public dashboard approachable, while white working panels keep measurements and explanations readable. This replaces the earlier quiet coastal desk identity under the user's redesign request. Locally hosted Thai type, physical units, observed dates, and missing-data states remain binding product constraints.

**Key Characteristics:**
- Map and point inspector form one working surface.
- Four tinted measurement buttons distinguish wave, wind, rain, and sea temperature.
- Interactive dates and charts share the selected point and day.
- Technical methods remain available through readable disclosures.

Code and captured desktop/mobile output are the evidence. No approved image comp or automated design-detector certification is claimed.

## Colors

### Primary
Ocean carries the masthead; teal carries actions and selected controls. Avoid interpreting interface accents as hazard classes.

### Secondary
Wave blue, wind mint, rain lavender, and temperature apricot identify physical variables. Rain, SST, and activity map layers have their own five-bin palettes in `lib/display.mjs`; shared screening colours are reused by the ecosystem overview.

### Neutral
Marine ink and muted blue-grey sit on cool paper and white panels. Pale sea and warm light land support the geographic view. Grey means missing observations, never a low class.

**The Evidence Colour Rule.** Every map colour must retain its layer-specific legend, unit or class label, and source context. Activity labels include words as well as colour.

## Typography

IBM Plex Sans Thai is served locally with a sans-serif fallback. Use tabular numerals for physical measurements and tables; monospace is reserved for iframe HTML.

The display is (46px) above (1450px), (36px) at or below (1190px), (34px) on phones, and (30px) below (360px). Secondary metadata uses observed compact (10–12px) roles; these are not a recommended universal body size. Method paragraphs use (12px), line height (1.95), and a maximum (75ch) measure.

## Layout

The page is capped at (1568px). Desktop gutter is (44px), reducing to (25px) below (1190px) and (16px) below (760px). The map/inspector grid has a (325px) inspector, then (285px) and (265px) at the (1190px)/(900px) breakpoints. Below (760px), the inspector stacks after the map, measurements become a two-column grid, and layer controls become four columns.

Map height is (580px) normally, (650px) on wide screens, (600px)/(560px) at intermediate widths, and an aspect ratio of (1 / 1.1) on phones. The embedded view removes surrounding hero, charts, methods and footer but retains working controls, detail, dates, and data-generation time.

## Elevation & Depth

Tone and fine borders provide most separation. Map controls use (0 4px 16px #1a536225). Selected coast controls use (0 2px 5px #28556c0f). Metric hover uses (0 5px 15px #164d5c12). These are interaction/elevation roles, not universal container shadows.

The compass makes one entrance rotation over (1.2s). Cells change fill over (.3s), bars change height over (.4s), and loading refresh rotates over (1s). Reduced-motion disables animation, transitions and smooth scrolling; explicit scroll actions also respect the preference.

## Shapes

Main surfaces use gently curved (16px) corners. Measurements use (12px), controls (7–9px), status chips pills, and playback a circular button. Keep geographic contours factual rather than decorative.

## Components

### Buttons and inputs
Primary buttons are teal with white text; outlines use white and the fine divider colour. Disabled controls reduce opacity to (.5). Focus uses a (3px) amber outline with (4px) offset. Selection tint, scrollbar colours, native input accent and textarea caret are themed.

### Navigation and disclosures
Desktop navigation links jump to the map, outlook and method sections. Mobile keeps the brand and labelled embed icon. Native details/summary controls reveal methods, ecosystem context and numeric tables without interrupting exploration.

### Geographic workspace
Layer buttons, label/direction toggles, map, legend, coverage counts and timeline stay adjacent. The SVG map supports pointer dragging, zoom/reset, selectable reference areas and arrow-key pixel selection. Cells remain clipped to the Thai marine boundary. Pointer scale must account for SVG letterboxing.

### Point inspector and forecast
The area selector and coordinates identify the actual selected marine pixel. Measurement and activity explanations remain near the values. Charts compare one variable for one point across six days; axes start at zero and the complete numerical table is available. Missing values are visibly different from zero.

### Publication and activity state
Old or failed publications keep physical data visible with a notice and disable activity conclusions. A newer bundled dataset does not erase a failed publication status. Tourism and boat panels share the disclosed unvalidated weather screen; design must not imply official clearance or two independent indices.

## Do's and Don'ts

### Do:
- **Do** keep units, selected day, coordinates and source dates near results.
- **Do** use the same class colours in map and related overview.
- **Do** retain keyboard focus, reduced motion, and mobile/iframe provenance.

### Don't:
- **Don't** turn missing data into zero or a favourable activity judgement.
- **Don't** present screening as accident probability, a validated tourism index, or permission to sail.
- **Don't** describe SST as air temperature, water safety, or a climate anomaly.

The independent reviewer cleared the listed material fixes. Computed contrast certification, assistive-technology testing and production-feed recovery are not claimed. Development-only Next.js badges are not part of the design system.
