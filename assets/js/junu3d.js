/**
 * JUNU STUDIO • Luxury 3D Atelier Stage & Interactive Garment Viewer
 * Creative Direction: Roselyn Magar • Kathmandu, Nepal
 * Built with Three.js (r128)
 *
 * Features:
 * - High-Resolution Double-Sided 3D Couture Presentation (Front + Back alternate view)
 * - Beveled Brushed-Gold Frame with Turned Brass Pedestal
 * - Polished Dark Marble Turntable Platform with Real-Time Reflection Shadow
 * - Floating Golden Atmospheric Light Particles
 * - 3-Point Studio Lighting (Key Runway Spotlight, Cool Fill, Gold Rim Halo)
 * - 360° Orbital Inertia Drag & Touch Controls with Smooth Damping
 * - Dynamic Presets: Front, 3/4 Runway, Side Profile, Back Angle, Macro Zoom
 * - 3 Studio Light Modes: Runway Spotlight, Golden Hour, Candlelight
 */

(function(window) {
  'use strict';

  function Junu3DViewer(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Junu3D: container or THREE not available');
      return;
    }

    this.options = Object.assign({
      imageSrc: '',
      altImageSrc: '',
      autoRotate: true,
      onReady: null,
      onError: null
    }, options || {});

    this.autoRotate = this.options.autoRotate;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.lastInteraction = 0;

    this.targetRotY = 0;
    this.targetRotX = 0;
    this.currentRotY = 0;
    this.currentRotX = 0;

    this.targetZoom = 1.0;
    this.currentZoom = 1.0;
    this.targetPanY = 1.5;
    this.currentPanY = 1.5;

    this.clock = 0;

    this._initScene();
    this._buildStudioStage();
    this._buildLighting();
    this._loadGarmentAssets();
    this._attachEventListeners();
    this._startAnimationLoop();
  }

  Junu3DViewer.prototype._initScene = function() {
    const w = this.container.clientWidth || 600;
    const h = this.container.clientHeight || 620;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x100e0d, 0.05);

    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    this.camera.position.set(0, 1.5, 5.2);
    this.camera.lookAt(0, 1.4, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';

    // Main rotating turntable pivot group
    this.turntableGroup = new THREE.Group();
    this.scene.add(this.turntableGroup);
  };

  Junu3DViewer.prototype._buildLighting = function() {
    // Ambient fill
    this.ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(this.ambientLight);

    // Key Runway Spotlight (Warm, Crisp)
    this.keyLight = new THREE.DirectionalLight(0xfff1dc, 1.8);
    this.keyLight.position.set(2.5, 4.5, 3.8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Cool Studio Side Fill
    this.fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    this.fillLight.position.set(-3.2, 2.5, 2.0);
    this.scene.add(this.fillLight);

    // Golden Rim Halo Backlight (accents edges)
    this.rimLight = new THREE.DirectionalLight(0xecbf84, 1.6);
    this.rimLight.position.set(0, 3.2, -3.2);
    this.scene.add(this.rimLight);
  };

  Junu3DViewer.prototype._buildStudioStage = function() {
    // 1. Polished Marble Turntable Dais
    const daisGeo = new THREE.CylinderGeometry(1.5, 1.58, 0.08, 64);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x181615,
      roughness: 0.3,
      metalness: 0.3
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -0.04;
    dais.receiveShadow = true;
    this.turntableGroup.add(dais);

    // 2. Brushed Gold Inlay Rim Ring
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
      emissive: 0x3d2b0e,
      emissiveIntensity: 0.2
    });
    this.goldMat = goldMat;

    const ringGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 64);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.005;
    this.turntableGroup.add(ring);

    // 3. Realistic Soft Contact Shadow on Stage Floor
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    this.turntableGroup.add(shadowMesh);

    // 4. Turned Brass Central Mounting Column & Finials
    const columnGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.45, 24);
    const column = new THREE.Mesh(columnGeo, goldMat);
    column.position.y = 0.225;
    this.turntableGroup.add(column);

    const baseCollarGeo = new THREE.TorusGeometry(0.08, 0.016, 12, 32);
    const collar = new THREE.Mesh(baseCollarGeo, goldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.02;
    this.turntableGroup.add(collar);

    // Top Crown Finial
    const finialGeo = new THREE.SphereGeometry(0.045, 24, 24);
    const finial = new THREE.Mesh(finialGeo, goldMat);
    finial.position.y = 2.76;
    this.turntableGroup.add(finial);

    // 5. Floating Golden Atmospheric Dust Particles
    const dustCount = 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 4.5;
      dustPos[i * 3 + 1] = Math.random() * 3.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xecbf84,
      size: 0.02,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    this.dust = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dust);
  };

  Junu3DViewer.prototype._loadGarmentAssets = function() {
    const self = this;
    const texLoader = new THREE.TextureLoader();

    // Load primary front image
    texLoader.load(
      this.options.imageSrc,
      function(frontTex) {
        frontTex.encoding = THREE.sRGBEncoding;
        frontTex.anisotropy = self.renderer.capabilities.getMaxAnisotropy();

        // Load alternate back image (or fallback to front if not provided)
        const backSrc = self.options.altImageSrc || self.options.imageSrc;
        texLoader.load(
          backSrc,
          function(backTex) {
            backTex.encoding = THREE.sRGBEncoding;
            backTex.anisotropy = self.renderer.capabilities.getMaxAnisotropy();
            self._buildCoutureDisplayPlinth(frontTex, backTex);
            if (self.options.onReady) self.options.onReady();
          },
          undefined,
          function() {
            // If back image fails, reuse front texture
            self._buildCoutureDisplayPlinth(frontTex, frontTex);
            if (self.options.onReady) self.options.onReady();
          }
        );
      },
      undefined,
      function(err) {
        console.error('Junu3D: Primary image failed to load', err);
        if (self.options.onError) self.options.onError(err);
      }
    );
  };

  Junu3DViewer.prototype._buildCoutureDisplayPlinth = function(frontTex, backTex) {
    if (this.plinthGroup) {
      this.turntableGroup.remove(this.plinthGroup);
    }
    this.plinthGroup = new THREE.Group();

    // Dimensions: elegant 3:4 portrait couture aspect ratio
    const H = 2.24;
    const W = 1.68;
    const D = 0.05;

    // 1. Brushed Gold Outer Frame
    const frameMat = this.goldMat;

    // Top & Bottom Frame Bars
    const hBarGeo = new THREE.BoxGeometry(W + 0.06, 0.035, D + 0.015);
    const topBar = new THREE.Mesh(hBarGeo, frameMat);
    topBar.position.y = 1.57 + H / 2;
    topBar.castShadow = true;

    const botBar = new THREE.Mesh(hBarGeo, frameMat);
    botBar.position.y = 1.57 - H / 2;
    botBar.castShadow = true;

    // Left & Right Vertical Frame Posts
    const vBarGeo = new THREE.BoxGeometry(0.035, H + 0.035, D + 0.015);
    const leftBar = new THREE.Mesh(vBarGeo, frameMat);
    leftBar.position.set(-W / 2 - 0.012, 1.57, 0);
    leftBar.castShadow = true;

    const rightBar = new THREE.Mesh(vBarGeo, frameMat);
    rightBar.position.set(W / 2 + 0.012, 1.57, 0);
    rightBar.castShadow = true;

    this.plinthGroup.add(topBar, botBar, leftBar, rightBar);

    // 2. Front Face (Primary Garment Shot)
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: 0.35,
      metalness: 0.08,
      emissive: 0xffffff,
      emissiveMap: frontTex,
      emissiveIntensity: 0.12
    });
    const frontPlaneGeo = new THREE.PlaneGeometry(W, H);
    const frontMesh = new THREE.Mesh(frontPlaneGeo, frontMat);
    frontMesh.position.set(0, 1.57, D / 2 + 0.002);
    frontMesh.castShadow = true;
    this.plinthGroup.add(frontMesh);

    // 3. Back Face (Alternate Angle / Detail Shot)
    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.35,
      metalness: 0.08,
      emissive: 0xffffff,
      emissiveMap: backTex,
      emissiveIntensity: 0.12
    });
    const backPlaneGeo = new THREE.PlaneGeometry(W, H);
    const backMesh = new THREE.Mesh(backPlaneGeo, backMat);
    backMesh.position.set(0, 1.57, -D / 2 - 0.002);
    backMesh.rotation.y = Math.PI; // Face the rear
    backMesh.castShadow = true;
    this.plinthGroup.add(backMesh);

    // 4. Edge Core Core Slabs
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1f1d1b,
      roughness: 0.5,
      metalness: 0.2
    });
    const coreGeo = new THREE.BoxGeometry(W, H, D);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 1.57, 0);
    this.plinthGroup.add(coreMesh);

    this.turntableGroup.add(this.plinthGroup);
  };

  Junu3DViewer.prototype._attachEventListeners = function() {
    const self = this;
    const dom = this.renderer.domElement;

    function onPointerDown(clientX, clientY) {
      self.isDragging = true;
      self.prevMouse = { x: clientX, y: clientY };
      self.lastInteraction = performance.now();
    }

    function onPointerMove(clientX, clientY) {
      if (!self.isDragging) return;
      const dx = clientX - self.prevMouse.x;
      const dy = clientY - self.prevMouse.y;

      self.targetRotY += dx * 0.009;
      self.targetRotX += dy * 0.004;

      // Clamp vertical tilt to keep garment beautifully framed
      self.targetRotX = Math.max(-0.35, Math.min(0.35, self.targetRotX));

      self.prevMouse = { x: clientX, y: clientY };
      self.lastInteraction = performance.now();
    }

    function onPointerUp() {
      self.isDragging = false;
    }

    // Mouse Events
    dom.addEventListener('mousedown', function(e) {
      onPointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', function(e) {
      onPointerMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', onPointerUp);

    // Touch Events for Mobile / Tablet
    dom.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    dom.addEventListener('touchmove', function(e) {
      if (self.isDragging && e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onPointerUp);

    // Wheel Zoom
    dom.addEventListener('wheel', function(e) {
      e.preventDefault();
      self.targetZoom += e.deltaY * 0.0012;
      self.targetZoom = Math.max(0.6, Math.min(1.5, self.targetZoom));
      self.lastInteraction = performance.now();
    }, { passive: false });

    // Window Resize
    window.addEventListener('resize', function() {
      if (!self.container) return;
      const w = self.container.clientWidth;
      const h = self.container.clientHeight;
      if (w && h) {
        self.camera.aspect = w / h;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(w, h);
      }
    });
  };

  Junu3DViewer.prototype._startAnimationLoop = function() {
    const self = this;

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      const now = performance.now();
      self.clock += 0.016;

      // Gentle auto-rotation when user is not dragging
      if (self.autoRotate && !self.isDragging) {
        self.targetRotY += 0.004;
      }

      // Smooth damping interpolation
      self.currentRotY += (self.targetRotY - self.currentRotY) * 0.08;
      self.currentRotX += (self.targetRotX - self.currentRotX) * 0.08;
      self.currentZoom += (self.targetZoom - self.currentZoom) * 0.09;
      self.currentPanY += (self.targetPanY - self.currentPanY) * 0.09;

      self.turntableGroup.rotation.y = self.currentRotY;
      self.turntableGroup.rotation.x = self.currentRotX;

      const dist = 5.2 * self.currentZoom;
      self.camera.position.set(0, self.currentPanY, dist);
      self.camera.lookAt(0, self.currentPanY - 0.1, 0);

      // Animate floating gold dust particles
      if (self.dust) {
        const pArr = self.dust.geometry.attributes.position;
        for (let i = 0; i < pArr.count; i++) {
          let y = pArr.getY(i) + 0.0025;
          if (y > 3.6) y = 0;
          pArr.setY(i, y);
        }
        pArr.needsUpdate = true;
      }

      // Subtle breathing rim light intensity
      if (self.rimLight) {
        self.rimLight.intensity = 1.5 + Math.sin(self.clock * 1.5) * 0.2;
      }

      self.renderer.render(self.scene, self.camera);
    }

    renderLoop();
  };

  // ================= Public API Methods =================

  Junu3DViewer.prototype.toggleAutoRotate = function() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  };

  Junu3DViewer.prototype.setCameraAngle = function(angle) {
    this.targetRotX = 0;
    this.targetPanY = 1.5;

    switch (angle) {
      case 'front':
        this.targetRotY = 0;
        this.targetZoom = 1.0;
        break;
      case 'runway':
        this.targetRotY = 0.55; // 3/4 dynamic runway perspective
        this.targetZoom = 1.0;
        break;
      case 'profile':
        this.targetRotY = Math.PI / 2; // 90° profile
        this.targetZoom = 1.0;
        break;
      case 'back':
        this.targetRotY = Math.PI; // 180° back view
        this.targetZoom = 1.0;
        break;
      case 'detail':
        this.targetRotY = 0.15;
        this.targetZoom = 0.65; // Zoom into fabric
        this.targetPanY = 1.65;
        break;
    }
  };

  Junu3DViewer.prototype.setLightingMode = function(mode) {
    if (mode === 'gold') {
      this.keyLight.color.setHex(0xffb74d);
      this.keyLight.intensity = 2.0;
      this.rimLight.color.setHex(0xffd54f);
      this.renderer.toneMappingExposure = 1.25;
    } else if (mode === 'candle') {
      this.keyLight.color.setHex(0xff8a65);
      this.keyLight.intensity = 1.5;
      this.rimLight.color.setHex(0xffab91);
      this.renderer.toneMappingExposure = 1.1;
    } else { // Runway Spotlight default
      this.keyLight.color.setHex(0xfff1dc);
      this.keyLight.intensity = 1.8;
      this.rimLight.color.setHex(0xecbf84);
      this.renderer.toneMappingExposure = 1.2;
    }
  };

  window.Junu3DViewer = Junu3DViewer;
})(window);
