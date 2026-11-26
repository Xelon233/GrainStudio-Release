(() => {
  "use strict";

  const REPO = "Xelon233/GrainStudio-Release";
  const LOCAL_FALLBACK = {
    version: "1.1.28",
    build: "39",
    assetName: "Grain Studio 1.1.28.dmg",
    assetSizeBytes: 206190194,
    sha256: "1e18140593b3192f74795ec9c7e8354937f5ff5b50319b985cb2bbdfc90253aa",
    releaseUrl: `https://github.com/${REPO}/releases`,
  };

  const LUT_PRESETS = {
    "classic-neg": {
      label: "F-Log2 Classic Neg",
      contrast: 1.12,
      saturate: 0.92,
      sepia: 0.08,
      hueRotate: -4,
      brightness: 1.01,
    },
    hncs: {
      label: "Hasselblad HNCS",
      contrast: 1.05,
      saturate: 1.06,
      sepia: 0.02,
      hueRotate: 2,
      brightness: 1.03,
    },
    velvia: {
      label: "Fujifilm Velvia 50",
      contrast: 1.18,
      saturate: 1.24,
      sepia: 0.03,
      hueRotate: -2,
      brightness: 1.0,
    },
    arri: {
      label: "ARRI LogC4 3110",
      contrast: 1.08,
      saturate: 0.96,
      sepia: 0.06,
      hueRotate: 3,
      brightness: 1.02,
    },
  };

  const SAMPLES = {
    coast: {
      src: "./assets/splash_coast.jpg",
      title: "splash_coast.jpg",
      meta: "4096 × 2304 · 交互暗房校样",
      tone: "低调高动态 · 16-bit",
    },
    gallery: {
      src: "./assets/splash_gallery.jpg",
      title: "splash_gallery.jpg",
      meta: "4096 × 2304 · 交互暗房校样",
      tone: "高反差明暗 · 16-bit",
    },
  };

  const state = {
    theme: "light",
    stageMode: "interactive",
    sample: "coast",
    lut: "classic-neg",
    exposure: 0,
    contrast: 0,
    warmth: 0,
    grain: 24,
    comparing: false,
  };

  const el = {
    html: document.documentElement,
    themeToggle: document.getElementById("themeToggle"),
    themeToggleLabel: document.getElementById("themeToggleLabel"),
    stagePlateInfo: document.getElementById("stagePlateInfo"),
    interactiveView: document.getElementById("interactiveProofingView"),
    appDarkView: document.getElementById("appDarkView"),
    appLightView: document.getElementById("appLightView"),
    proofingImage: document.getElementById("proofingImage"),
    grainOverlay: document.getElementById("grainOverlay"),
    compareBadge: document.getElementById("compareBadge"),
    compareHoldBtn: document.getElementById("compareHoldBtn"),
    resetGradingBtn: document.getElementById("resetGradingBtn"),
    activeLutLabel: document.getElementById("activeLutLabel"),
    evSummary: document.getElementById("evSummary"),
    toneTelemetry: document.getElementById("toneTelemetry"),
    sliderExposure: document.getElementById("sliderExposure"),
    sliderContrast: document.getElementById("sliderContrast"),
    sliderWarmth: document.getElementById("sliderWarmth"),
    sliderGrain: document.getElementById("sliderGrain"),
    valExposure: document.getElementById("valExposure"),
    valContrast: document.getElementById("valContrast"),
    valWarmth: document.getElementById("valWarmth"),
    valGrain: document.getElementById("valGrain"),
    spanExposure: document.getElementById("spanExposure"),
    spanContrast: document.getElementById("spanContrast"),
    spanWarmth: document.getElementById("spanWarmth"),
    spanGrain: document.getElementById("spanGrain"),
    dotExposure: document.getElementById("dotExposure"),
    dotContrast: document.getElementById("dotContrast"),
    dotWarmth: document.getElementById("dotWarmth"),
    dotGrain: document.getElementById("dotGrain"),
    primaryDownloadBtn: document.getElementById("primaryDownloadBtn"),
    downloadBtnText: document.getElementById("downloadBtnText"),
    releaseAssetMeta: document.getElementById("releaseAssetMeta"),
    latestVersionTitle: document.getElementById("latestVersionTitle"),
    releaseSyncBadge: document.getElementById("releaseSyncBadge"),
    releasePageLink: document.getElementById("releasePageLink"),
    dmgFilename: document.getElementById("dmgFilename"),
    dmgFilesize: document.getElementById("dmgFilesize"),
    dmgSha256: document.getElementById("dmgSha256"),
    copyShaBtn: document.getElementById("copyShaBtn"),
    toast: document.getElementById("toast"),
  };

  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2400);
  }

  function setTheme(theme) {
    state.theme = theme;
    el.html.setAttribute("data-theme", theme);
    el.themeToggleLabel.textContent = theme === "dark" ? "浅色外观" : "深色外观";
  }

  function updateSpan(spanEl, inputEl, bipolar) {
    const min = Number(inputEl.min);
    const max = Number(inputEl.max);
    const val = Number(inputEl.value);
    const pct = ((val - min) / (max - min)) * 100;

    if (bipolar) {
      const left = Math.min(50, pct);
      const width = Math.abs(pct - 50);
      spanEl.style.left = `${left}%`;
      spanEl.style.width = `${width}%`;
    } else {
      spanEl.style.left = "0%";
      spanEl.style.width = `${pct}%`;
    }
  }

  function renderProofing() {
    const lut = LUT_PRESETS[state.lut];
    const ev = state.exposure / 50; // -2.0 .. +2.0 EV
    const expStr = `${ev >= 0 ? "+" : ""}${ev.toFixed(2)} EV`;

    el.activeLutLabel.textContent = lut.label;
    el.evSummary.textContent = expStr;

    el.valExposure.textContent = `${ev >= 0 ? "+" : ""}${ev.toFixed(2)} EV`;
    el.valContrast.textContent = `${state.contrast > 0 ? "+" : ""}${state.contrast}`;
    const kelvin = Math.round(5500 + state.warmth * 28);
    el.valWarmth.textContent = `${kelvin} K`;
    el.valGrain.textContent = `${state.grain}%`;

    el.dotExposure.hidden = state.exposure === 0;
    el.dotContrast.hidden = state.contrast === 0;
    el.dotWarmth.hidden = state.warmth === 0;
    el.dotGrain.hidden = state.grain === 24;

    el.dotExposure.parentElement.classList.toggle("is-modified", state.exposure !== 0);
    el.dotContrast.parentElement.classList.toggle("is-modified", state.contrast !== 0);
    el.dotWarmth.parentElement.classList.toggle("is-modified", state.warmth !== 0);
    el.dotGrain.parentElement.classList.toggle("is-modified", state.grain !== 24);

    updateSpan(el.spanExposure, el.sliderExposure, true);
    updateSpan(el.spanContrast, el.sliderContrast, true);
    updateSpan(el.spanWarmth, el.sliderWarmth, true);
    updateSpan(el.spanGrain, el.sliderGrain, false);

    if (state.comparing) {
      el.proofingImage.style.filter = "none";
      el.grainOverlay.style.opacity = "0";
      el.compareBadge.hidden = false;
      return;
    }

    el.compareBadge.hidden = true;

    const brightness = Math.max(0.45, lut.brightness * Math.pow(2, ev * 0.35));
    const contrast = Math.max(0.65, lut.contrast * (1 + state.contrast / 140));
    const warmthSepia = Math.max(0, lut.sepia + (state.warmth > 0 ? state.warmth / 190 : 0));
    const coolHue = state.warmth < 0 ? state.warmth * 0.25 : 0;
    const hueRotate = lut.hueRotate + coolHue;
    const saturate = Math.max(0.5, lut.saturate + (state.warmth < 0 ? state.warmth / 320 : 0));

    el.proofingImage.style.filter =
      `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturate.toFixed(3)}) sepia(${warmthSepia.toFixed(3)}) hue-rotate(${hueRotate.toFixed(1)}deg)`;
    el.grainOverlay.style.opacity = (state.grain / 180).toFixed(3);
  }

  function switchStageMode(mode) {
    state.stageMode = mode;
    document.querySelectorAll("[data-stage-mode]").forEach((btn) => {
      const active = btn.getAttribute("data-stage-mode") === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    el.interactiveView.classList.toggle("is-visible", mode === "interactive");
    el.appDarkView.classList.toggle("is-visible", mode === "app-dark");
    el.appLightView.classList.toggle("is-visible", mode === "app-light");

    if (mode === "interactive") {
      const sample = SAMPLES[state.sample];
      el.stagePlateInfo.innerHTML = `<span>${sample.title}</span><span class="mono-val">${sample.meta}</span>`;
    } else if (mode === "app-dark") {
      el.stagePlateInfo.innerHTML = `<span>Grain Studio · macOS 暗房工作台</span><span class="mono-val">Stone Stage #101010</span>`;
    } else {
      el.stagePlateInfo.innerHTML = `<span>Grain Studio · Zone-V 日光校样台</span><span class="mono-val">Neutral Mat #787875</span>`;
    }
  }

  function switchSample(sampleKey) {
    if (!SAMPLES[sampleKey]) return;
    state.sample = sampleKey;
    const sample = SAMPLES[sampleKey];
    el.proofingImage.src = sample.src;
    el.toneTelemetry.textContent = sample.tone;
    document.querySelectorAll("[data-sample]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-sample") === sampleKey);
    });
    if (state.stageMode === "interactive") {
      el.stagePlateInfo.innerHTML = `<span>${sample.title}</span><span class="mono-val">${sample.meta}</span>`;
    }
  }

  function resetGrading() {
    state.exposure = 0;
    state.contrast = 0;
    state.warmth = 0;
    state.grain = 24;
    el.sliderExposure.value = "0";
    el.sliderContrast.value = "0";
    el.sliderWarmth.value = "0";
    el.sliderGrain.value = "24";
    renderProofing();
  }

  function formatMegabytes(bytes) {
    return `${(bytes / 1_000_000).toFixed(1)} MB (${bytes.toLocaleString("en-US")} bytes)`;
  }

  async function syncLatestGitHubRelease() {
    // Only attempt remote fetch over HTTP(S); keep local manifest when opened via file://
    if (!window.location.protocol.startsWith("http")) return;
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const dmg = Array.isArray(data.assets)
        ? data.assets.find((a) => typeof a.name === "string" && a.name.toLowerCase().endsWith(".dmg"))
        : null;
      if (!dmg) return;

      const versionTag = data.tag_name || `v${LOCAL_FALLBACK.version}`;
      el.primaryDownloadBtn.href = dmg.browser_download_url;
      el.releaseAssetMeta.textContent = `${dmg.name} · ${(dmg.size / 1_000_000).toFixed(1)} MB`;
      el.latestVersionTitle.textContent = versionTag;
      el.dmgFilename.textContent = dmg.name;
      el.dmgFilesize.textContent = formatMegabytes(dmg.size);
      el.releasePageLink.href = data.html_url || LOCAL_FALLBACK.releaseUrl;
      el.releaseSyncBadge.textContent = "已同步 GitHub Releases";
    } catch {
      // Silent fallback to embedded manifest
    }
  }

  function bindEvents() {
    el.themeToggle.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
    });

    document.querySelectorAll("[data-stage-mode]").forEach((btn) => {
      btn.addEventListener("click", () => switchStageMode(btn.getAttribute("data-stage-mode")));
    });

    document.querySelectorAll("[data-sample]").forEach((btn) => {
      btn.addEventListener("click", () => switchSample(btn.getAttribute("data-sample")));
    });

    document.querySelectorAll("[data-lut]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lut = btn.getAttribute("data-lut");
        document.querySelectorAll("[data-lut]").forEach((c) => c.classList.toggle("is-active", c === btn));
        renderProofing();
      });
    });

    const sliderBindings = [
      [el.sliderExposure, "exposure", 0],
      [el.sliderContrast, "contrast", 0],
      [el.sliderWarmth, "warmth", 0],
      [el.sliderGrain, "grain", 24],
    ];

    sliderBindings.forEach(([input, key, def]) => {
      input.addEventListener("input", () => {
        state[key] = Number(input.value);
        renderProofing();
      });
      input.addEventListener("dblclick", () => {
        state[key] = def;
        input.value = String(def);
        renderProofing();
      });
    });

    const startCompare = () => {
      state.comparing = true;
      el.compareHoldBtn.classList.add("is-active");
      renderProofing();
    };
    const endCompare = () => {
      if (!state.comparing) return;
      state.comparing = false;
      el.compareHoldBtn.classList.remove("is-active");
      renderProofing();
    };

    el.compareHoldBtn.addEventListener("mousedown", startCompare);
    el.compareHoldBtn.addEventListener("touchstart", startCompare, { passive: true });
    window.addEventListener("mouseup", endCompare);
    window.addEventListener("touchend", endCompare);

    el.resetGradingBtn.addEventListener("click", resetGrading);

    el.copyShaBtn.addEventListener("click", async () => {
      const cmd = `shasum -a 256 "${el.dmgFilename.textContent}"`;
      try {
        await navigator.clipboard.writeText(cmd);
        showToast("已复制校验命令到剪贴板");
      } catch {
        showToast(cmd);
      }
    });
  }

  function initProgressiveMotion() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    document.documentElement.classList.add("has-motion");

    const heroHeader = document.querySelector(".hero-header-stack");
    const macFrame = document.querySelector(".mac-frame");
    const navLinks = Array.from(document.querySelectorAll(".localnav-menu a[href^='#']"));
    const sections = navLinks
      .map((a) => ({ link: a, el: document.querySelector(a.getAttribute("href")) }))
      .filter((item) => item.el);

    // Assign layered stagger delays per section grammar
    document.querySelectorAll(".section-intro-centered, .section-intro-left").forEach((elNode) => {
      elNode.classList.add("reveal-item");
    });

    document.querySelectorAll(".bento-grid .bento-tile").forEach((tile, idx) => {
      tile.classList.add("reveal-item");
      tile.style.setProperty("--reveal-delay", `${idx * 110}ms`);
    });

    document.querySelectorAll(".craft-feature-row").forEach((row) => {
      row.classList.add("reveal-item");
      row.querySelectorAll(".craft-point").forEach((pt, idx) => {
        pt.classList.add("reveal-item");
        pt.style.setProperty("--reveal-delay", `${100 + idx * 90}ms`);
      });
    });

    document.querySelectorAll(".perf-grid .perf-card").forEach((card, idx) => {
      card.classList.add("reveal-item");
      card.style.setProperty("--reveal-delay", `${idx * 85}ms`);
    });

    const qaBar = document.querySelector(".qa-bar");
    if (qaBar) qaBar.classList.add("reveal-item");

    // Sequential flowchart cascade: 0 -> arrow -> 1 -> arrow -> 2 -> bridge -> 3 -> arrow -> 4 -> arrow -> 5
    const flowSequence = [];
    const flowRows = document.querySelectorAll(".pipeline-flow .flow-row");
    const bridge = document.querySelector(".pipeline-flow .flow-bridge");
    if (flowRows.length >= 2) {
      flowRows[0].querySelectorAll(".flow-node, .flow-arrow").forEach((n) => flowSequence.push(n));
      if (bridge) flowSequence.push(bridge);
      flowRows[1].querySelectorAll(".flow-node, .flow-arrow").forEach((n) => flowSequence.push(n));
    }
    flowSequence.forEach((node, idx) => {
      node.classList.add("reveal-item");
      node.style.setProperty("--reveal-delay", `${idx * 75}ms`);
    });

    document.querySelectorAll(".release-grid .apple-card").forEach((card, idx) => {
      card.classList.add("reveal-item");
      card.style.setProperty("--reveal-delay", `${idx * 110}ms`);
    });

    // Subtle metric count-up for performance stats on first reveal
    function animateStat(statEl) {
      if (statEl.dataset.animated) return;
      statEl.dataset.animated = "1";
      const original = statEl.textContent.trim();
      const match = original.match(/^([\d.,]+)(.*)$/);
      if (!match) return;
      const target = parseFloat(match[1].replace(/,/g, ""));
      const suffix = match[2];
      const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
      const hasComma = match[1].includes(",");
      const duration = 700;
      const start = performance.now();

      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = target * eased;
        let formatted = current.toFixed(decimals);
        if (hasComma) {
          formatted = Number(formatted).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        }
        statEl.textContent = `${formatted}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
        else statEl.textContent = original;
      }
      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          entry.target.querySelectorAll(".perf-stat").forEach(animateStat);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    document.querySelectorAll(".reveal-item").forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        item.classList.add("is-revealed");
      } else {
        observer.observe(item);
      }
    });

    // Scroll-driven hero depth parallax + active nav tracking
    let ticking = false;
    function updateScrollEffects() {
      ticking = false;
      const y = window.scrollY || 0;

      if (heroHeader && macFrame && window.innerWidth > 720) {
        const p = Math.min(1, y / 420);
        heroHeader.style.transform = `translate3d(0, ${(p * -18).toFixed(1)}px, 0) scale(${(1 - p * 0.025).toFixed(4)})`;
        heroHeader.style.opacity = `${(1 - p * 0.45).toFixed(3)}`;

        const frameScale = 0.982 + Math.min(1, y / 220) * 0.018;
        const frameY = Math.max(0, 10 - Math.min(1, y / 220) * 10);
        macFrame.style.transform = `translate3d(0, ${frameY.toFixed(1)}px, 0) scale(${frameScale.toFixed(4)})`;
      } else if (heroHeader && macFrame) {
        heroHeader.style.transform = "";
        heroHeader.style.opacity = "";
        macFrame.style.transform = "";
      }

      const probeY = y + 140;
      let currentSection = sections[0];
      for (const s of sections) {
        if (s.el.offsetTop <= probeY) currentSection = s;
      }
      navLinks.forEach((l) => l.classList.toggle("is-current", currentSection && l === currentSection.link));
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateScrollEffects);
        }
      },
      { passive: true }
    );
    updateScrollEffects();

    // Pointer specular highlight on cards
    document.querySelectorAll(".bento-tile, .perf-card, .flow-node").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  bindEvents();
  renderProofing();
  initProgressiveMotion();
  syncLatestGitHubRelease();
})();
