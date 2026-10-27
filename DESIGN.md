---
name: Gulf Watch
description: A quiet Thai coastal monitoring desk, led by the map and its evidence.
colors:
  ink: "#203f44"
  muted: "#5a7274"
  teal: "#1e615f"
  paper: "#fafbf8"
  line: "#dde5df"
  surface: "#fff"
  sea: "#e4eff0"
  land: "#f5f3ec"
  no-data: "#d4dfe0"
  selected-soft: "#e8f0e9"
  focus: "#358b91"
  class-1: "#407ca8"
  class-2: "#509b80"
  class-3: "#e3bd52"
  class-4: "#df8d4e"
  class-5: "#c85c50"
typography:
  headline:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "35px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-1px"
  title:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "21px"
    fontWeight: 500
  body:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  label:
    fontFamily: "'IBM Plex Sans Thai', sans-serif"
    fontSize: "12px"
    fontWeight: 500
  code:
    fontFamily: "monospace"
    fontSize: "12px"
rounded:
  workspace: "14px"
  control: "8px"
  tab: "6px"
  date: "7px"
  pill: "20px"
spacing:
  compact-gap: "7px"
  control-gap: "9px"
  group-gap: "12px"
  panel: "24px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  layer-tab-selected:
    backgroundColor: "{colors.selected-soft}"
    rounded: "{rounded.tab}"
    padding: "9px 12px"
  workspace:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.workspace}"
  area-select:
    backgroundColor: "{colors.surface}"
    typography: "{typography.title}"
    padding: "6px 0 9px"
    width: "100%"
  code-field:
    backgroundColor: "{colors.surface}"
    typography: "{typography.code}"
    rounded: "{rounded.tab}"
    padding: "12px"
    width: "100%"
---

# Design System: Gulf Watch

## Overview

**Creative North Star: "The Quiet Coastal Monitoring Desk"**

Pale sea, warm land, dark marine text and restrained teal controls frame a map-led Thai reading experience. A reference-area panel sits beside the map, with observations, units and source dates close to the selected result. This is a calm working surface with compact supporting information.

This is a code-led record of `app/globals.css` and `app/page.tsx`, informed by `PRODUCT.md` and the supplied direction. No approved visual comp or context/detector validation is available. It records implemented visual patterns, not certification of contrast, usability or forecasting capability.

**Key Characteristics:**
- Map dominance with a subordinate reference-area panel.
- Thai-first typography, explicit units and visible data age.
- Flat surfaces, fine dividers and small curved controls.
- Responsive public and iframe views.

## Colors

The palette combines cool water and warm land with a restrained control accent; the five data classes have a separate sequential legend.

### Primary
- **Coastal Teal** (`teal`): primary actions, selected dates, refresh links and brand mark.
- **Soft Selected Green** (`selected-soft`): selected layer tabs, with stronger text and weight.

### Secondary
- **Screening Classes** (`class-1` through `class-5`): blue, green, yellow, orange and red map cells and legend swatches, in that order. These encode relative classes or the SPM thresholds shown by the current legend.

### Neutral
- **Marine Ink / Muted Marine** (`ink`, `muted`): primary text and supporting labels.
- **Paper / White Surface / Fine Divider** (`paper`, `surface`, `line`): page, workspace and section boundaries.
- **Pale Sea / Warm Land** (`sea`, `land`): geographic base layers.
- **Missing Observation Grey** (`no-data`): insufficient observations, with a distinct legend entry.
- **Focus Teal** (`focus`): keyboard focus outlines.

**The Evidence Colour Rule.** Keep missing data distinct from the five classes, and retain the visible legend and low-confidence context when displaying class colours.

## Typography

Use locally served IBM Plex Sans Thai with a sans-serif fallback for interface text and map labels. The only contrasting family is monospace for iframe code. Weight, size and spacing establish hierarchy without a second display face.

- **Headline:** main introduction; reduces to (29px) on mobile and (25px) in the desktop iframe.
- **Title:** prominent reference-area selector; section headings use their observed (22–27px) range.
- **Body:** general Thai reading; method paragraphs use (12px), line height (1.9), and a maximum width of (66ch).
- **Label:** panel headings and compact controls. Supporting metadata varies by context; do not treat the smallest incidental labels as a universal type scale.
- **Data values:** tabular numerals; panel values (15px), with the selected result at (35px), reducing to (30px) on mobile.

