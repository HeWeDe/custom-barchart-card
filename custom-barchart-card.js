/**
 * Custom Barchart Card for Home Assistant
 * Version: 1.1.3
 * Date: 2025-07-07
 * Repository: https://github.com/HeWeDe/custom-barchart-card
 * Author: HeWeDe (https://github.com/HeWeDe)
 * License: MIT
 *
 * Features:
 * - Vertikale Balkendiagramme mit konfigurierbarer Skala (linear / symmetrisch logarithmisch)
 * - Einzelne oder gruppierte Entitäten
 * - Dynamische Gitternetzlinien und Y-Achse
 * - Optionaler Maximalwert-Marker pro Balken
 * - Klickbare Balken mit tap_action (more-info, navigate, url)
 * - Einheitenanzeige, Farben, Beschriftung individuell einstellbar
 * - Unterstützung von Dezimalstellen (grid.decimal, bar.decimals)
 */

import { LitElement, html, css, svg } from "/local/libs/lit-element.js?module";

const DEFAULTS = {
  decimal_separator: ",",
  decimals: 3,
  stat_decimals: 1,
  logarithmic: false,
  markers_width: 2,
  title: "",
  font_size: 18,
  bars: [],
  max_marker: {
    height: 2,
    color: "#000",
    font_size: 10,
    decimal: 1,
  },
  grid: {
    min: 0,
    max: 100,
    lines: 5,
    decimal: 1,
    color: "#999",
    width: 1,
    dash: "3,2",
    font_size: 10,
    font_size_unit: 20,
    font_color: "#666",
    unit: "",
    axis_color: "#000",
    axis_width: 1.5,
  },
};

class CustomBarchartCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static styles = css`
    ha-card {
      padding: 16px;
      height: 100%;
    }
    .card-content {
      min-height: 300px;
    }
    .bar {
      transition: y 0.5s ease, height 0.5s ease;
    }
  `;
  setConfig(config) {
    this.config = {
      ...DEFAULTS,
      ...config,
      grid: { ...DEFAULTS.grid, ...(config.grid || {}) },
    };
  }

  _renderGrid(width, height) {
    const g = this.config.grid;
    const lines = [];
    const isLog = this.config.logarithmic;
    const centerY = height / 2;

    if (isLog) {
      const max = g.max;
      const logMax = Math.log10(max + 1);
      const lineCount = g.lines ?? 5;

      for (let i = 0; i <= lineCount; i++) {
        const fraction = i / lineCount;
        const logValue = fraction * logMax;
        const value = Math.pow(10, logValue) - 1;

        const yOffset = (fraction * height) / 2;

        // positive Linie
        const yPos = centerY - yOffset;
        lines.push(svg`
          <line x1="0" y1="${yPos}" x2="${width}" y2="${yPos}"
              stroke="${g.color}" stroke-width="${g.width}" stroke-dasharray="${
          g.dash
        }" />
          <text x="-10" y="${yPos}" text-anchor="end" fill="${g.font_color}"
              font-size="${g.font_size}" dominant-baseline="middle">
              ${value.toFixed(g.decimal)}
          </text>
        `);

        // negative Linie
        if (i > 0) {
          const yNeg = centerY + yOffset;
          lines.push(svg`
            <line x1="0" y1="${yNeg}" x2="${width}" y2="${yNeg}"
                stroke="${g.color}" stroke-width="${
            g.width
          }" stroke-dasharray="${g.dash}" />
            <text x="-10" y="${yNeg}" text-anchor="end" fill="${g.font_color}"
                font-size="${g.font_size}" dominant-baseline="middle">
                -${value.toFixed(g.decimal)}
            </text>
          `);
        }
      }

      // Mittelachse (0-Linie)
      lines.push(svg`
        <line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}"
              stroke="${g.axis_color}" stroke-width="${g.axis_width}" />
      `);
      // Y-Achse links
      lines.push(svg`
        <line x1="0" y1="0" x2="0" y2="${height}"
              stroke="${g.axis_color}" stroke-width="${g.axis_width}" />
      `);
    } else {
      // Standardlineares Grid
      const step = (g.max - g.min) / g.lines;
      for (let i = 0; i <= g.lines; i++) {
        const y = height - (i / g.lines) * height;
        const value = g.min + i * step;

        lines.push(svg`
          <line x1="0" y1="${y}" x2="${width}" y2="${y}"
              stroke="${g.color}" stroke-width="${g.width}" stroke-dasharray="${
          g.dash
        }" />
          <text x="-10" y="${y}" text-anchor="end"
              fill="${g.font_color}" font-size="${
          g.font_size
        }" dominant-baseline="middle">
            ${value.toFixed(g.decimal)}
          </text>
        `);
      }

      // Achsen
      lines.push(
        svg`<line x1="0" y1="0" x2="0" y2="${height}" stroke="${g.axis_color}" stroke-width="${g.axis_width}" />`
      );
      lines.push(
        svg`<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${g.axis_color}" stroke-width="${g.axis_width}" />`
      );
    }

    // Einheit senkrecht links
    if (g.unit) {
      lines.push(svg`
        <text x="-35" y="${height / 2}" text-anchor="middle"
            font-size="${g.font_size_unit}" fill="${g.font_color}"
            transform="rotate(-90, -35, ${height / 2})">
          ${g.unit}
        </text>
      `);
    }

    return lines;
  }

  _renderBars(width, height) {
    const bars = this.config.bars || [];
    const g = this.config.grid;
    const min = g.min;
    const max = g.max;
    const unit = g.unit || "";
    const range = max - min;
    const symmetric = this.config.symmetric ?? false;
    const zeroLine = symmetric ? height / 2 : height * (max / range);
    const spacing = width / bars.length;
    const barWidth = spacing * 0.8;
    const elements = [];
    const log = this.config.logarithmic;

    bars.forEach((bar, i) => {
      const barX = i * spacing + (spacing - barWidth) / 2;
      const font_size = bar.font_size ?? 12;
      const decimals = bar.decimals ?? this.config.decimals ?? 1;
      const handleTap = () => this._handleBarTap(bar);

      const entities = bar.entities || [bar.entity];
      let sum = 0;
      entities.forEach((ent) => {
        const state = this.hass?.states?.[ent]?.state;
        const val = parseFloat(state);
        if (!isNaN(val)) sum += val;
      });

      let barHeight;
      let barY;

      if (log) {
        const abs = Math.abs(sum);
        if (abs > 0) {
          const logHeight = Math.log10(abs + 1) / Math.log10(max + 1);
          barHeight = (logHeight * height) / 2;
        } else {
          barHeight = 0;
        }
        barY = sum >= 0 ? zeroLine - barHeight : zeroLine;
      } else {
        const clamped = Math.max(min, Math.min(sum, max));
        barHeight = (Math.abs(clamped) / range) * height;
        barY = clamped >= 0 ? zeroLine - barHeight : zeroLine;
      }

      elements.push(svg`
        <rect class="bar" x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="${bar.color || "#999"}"
            style="cursor: pointer;"
            @click=${handleTap} />
      `);

      elements.push(svg`
        <text x="${barX + barWidth / 2}"
            y="${sum >= 0 ? barY - 4 : barY + barHeight + font_size}"
            text-anchor="middle"
            font-size="${font_size}" fill="#000">
            ${sum.toFixed(decimals)} ${unit}
        </text>
      `);

      if (bar.max_entity) {
        const maxState = this.hass?.states?.[bar.max_entity]?.state;
        const maxVal = parseFloat(maxState);
        if (!isNaN(maxVal)) {
          const marker = this.config.max_marker ?? {};
          const markerHeight = marker.height ?? 2;
          const markerColor = marker.color ?? "#000";
          const fontSize = marker.font_size ?? 12;
          const decimal = marker.decimal ?? 2;
          const formattedMax = maxVal.toFixed(decimal);

          let maxPixelY;
          if (log) {
            const absMax = Math.abs(maxVal);
            if (absMax > 0) {
              const logHeight = Math.log10(absMax + 1) / Math.log10(max + 1);
              const h = (logHeight * height) / 2;
              maxPixelY = maxVal >= 0 ? zeroLine - h : zeroLine + h;
            } else {
              maxPixelY = zeroLine;
            }
          } else {
            const clampedMax = Math.max(min, Math.min(maxVal, max));
            maxPixelY =
              maxVal >= 0
                ? zeroLine - (Math.abs(clampedMax) / range) * height
                : zeroLine + (Math.abs(clampedMax) / range) * height;
          }

          elements.push(svg`
            <rect x="${barX}" y="${maxPixelY}" width="${barWidth}" height="${markerHeight}"
                fill="${markerColor}" />
            <text x="${barX + barWidth - 5}" y="${
            maxPixelY - 5
          }" text-anchor="end"
                font-size="${fontSize}" fill="${markerColor}">
                ${formattedMax}
            </text>
          `);
        }
      }

      if (bar.name) {
        const textY = height + font_size;
        elements.push(svg`
          <text x="${barX + barWidth / 2}" y="${textY}" text-anchor="middle"
              font-size="${font_size}" fill="#333">${bar.name}</text>
        `);
      }
    });

    return elements;
  }
  _handleBarTap(bar) {
    const action = bar.tap_action?.action;

    if (!action || action === "none") return;

    if (action === "url" && bar.tap_action.url_path) {
      window.open(bar.tap_action.url_path, "_blank");
    } else if (action === "navigate" && bar.tap_action.navigation_path) {
      history.pushState(null, "", bar.tap_action.navigation_path);
      window.dispatchEvent(new Event("location-changed"));
    } else if (action === "more-info" && bar.entity) {
      const event = new CustomEvent("hass-more-info", {
        detail: { entityId: bar.entity },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    const font_size_unit = this.config.grid.font_size_unit ?? 20;
    const margin = {
      top: 40,
      right: 20,
      bottom: 30,
      left: 25 + font_size_unit,
    };
    const fullWidth = this.offsetWidth || 300;
    const fullHeight = this.offsetHeight || 200;
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;
    const title = this.config.title ?? "";
    const font_size = this.config.font_size;

    return html`
      <ha-card>
        <svg
          viewBox="0 0 ${fullWidth} ${fullHeight}"
          width="100%"
          height="100%"
        >
          ${title
            ? svg`<text x="${fullWidth / 2}" y="${
                margin.top / 2
              }" text-anchor="middle"
                font-size="${font_size}" font-weight="bold">${title}</text>`
            : null}
          <g transform="translate(${margin.left}, ${margin.top})">
            ${this._renderGrid(width, height)}
            ${this._renderBars(width, height)}
          </g>
        </svg>
      </ha-card>
    `;
  }
}

customElements.define("custom-barchart-card", CustomBarchartCard);
