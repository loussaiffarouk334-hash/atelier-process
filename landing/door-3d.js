/* ============================================================================
   door-3d.js — Scène 3D : on clique sur la porte du LEAR, elle s'ouvre,
   la lumière déborde, on entre dans l'app Atelier Process.

   Approche : le bâtiment est une image plein-cadre (HTML), la porte + sol
   + particules + lumières sont en WebGL par-dessus. Caméra qui s'avance
   légèrement vers la porte à l'ouverture, puis transition vers l'app.
============================================================================ */
(function () {
  const INTRO_ID = "door-intro";
  const HINT_ID = "door-hint";

  function $(id) { return document.getElementById(id); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  // Dessine la texture "porte vitrée fumée" — utilisée à la fois par la scène
  // 3D desktop (comme texture Three.js) et par l'intro mobile (comme canvas
  // 2D affiché directement), pour garantir un rendu visuel identique.
  function paintDoorPanelTexture(ctx, w, h, side) {
    // Verre fumé (un peu plus clair pour qu'on lise la texture)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#2a2e36");
    grad.addColorStop(0.5, "#3c4150");
    grad.addColorStop(1, "#22252c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Reflets obliques
    ctx.globalCompositeOperation = "lighter";
    const refl = ctx.createLinearGradient(0, 0, w, h);
    refl.addColorStop(0, "rgba(255,170,110,0)");
    refl.addColorStop(0.4, "rgba(255,170,110,0.30)");
    refl.addColorStop(0.5, "rgba(255,220,180,0.50)");
    refl.addColorStop(0.6, "rgba(255,170,110,0.30)");
    refl.addColorStop(1, "rgba(255,170,110,0)");
    ctx.fillStyle = refl;
    ctx.fillRect(0, 0, w, h);
    // Halo central (intérieur du bâtiment, plus prononcé)
    const lamp = ctx.createRadialGradient(w * 0.5, h * 0.32, 12, w * 0.5, h * 0.32, w * 0.8);
    lamp.addColorStop(0, "rgba(255,235,200,0.85)");
    lamp.addColorStop(0.5, "rgba(255,220,180,0.35)");
    lamp.addColorStop(1, "rgba(255,235,200,0)");
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);
    // Reflet bleu froid (sky)
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.3);
    sky.addColorStop(0, "rgba(140,180,255,0.18)");
    sky.addColorStop(1, "rgba(140,180,255,0)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    // Encadrement
    ctx.strokeStyle = "#08090b";
    ctx.lineWidth = Math.max(4, w * 0.035);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    // Traverses horizontales
    ctx.fillStyle = "#0a0c0f";
    const barH = Math.max(2, h * 0.006);
    const ys = [0.20, 0.38, 0.58, 0.78];
    for (const fy of ys) ctx.fillRect(ctx.lineWidth, fy * h - barH / 2, w - ctx.lineWidth * 2, barH);
    // Montant côté intérieur
    const jamb = Math.max(2, w * 0.012);
    if (side === +1) ctx.fillRect(0, ctx.lineWidth, jamb, h - ctx.lineWidth * 2);
    else ctx.fillRect(w - jamb, ctx.lineWidth, jamb, h - ctx.lineWidth * 2);
    // Poignée dorée
    ctx.fillStyle = "#3a3d44";
    const handleX = side < 0 ? w * 0.78 : w * 0.22;
    const hw = Math.max(3, w * 0.016), hl = h * 0.11;
    ctx.fillRect(handleX - hw / 2, h * 0.50 - hl / 2, hw, hl);
    ctx.fillStyle = "#d4b78a";
    ctx.beginPath(); ctx.arc(handleX, h * 0.50, w * 0.028, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,230,180,0.5)";
    ctx.beginPath(); ctx.arc(handleX - w * 0.006, h * 0.50 - h * 0.003, w * 0.01, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1c20";
    ctx.beginPath(); ctx.arc(handleX, h * 0.50, w * 0.008, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Construction de la scène ----------
  function buildIntro() {
    if (typeof THREE === "undefined") {
      console.warn("[door-3d] Three.js indisponible — skip intro");
      return null;
    }

    const wrap = document.createElement("div");
    wrap.id = INTRO_ID;
    wrap.style.cssText = [
      "position:fixed", "inset:0", "z-index:9999",
      "background:#0b0c10",
      "overflow:hidden",
      "cursor:default",
      "user-select:none",
      "-webkit-tap-highlight-color:transparent",
      "font-family:'Outfit','Inter',system-ui,sans-serif",
    ].join(";");
    document.body.appendChild(wrap);

    // ----- Image du bâtiment en arrière-plan (HTML) -----
    const bg = document.createElement("div");
    bg.style.cssText = [
      "position:absolute", "inset:0", "z-index:0",
      "background-image:url('assets/img/building.jpg')",
      "background-size:cover",
      "background-position:center 38%",
      "background-repeat:no-repeat",
      "filter:brightness(0.78) saturate(1.05) contrast(1.05)",
      "transform:scale(1.08)",
      "transform-origin:62% 50%",
    ].join(";");
    wrap.appendChild(bg);

    // ----- Voile sombre dégradé pour le contraste et intégrer le HUD -----
    const veil = document.createElement("div");
    veil.style.cssText = [
      "position:absolute", "inset:0", "z-index:1", "pointer-events:none",
      "background:",
      "linear-gradient(180deg, rgba(7,8,12,0.65) 0%, rgba(7,8,12,0.10) 22%, rgba(7,8,12,0.05) 55%, rgba(7,8,12,0.55) 78%, rgba(7,8,12,0.92) 100%),",
      "radial-gradient(ellipse at 62% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.75) 100%)",
    ].join(";");
    wrap.appendChild(veil);

    // ----- Canvas WebGL pour la porte 3D et les effets -----
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;z-index:2;display:block;width:100%;height:100%";
    wrap.appendChild(canvas);

    // ----- HUD (header + hint bas + footer) -----
    const hud = document.createElement("div");
    hud.style.cssText = "position:absolute;inset:0;z-index:3;pointer-events:none;color:#e7e7ea";
    hud.innerHTML = `
      <div style="position:absolute;top:26px;left:42px;right:42px;display:flex;align-items:center;justify-content:space-between;gap:24px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#ef4444,#b91c1c);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(239,68,68,.45),inset 0 1px 0 rgba(255,255,255,.25)">
            <span style="color:#fff;font-weight:800;font-size:19px;letter-spacing:-.5px">L</span>
          </div>
          <div>
            <div style="font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:#9ca3af;font-weight:500">Atelier Process</div>
            <div style="font-size:18px;font-weight:600;color:#fff;letter-spacing:-.3px;margin-top:1px">LEAR · Traçabilité Airbag</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:#cbd1da;font-family:'JetBrains Mono',monospace;text-shadow:0 1px 3px rgba(0,0,0,.6)">${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</div>
          <div style="font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:#9ca3af;font-family:'JetBrains Mono',monospace;margin-top:4px;text-shadow:0 1px 3px rgba(0,0,0,.6)" id="door-clock">${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
        </div>
      </div>
      <div id="${HINT_ID}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:90px;text-align:center;transition:opacity .6s ease">
        <div style="font-size:10.5px;letter-spacing:.4em;text-transform:uppercase;color:#cbd1da;margin-bottom:12px;font-family:'JetBrains Mono',monospace;text-shadow:0 1px 4px rgba(0,0,0,.7)">Cliquez sur la porte pour entrer</div>
        <div style="display:inline-flex;align-items:center;gap:10px;padding:11px 22px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(15,17,22,0.55);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 4px 24px rgba(0,0,0,.4)">
          <span class="pulse-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 14px #10b981"></span>
          <span style="font-size:13px;color:#fff;font-weight:500">Ouvrir la porte</span>
        </div>
        <div style="margin-top:12px;font-size:10px;letter-spacing:.3em;color:#9ca3af;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,.7)">ou appuyez sur <kbd style="font-family:'JetBrains Mono',monospace;padding:2px 8px;border:1px solid #6b7280;border-radius:6px;color:#e7e7ea;background:rgba(0,0,0,.35)">Espace</kbd></div>
      </div>
      <div style="position:absolute;bottom:26px;left:42px;right:42px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px">
        <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#9ca3af;font-family:'JetBrains Mono',monospace;text-shadow:0 1px 4px rgba(0,0,0,.7)">© LEAR Corporation</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#cbd1da;font-family:'JetBrains Mono',monospace;text-shadow:0 1px 4px rgba(0,0,0,.7)">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981"></span>
          Atelier · Prêt
        </div>
      </div>`;
    wrap.appendChild(hud);

    // ----- CSS animations HUD -----
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
      .pulse-dot { animation: pulse-dot 1.6s ease-in-out infinite; }
      #${INTRO_ID} kbd { font-family: 'JetBrains Mono', monospace; }
    `;
    wrap.appendChild(styleEl);

    setInterval(() => {
      const el = $("door-clock");
      if (el) el.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }, 1000);

    // ----- Parallax léger de l'image au mouvement de la souris -----
    let mouseNorm = { x: 0, y: 0 };
    function onParallax(e) {
      const r = wrap.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      mouseNorm.x = (cx / r.width) * 2 - 1;
      mouseNorm.y = (cy / r.height) * 2 - 1;
    }
    window.addEventListener("mousemove", onParallax);
    window.addEventListener("touchmove", onParallax, { passive: true });

    // ---------- Three.js ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.7, 7.0);
    camera.lookAt(0, 1.4, 0);

    // ----- Lumières -----
    scene.add(new THREE.AmbientLight(0x404048, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffe7c5, 1.2);
    keyLight.position.set(-4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const fill = new THREE.DirectionalLight(0x88a0ff, 0.35);
    fill.position.set(6, 4, 4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xff5566, 0.4);
    rim.position.set(0, 3, -6);
    scene.add(rim);

    // Lumière intérieure (derrière la porte) — forte quand la porte s'ouvre
    const interiorLight = new THREE.PointLight(0xfff2c2, 0, 18, 1.4);
    interiorLight.position.set(0, 1.6, 0.6);
    scene.add(interiorLight);

    // ----- Sol (3D) -----
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x14151a, roughness: 0.92, metalness: 0.1, transparent: true, opacity: 0.96 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // ----- Porte 3D -----
    // On place la porte au centre, à hauteur d'œil. Le bâtiment (image HTML) est en arrière-plan.
    const DOOR_W = 2.4;
    const DOOR_H = 3.2;
    const DOOR_X = 0.0;
    const DOOR_Y = DOOR_H / 2 + 0.02;
    const DOOR_Z = 0.0;

    const doorGroup = new THREE.Group();
    doorGroup.position.set(DOOR_X, DOOR_Y, DOOR_Z);
    scene.add(doorGroup);

    function makeDoorPanel(side) {
      const w = DOOR_W / 2 - 0.012;
      const h = DOOR_H - 0.01;
      const t = 0.05;
      const geo = new THREE.BoxGeometry(w, h, t);

      const c = document.createElement("canvas");
      c.width = 512; c.height = 1024;
      const ctx = c.getContext("2d");
      paintDoorPanelTexture(ctx, c.width, c.height, side);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.18, metalness: 0.75,
        emissive: 0x2a2418, emissiveIntensity: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    // Encadrement de porte
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.55, metalness: 0.55 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.18, DOOR_H + 0.18, 0.12), frameMat);
    frame.position.set(0, 0, -0.07);
    frame.castShadow = true; frame.receiveShadow = true;
    doorGroup.add(frame);

    // Seuil
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.7, metalness: 0.18 });
    const step = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.7, 0.14, 0.7), stepMat);
    step.position.set(0, -DOOR_H / 2 + 0.07, 0.4);
    step.castShadow = true; step.receiveShadow = true;
    doorGroup.add(step);

    // Logo LEAR au-dessus
    const logoC = document.createElement("canvas");
    logoC.width = 1024; logoC.height = 256;
    const lctx = logoC.getContext("2d");
    lctx.fillStyle = "#1a1c20";
    lctx.fillRect(0, 0, logoC.width, logoC.height);
    lctx.fillStyle = "#dc2626";
    lctx.beginPath();
    lctx.arc(180, 128, 92, 0, Math.PI * 2);
    lctx.fill();
    lctx.fillStyle = "rgba(255,255,255,0.20)";
    lctx.beginPath();
    lctx.arc(155, 100, 38, 0, Math.PI * 2);
    lctx.fill();
    lctx.fillStyle = "#fff";
    lctx.font = "bold 130px Outfit, sans-serif";
    lctx.textBaseline = "middle";
    lctx.textAlign = "center";
    lctx.fillText("L", 180, 130);
    lctx.fillStyle = "#fff";
    lctx.font = "600 130px Outfit, sans-serif";
    lctx.textAlign = "left";
    lctx.fillText("LEAR", 310, 132);
    const logoTex = new THREE.CanvasTexture(logoC);
    logoTex.colorSpace = THREE.SRGBColorSpace;
    const logoMat = new THREE.MeshStandardMaterial({
      map: logoTex, emissive: 0xffffff, emissiveMap: logoTex, emissiveIntensity: 0.45,
      roughness: 0.45, metalness: 0.35,
    });
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.7), logoMat);
    logo.position.set(0, DOOR_H / 2 + 0.55, 0.05);
    doorGroup.add(logo);

    // Plaque "ENTRER" sous le logo, plus discrète
    const signC = document.createElement("canvas");
    signC.width = 1024; signC.height = 128;
    const sctx = signC.getContext("2d");
    sctx.fillStyle = "rgba(0,0,0,0)";
    sctx.fillRect(0, 0, signC.width, signC.height);
    sctx.fillStyle = "#fff";
    sctx.font = "500 70px Outfit, sans-serif";
    sctx.textBaseline = "middle";
    sctx.textAlign = "center";
    sctx.letterSpacing = "12px";
    sctx.fillText("E N T R E R", signC.width / 2, signC.height / 2);
    const signTex = new THREE.CanvasTexture(signC);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshBasicMaterial({
      map: signTex, transparent: true, opacity: 0.75,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.2), signMat);
    sign.position.set(0, DOOR_H / 2 + 0.95, 0.05);
    doorGroup.add(sign);

    // Battants
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-DOOR_W / 4, 0, 0);
    const leftPanel = makeDoorPanel(-1);
    leftPanel.position.set(DOOR_W / 4, 0, 0.03);
    leftPivot.add(leftPanel);
    doorGroup.add(leftPivot);

    const rightPivot = new THREE.Group();
    rightPivot.position.set(DOOR_W / 4, 0, 0);
    const rightPanel = makeDoorPanel(+1);
    rightPanel.position.set(-DOOR_W / 4, 0, 0.03);
    rightPivot.add(rightPanel);
    doorGroup.add(rightPivot);

    // Halo doré derrière la porte
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffe2a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W * 1.4, DOOR_H * 1.4), glowMat);
    glow.position.set(0, 0, -0.12);
    doorGroup.add(glow);

    // Faisceau volumétrique
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfff2c2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W * 1.1, DOOR_H * 1.6), beamMat);
    beam.position.set(0, 0, 1.0);
    doorGroup.add(beam);

    // Halo hover
    const hoverGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const hoverGlow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W * 1.8, DOOR_H * 1.8), hoverGlowMat);
    hoverGlow.position.set(DOOR_X, DOOR_Y, DOOR_Z + 0.8);
    scene.add(hoverGlow);

    // ----- Particules dorées -----
    const PCOUNT = 260;
    const positions = new Float32Array(PCOUNT * 3);
    const vels = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1;
      vels[i * 3] = (Math.random() - 0.5) * 0.0025;
      vels[i * 3 + 1] = 0.0015 + Math.random() * 0.004;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.0025;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd58a, size: 0.032, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ----- Raycast -----
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoverState = false;

    function setMouseFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      mouse.x = (cx / rect.width) * 2 - 1;
      mouse.y = -((cy / rect.height) * 2 - 1);
    }
    function isHoveringDoor() {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([leftPanel, rightPanel, frame, logo, sign], false);
      return hits.length > 0;
    }
    function onMove(e) {
      setMouseFromEvent(e);
      const h = isHoveringDoor();
      if (h !== hoverState) {
        hoverState = h;
        canvas.style.cursor = h ? "pointer" : "default";
      }
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: true });

    // ----- Animation -----
    let phase = "idle";
    let lastTime = performance.now();
    let openStartTime = 0;
    const CAM_START = { x: 0, y: 1.7, z: 7.0 };

    function startOpen() {
      if (phase !== "idle") return;
      phase = "opening";
      openStartTime = performance.now();
      const hint = $(HINT_ID);
      if (hint) hint.style.opacity = "0";
      canvas.style.cursor = "default";
    }
    function onClick() { if (phase === "idle") startOpen(); }
    function onKey(e) {
      if (phase !== "idle") return;
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); startOpen(); }
    }
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchend", (e) => { if (phase === "idle") { e.preventDefault(); onClick(); } }, { passive: false });
    window.addEventListener("keydown", onKey);

    function onResize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    function render(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Parallax de l'image de fond
      const tx = mouseNorm.x * 14;
      const ty = mouseNorm.y * 8;
      bg.style.transform = `scale(1.10) translate(${-tx * 0.4}px, ${-ty * 0.4}px)`;

      if (phase === "idle") {
        // respiration très légère
        camera.position.y = CAM_START.y + Math.sin(now * 0.0007) * 0.04;
        camera.position.x = CAM_START.x + Math.sin(now * 0.0004) * 0.05;
        camera.lookAt(DOOR_X, DOOR_Y, DOOR_Z);
      }

      // Hover glow (plus visible)
      const targetHoverOpacity = (phase === "idle" && hoverState) ? 0.32 : 0;
      hoverGlowMat.opacity = lerp(hoverGlowMat.opacity, targetHoverOpacity, clamp(dt * 6, 0, 1));

      if (phase === "opening") {
        const t = clamp((now - openStartTime) / 2000, 0, 1);
        const eased = easeInOutCubic(t);
        const angle = eased * 1.30; // ~75°
        leftPivot.rotation.y = angle;
        rightPivot.rotation.y = -angle;
        glowMat.opacity = eased * 0.55;
        beamMat.opacity = eased * 0.35;
        // Flicker subtil de la lumière intérieure
        const flicker = 1 + Math.sin(now * 0.012) * 0.05 + Math.sin(now * 0.027) * 0.03;
        interiorLight.intensity = eased * 3.5 * flicker;

        // Caméra : on s'approche mais sans traverser (s'arrête devant la porte)
        if (t > 0.45) {
          const k = (t - 0.45) / 0.55;
          const kE = easeOutQuart(k);
          camera.position.z = lerp(CAM_START.z, 4.5, kE);
          camera.position.x = lerp(CAM_START.x, DOOR_X * 0.3, kE);
          camera.position.y = lerp(CAM_START.y, DOOR_Y - 0.05, kE);
          camera.lookAt(DOOR_X, DOOR_Y, DOOR_Z - 0.6);
        }
        if (t >= 1) setTimeout(finishIntro, 300);
      }

      // Particules
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < PCOUNT; i++) {
        pos[i * 3] += vels[i * 3];
        pos[i * 3 + 1] += vels[i * 3 + 1];
        pos[i * 3 + 2] += vels[i * 3 + 2];
        if (pos[i * 3 + 1] > 5) {
          pos[i * 3] = (Math.random() - 0.5) * 16;
          pos[i * 3 + 1] = -0.1;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      if (phase !== "done") requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    function finishIntro() {
      phase = "done";
      const flash = document.createElement("div");
      flash.style.cssText = "position:absolute;inset:0;z-index:5;background:radial-gradient(circle at 50% 50%, #fff7d6 0%, #fff2c2 25%, rgba(255,242,194,0) 65%);opacity:0;pointer-events:none;transition:opacity .7s ease";
      wrap.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = "1"; });
      setTimeout(() => {
        wrap.style.transition = "opacity .9s ease";
        wrap.style.opacity = "0";
        setTimeout(() => {
          wrap.remove();
          window.dispatchEvent(new Event("resize"));
        }, 950);
      }, 320);
      try { localStorage.setItem("atelier-door-seen", "1"); } catch (e) {}
    }
  }

  // ============================================================================
  // INTRO MOBILE — expérience tactile dédiée, sans WebGL : légère, rapide à
  // charger, et cadrée pour le format portrait (fini le recadrage "cover"
  // agressif d'une photo pensée pour un écran large). Même identité visuelle
  // que la version desktop (portes vitrées fumées, halo doré, particules,
  // logo LEAR) mais entièrement en CSS/DOM pour un rendu fluide garanti sur
  // tous les téléphones, y compris d'entrée de gamme.
  // ============================================================================
  function buildMobileIntro() {
    const wrap = document.createElement("div");
    wrap.id = INTRO_ID;
    wrap.style.cssText = [
      "position:fixed", "inset:0", "z-index:9999",
      "background:#07070b", "overflow:hidden",
      "-webkit-tap-highlight-color:transparent", "user-select:none",
      "font-family:'Outfit','Inter',system-ui,sans-serif",
    ].join(";");
    document.body.appendChild(wrap);

    // ----- Image de fond, cadrée pour le portrait, léger Ken Burns -----
    const bg = document.createElement("div");
    bg.style.cssText = [
      "position:absolute", "inset:-4%", "z-index:0",
      "background-image:url('assets/img/building.jpg')",
      "background-size:cover", "background-position:66% 22%", "background-repeat:no-repeat",
      "filter:brightness(0.60) saturate(1.08) contrast(1.08)",
      "animation:doorKenBurns 15s ease-in-out infinite alternate",
    ].join(";");
    wrap.appendChild(bg);

    // ----- Voile / vignette pour intégrer le HUD et assombrir les bords -----
    const veil = document.createElement("div");
    veil.style.cssText = [
      "position:absolute", "inset:0", "z-index:1", "pointer-events:none",
      "background:",
      "linear-gradient(180deg, rgba(5,6,9,.85) 0%, rgba(5,6,9,.28) 20%, rgba(5,6,9,.16) 48%, rgba(5,6,9,.58) 74%, rgba(5,6,9,.96) 100%),",
      "radial-gradient(ellipse 90% 60% at 50% 46%, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.85) 100%)",
    ].join(";");
    wrap.appendChild(veil);

    // ----- Halo doré derrière la porte (s'intensifie à l'ouverture) -----
    const glow = document.createElement("div");
    glow.style.cssText = [
      "position:absolute", "z-index:2", "left:50%", "top:47%",
      "width:120vw", "height:120vw", "max-width:640px", "max-height:640px",
      "transform:translate(-50%,-50%)", "border-radius:50%", "pointer-events:none",
      "background:radial-gradient(circle, rgba(255,226,168,0) 0%, rgba(255,226,168,0) 70%)",
      "opacity:0", "transition:opacity 1.1s ease",
    ].join(";");
    wrap.appendChild(glow);

    // ----- Particules dorées (légères, en CSS pur — pas de boucle JS par frame) -----
    const particleLayer = document.createElement("div");
    particleLayer.style.cssText = "position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden";
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("span");
      const left = 28 + Math.random() * 44;
      const size = 2 + Math.random() * 3;
      const dur = 5 + Math.random() * 5;
      const delay = (Math.random() * -dur).toFixed(2);
      p.style.cssText = [
        "position:absolute", `left:${left}%`, "bottom:-6%",
        `width:${size}px`, `height:${size}px`, "border-radius:50%",
        "background:#ffd58a", "box-shadow:0 0 6px 1px rgba(255,213,138,.8)", "opacity:0",
        `animation:doorParticleRise ${dur}s ease-in ${delay}s infinite`,
      ].join(";");
      particleLayer.appendChild(p);
    }
    wrap.appendChild(particleLayer);

    // ----- Scène de la porte (CSS 3D) -----
    const stageWrap = document.createElement("div");
    stageWrap.style.cssText = "position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-46%);perspective:1400px;width:min(78vw,340px);aspect-ratio:3/4.3;";
    wrap.appendChild(stageWrap);

    const frame = document.createElement("div");
    frame.style.cssText = "position:absolute;inset:-3.5% -3.5% -1% -3.5%;z-index:0;border-radius:6px;background:linear-gradient(180deg,#141519,#0a0a0c);box-shadow:0 18px 50px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.04);";
    stageWrap.appendChild(frame);

    const doorsInner = document.createElement("div");
    doorsInner.style.cssText = "position:absolute;inset:0;z-index:1;transform-style:preserve-3d;";
    stageWrap.appendChild(doorsInner);

    function makeDoorHalf(side) {
      const holder = document.createElement("div");
      holder.style.cssText = [
        "position:absolute", "top:0", "bottom:0",
        side < 0 ? "left:0" : "right:0", "width:50%",
        "transform-style:preserve-3d",
        `transform-origin:${side < 0 ? "left" : "right"} center`,
        "transition:transform 1.15s cubic-bezier(.65,0,.35,1)",
        "box-shadow:0 0 30px rgba(0,0,0,.5)", "overflow:hidden", "border-radius:2px",
      ].join(";");
      const canvas = document.createElement("canvas");
      canvas.width = 340; canvas.height = 976;
      canvas.style.cssText = "display:block;width:100%;height:100%";
      paintDoorPanelTexture(canvas.getContext("2d"), canvas.width, canvas.height, side);
      holder.appendChild(canvas);
      return holder;
    }
    const leftDoor = makeDoorHalf(-1);
    const rightDoor = makeDoorHalf(+1);
    doorsInner.appendChild(leftDoor);
    doorsInner.appendChild(rightDoor);

    // Faisceau de lumière derrière les portes, révélé à l'ouverture
    const beam = document.createElement("div");
    beam.style.cssText = "position:absolute;inset:6% 8%;z-index:-1;background:radial-gradient(ellipse at 50% 30%, rgba(255,242,194,.9) 0%, rgba(255,224,150,.35) 45%, rgba(255,224,150,0) 75%);opacity:0;transition:opacity 1s ease;border-radius:4px;";
    doorsInner.appendChild(beam);

    // Logo LEAR au-dessus de la porte
    const logo = document.createElement("div");
    logo.style.cssText = "position:absolute;left:50%;top:-15%;transform:translateX(-50%);display:flex;align-items:center;gap:9px;z-index:4;";
    logo.innerHTML = `
      <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#ef4444,#b91c1c);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 14px rgba(239,68,68,.5)">
        <span style="color:#fff;font-weight:800;font-size:14px">L</span>
      </div>
      <span style="color:#fff;font-weight:600;font-size:14px;letter-spacing:-.2px;text-shadow:0 1px 6px rgba(0,0,0,.6)">LEAR</span>`;
    stageWrap.appendChild(logo);

    // ----- HUD -----
    const hud = document.createElement("div");
    hud.style.cssText = "position:absolute;inset:0;z-index:5;pointer-events:none;color:#e7e7ea;";
    hud.innerHTML = `
      <div style="position:absolute;top:calc(20px + env(safe-area-inset-top));left:20px;right:20px">
        <div style="font-size:9.5px;letter-spacing:.28em;text-transform:uppercase;color:#9ca3af;font-weight:500">Atelier Process</div>
        <div style="font-size:15px;font-weight:600;color:#fff;letter-spacing:-.2px;margin-top:2px">LEAR · Traçabilité Airbag</div>
      </div>
      <div id="${HINT_ID}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:calc(56px + env(safe-area-inset-bottom));text-align:center;transition:opacity .5s ease;width:100%;padding:0 24px">
        <div style="display:inline-flex;align-items:center;gap:9px;padding:12px 24px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(15,17,22,.55);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 4px 20px rgba(0,0,0,.4)">
          <span style="position:relative;display:inline-flex;width:9px;height:9px">
            <span style="position:absolute;inset:0;border-radius:50%;background:#10b981;box-shadow:0 0 12px #10b981"></span>
            <span style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid #10b981;opacity:.6;animation:doorTapPulse 1.6s ease-out infinite"></span>
          </span>
          <span style="font-size:12.5px;color:#fff;font-weight:600;letter-spacing:.01em">Touchez la porte pour entrer</span>
        </div>
      </div>
      <div style="position:absolute;bottom:calc(18px + env(safe-area-inset-bottom));left:20px;right:20px;text-align:center">
        <span style="font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#7b7f88">© LEAR Corporation</span>
      </div>`;
    wrap.appendChild(hud);

    // ----- Keyframes CSS -----
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes doorKenBurns { 0%{transform:scale(1.04) translate(0,0)} 100%{transform:scale(1.12) translate(-1.2%,-1%)} }
      @keyframes doorParticleRise { 0%{opacity:0; transform:translateY(0) scale(.6)} 12%{opacity:.9} 85%{opacity:.5} 100%{opacity:0; transform:translateY(-92vh) scale(1)} }
      @keyframes doorTapPulse { 0%{transform:scale(.7);opacity:.7} 100%{transform:scale(2.6);opacity:0} }
    `;
    wrap.appendChild(styleEl);

    // ----- Interaction : toute la scène est tactile (grande zone de tap) -----
    let opened = false;
    function openDoor() {
      if (opened) return;
      opened = true;
      if (navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
      const hint = document.getElementById(HINT_ID);
      if (hint) hint.style.opacity = "0";
      leftDoor.style.transform = "rotateY(-108deg)";
      rightDoor.style.transform = "rotateY(108deg)";
      beam.style.opacity = "1";
      glow.style.opacity = "1";
      glow.style.background = "radial-gradient(circle, rgba(255,226,168,.55) 0%, rgba(255,226,168,.18) 45%, rgba(255,226,168,0) 72%)";
      setTimeout(finishMobileIntro, 1150);
    }
    const tapZone = document.createElement("div");
    tapZone.style.cssText = "position:absolute;inset:0;z-index:6;cursor:pointer;";
    tapZone.addEventListener("click", openDoor);
    wrap.appendChild(tapZone);

    function finishMobileIntro() {
      const flash = document.createElement("div");
      flash.style.cssText = "position:absolute;inset:0;z-index:8;background:radial-gradient(circle at 50% 44%, #fff7d6 0%, #fff2c2 25%, rgba(255,242,194,0) 68%);opacity:0;pointer-events:none;transition:opacity .7s ease";
      wrap.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = "1"; });
      setTimeout(() => {
        wrap.style.transition = "opacity .85s ease";
        wrap.style.opacity = "0";
        setTimeout(() => {
          wrap.remove();
          window.dispatchEvent(new Event("resize"));
        }, 900);
      }, 300);
      try { localStorage.setItem("atelier-door-seen", "1"); } catch (e) {}
    }
  }

  // ---------- Lancement ----------
  function init() {
    // Mobile / petit écran : expérience dédiée, légère (sans WebGL), pensée
    // pour le tactile — l'intro 3D desktop reste inchangée pour les grands
    // écrans (image "cover" + caméra 3D calibrées pour le format large).
    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      buildMobileIntro();
      return;
    }
    if (window.THREE) { buildIntro(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
    s.onload = () => buildIntro();
    s.onerror = () => console.warn("[door-3d] échec du chargement Three.js");
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