## Layout

The centered application is capped at (1540px), with desktop side padding (44px). The workspace uses a flexible map column and a fixed reference panel (312px). Its shared border and clipped corners make it one surface. The map is (520px) tall by default and (610px) from a viewport width of (1450px).

At (1150px) and below, page padding becomes (25px), the panel narrows to (274px), and the confidence label in the toolbar is hidden; low-confidence context remains in the result panel. At (760px) and below, page padding becomes (16px), the map and reference panel stack, the map uses an aspect ratio of (1 / 1.13), and observation/environment groups sit in two columns within the panel. Navigation becomes compact and source metadata wraps.

The public iframe view reduces surrounding chrome and hides method, embed instructions and footer. Its desktop map is (500px) tall. On mobile, retain the compact reference panel: the final stylesheet override displays it as a grid. Keep source dates and update state attached to the working surface in both modes.

## Elevation & Depth

Most surfaces are flat. Paper, white panels, tinted selections and fine borders provide separation. The floating map-control cluster has the single structural shadow (`0 3px 12px #1e414415`). Do not generalize this shadow to every panel.

Motion is functional: map cells transition fill over (.25s), a loading refresh icon spins over (1s), and in-page navigation scrolls smoothly. The reduced-motion media query removes animation, transitions and smooth scrolling.

## Shapes

Use the workspace radius for the shared map/panel shell, the control radius for buttons and floating map controls, and smaller corners for tabs, dates and the code field. Status chips are pills; the brand and playback control are circles. Reference-area selection uses a flat underline and square corners. Avoid turning every information group into a separate rounded card.

## Components

### Buttons
Primary actions are teal with white text; outline actions use a transparent background and a fine green-grey border. Both use compact icon/text alignment, (13px) text and the shared control padding. Primary hover deepens to `#174b4a`; outline hover uses `#e9f0e9`. Disabled buttons reduce opacity to (.45). Keyboard focus uses a (3px) outline with (4px) offset.

### Layer tabs and timeline
Layer tabs are quiet text controls, with a soft selected fill and stronger type. Selected dates use the solid teal fill. Retain selected-state semantics and visible labels; the SPM observation view disables forecast playback/date controls and dims the timeline.

### Status chips and notices
Publication status pairs a short label with a dot. Old or failed data uses a warm amber treatment; a nearby notice supplies explanation and retry action. Status is communicated in text as well as colour.

### Workspace and reference panel
The shared white shell contains the map, legend, date controls and reference panel. The panel uses section dividers rather than nested cards. Keep selected coordinates, source observation dates, units and the explanatory result note visible. The reference-area selector is prominent and full width; river context uses a native disclosure.

### Inputs and code field
The area selector uses a white background and bottom border. The read-only iframe textarea uses monospace, a full border and small corners; its container has a pale green fill. Both inherit the global keyboard focus treatment. No custom input error system is established.

### Navigation
Desktop header navigation combines a muted text link and outline embed action. Mobile hides the text link and reduces the embed action to its icon. The iframe hides header navigation. Preserve accessible names when labels are visually condensed.

### Map
Use a pale sea base, warm land, data cells, restrained geographic labels and a discrete selected-pixel outline. Reference markers support selection; the SVG map supports arrow-key pixel selection. Legend, dates, compass and approximate scale explain the view. Map labels have explicit desktop/mobile sizes; these are map annotation roles, not the page type scale.

## Do's and Don'ts

### Do:
- **Do** keep the map visually dominant and reference details close to it.
- **Do** pair data colours with a legend, units, source dates and confidence context.
- **Do** preserve Thai text, tabular values and visible keyboard focus.
- **Do** check the final mobile and iframe cascade when extending shared styles.

### Don't:
- **Don't** use the five data-class colours as general action accents.
- **Don't** render missing observations as the lowest class or as zero.
- **Don't** add shadows or separate cards to every reference-panel section.
- **Don't** imply a current observation by removing its date or stale-data state.
