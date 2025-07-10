# Custom Barchart Card for Home Assistant

A flexible and customizable bar chart card for Home Assistant dashboards, supporting linear and logarithmic scales (symmetric or positive), clickable bars, dynamic markers, and fine-tuned layout options.

---

## ✨ Features

- Vertical bar chart with:
  - Multiple bars with individual entities or grouped sums
  - Linear or logarithmic Y-axis
  - Two logarithmic modes: `symmetric` (±) or `positive` (from 0)
  - Custom Y-axis grid with unit and decimal options
  - Optional max marker per bar (with value)
  - Clickable bars with `more-info`, navigation, or URL actions
  - Smooth animations for bar height changes
  - Configurable font sizes and colors

---

## ⚙️ Installation

### Manual

1. Download `custom-barchart-card.js` to your `/config/www/` folder.
2. Add the resource in `ui-lovelace.yaml` or via the dashboard UI:

```yaml
resources:
  - url: /local/custom-barchart-card.js
    type: module
```

### HACS (planned)

Coming soon — will be available via HACS as a custom repository.

---

## 🧩 Configuration

### Minimal Example

```yaml
type: custom:custom-barchart-card
title: Power Overview
grid:
  min: 0
  max: 10
  unit: kW
bars:
  - name: Solar
    entity: sensor.solar_power
    color: orange
  - name: Load
    entity: sensor.load_power
    color: red
```

### Symmetric Logarithmic Scale (±)

```yaml
type: custom:custom-barchart-card
title: Grid Flow
logarithmic: true
logarithmic_mode: symmetric
grid:
  max: 10
  unit: kW
  decimal: 1
bars:
  - name: Grid
    entity: sensor.grid_flow
    color: green
```

### Positive Logarithmic Scale (≥ 0)

```yaml
type: custom:custom-barchart-card
title: Load
logarithmic: true
logarithmic_mode: positive
grid:
  max: 10
  unit: kW
bars:
  - name: Load
    entity: sensor.load_power
    color: blue
```

---

## 🔧 Parameters

### General

| Name               | Type    | Default     | Description                                           |
|--------------------|---------|-------------|-------------------------------------------------------|
| `title`            | string  | `""`        | Optional title shown at the top                      |
| `logarithmic`      | boolean | `false`     | Enables logarithmic scaling                          |
| `logarithmic_mode` | string  | `symmetric` | `symmetric` (± center) or `positive` (starts at 0)   |
| `symmetric`        | boolean | `false`     | Legacy; now replaced by `logarithmic_mode`           |
| `bars`             | array   | —           | List of bar definitions                              |
| `grid`             | object  | —           | Grid and axis configuration                          |
| `max_marker`       | object  | —           | Styling for max marker line per bar                  |
| `font_size`        | number  | `18`        | Font size of the title                               |

---

### Grid Options

| Name             | Type   | Default | Description                                |
|------------------|--------|---------|--------------------------------------------|
| `min`            | number | `0`     | Minimum Y value (ignored in log mode)      |
| `max`            | number | `100`   | Maximum Y value                            |
| `lines`          | number | `5`     | Number of horizontal lines                 |
| `decimal`        | number | `1`     | Decimal places for Y-axis labels           |
| `unit`           | string |         | Unit label shown on Y-axis                 |
| `color`          | string | `#999`  | Grid line color                            |
| `width`          | number | `1`     | Grid line width                            |
| `dash`           | string | `3,2`   | Grid line dash style                       |
| `axis_color`     | string | `#000`  | Axis line color                            |
| `axis_width`     | number | `1.5`   | Axis line width                            |
| `font_size`      | number | `10`    | Font size of grid label                    |
| `font_size_unit` | number | `20`    | Font size for unit label                   |
| `font_color`     | string | `#666`  | Color of labels                            |

---

### Bar Definition

| Name         | Type      | Default | Description                                      |
|--------------|-----------|---------|--------------------------------------------------|
| `name`       | string    | —       | Label below the bar                             |
| `entity`     | string    | —       | Single entity for the bar                        |
| `entities`   | string[]  | —       | List of entities to be summed                    |
| `color`      | string    | `#999`  | Bar fill color                                   |
| `font_size`  | number    | `12`    | Font size for value and label                    |
| `decimals`   | number    | `3`     | Decimal places for bar value                     |
| `max_entity` | string    | —       | Entity providing the max value marker            |
| `tap_action` | object    | —       | Action triggered when the bar is clicked         |

#### Example:

```yaml
bars:
  - name: Load L1
    entity: sensor.load_l1
    max_entity: sensor.load_l1_max
    color: "#0077cc"
    tap_action:
      action: more-info
```

---

### Tap Actions

| Action       | Description                          |
|--------------|--------------------------------------|
| `more-info`  | Show entity info popup               |
| `navigate`   | Navigate to Lovelace path            |
| `url`        | Open external URL in new tab         |
| `none`       | Disable tap interaction              |

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/energy
```

---

## 🕘 Changelog

### 1.1.4 – 2025-07-10
- **New:** `logarithmic_mode` option with `symmetric` and `positive`
- Improved handling of baseline in log mode
- Minor visual fixes and optimizations

### 1.1.3
- `logarithmic` option (`true` / `false`).

### 1.1.2
- Added `grid.decimal` for fixed decimal places on Y-axis

---

## 👤 Author & License

Created by [HeWeDe](https://github.com/HeWeDe)
License: MIT
Feedback and pull requests welcome!

---

## 📍 GitHub

[https://github.com/HeWeDe/custom-barchart-card](https://github.com/HeWeDe/custom-barchart-card)
