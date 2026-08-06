/**
 * Fusion Raceway Circuit - Interactive VR Menu Controller
 * Dynamically matches card shape aspect ratio to image aspect ratio (Zero Cropping, Zero Bars).
 */

// Initialize WebVR Cardboard Polyfill (Guarantees 2-Eye Stereo Split on Desktop & Mobile)
if (typeof WebVRPolyfill !== 'undefined') {
  try {
    new WebVRPolyfill();
    console.log('🥽 WebVR Cardboard Polyfill Active!');
  } catch (e) {
    console.log('WebVRPolyfill init:', e);
  }
}

if (typeof AFRAME !== 'undefined') {
  
  // 1. Register VR Main Title Component (Luckiest Guy 3D Font)
  AFRAME.registerComponent('vr-title', {
    schema: {
      text: { type: 'string', default: 'Fusion Raceway Circuit' },
      width: { type: 'number', default: 14 },
      height: { type: 'number', default: 3 }
    },
    init: function () {
      this.render();
    },
    render: function () {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 220;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = '900 68px "Luckiest Guy", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Deep Red 3D Shadow (#C0392B Bayangan Merah Kedalaman)
      ctx.fillStyle = '#C0392B';
      ctx.fillText(this.data.text, cx + 4, cy + 4);

      // 2. Thick Crisp White Outline (#FFFFFF)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.strokeText(this.data.text, cx, cy);

      // 3. Primary Text Fill: 100% SAMAKAN WARNA TOMBOL (#FF4757)
      ctx.fillStyle = '#FF4757';
      ctx.fillText(this.data.text, cx, cy);

      const texture = new THREE.CanvasTexture(canvas);
      const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      this.el.setObject3D('mesh', mesh);
    }
  });

  // 2. Custom A-Frame Component for Uniform 3D Cards
  AFRAME.registerComponent('rounded-card', {
    schema: {
      width: { type: 'number', default: 5.2 },
      height: { type: 'number', default: 2.95 },
      radius: { type: 'number', default: 32 },
      color: { type: 'string', default: '#FFFFFF' },
      title: { type: 'string', default: '' },
      subtitle: { type: 'string', default: '' },
      imgSrc: { type: 'string', default: '' },
      is3d: { type: 'boolean', default: false }
    },
    init: function () {
      this.renderTexture();
    },
    renderTexture: function () {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 312;
      const ctx = canvas.getContext('2d');

      const drawRect = (x, y, w, h, r, fill, stroke, strokeW) => {
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
        }
        ctx.closePath();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeW || 4;
          ctx.stroke();
        }
      };

      // 1. Uniform White Outer Frame
      drawRect(4, 4, canvas.width - 8, canvas.height - 8, this.data.radius, '#FFFFFF', null, 0);

      // 2. Uniform Inner Dark Slate Container Box
      const boxW = canvas.width - 24;
      const boxH = canvas.height - 24;
      drawRect(12, 12, boxW, boxH, 24, '#1E272C', null, 0);

      const texture = new THREE.CanvasTexture(canvas);
      let mesh = this.el.getObject3D('mesh');
      if (!mesh) {
        const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        mesh = new THREE.Mesh(geometry, material);
        this.el.setObject3D('mesh', mesh);
      } else {
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
      }

      // 3. Load Custom Image for Card (100% Uniform Shape Fit - Zero Cropping!)
      if (this.data.imgSrc) {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(12, 12, boxW, boxH, 24);
          } else {
            ctx.rect(12, 12, boxW, boxH);
          }
          ctx.clip();

          // Fill Entire Shape cleanly
          ctx.drawImage(img, 12, 12, boxW, boxH);
          ctx.restore();

          texture.needsUpdate = true;
        };
        img.src = this.data.imgSrc;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Buttons
  const navProfil = document.getElementById('nav-profil');
  const btnHeroVR = document.getElementById('btn-hero-vr');

  // Modal & VR Containers
  const modalProfil = document.getElementById('modal-profil');
  const btnCloseProfil = document.getElementById('btn-close-profil');
  const vrWrapper = document.getElementById('vr-wrapper');
  const btnVrBack = document.getElementById('btn-vr-back');
  const appViewport = document.getElementById('app-viewport');

  // Dedicated Hop Jump A-Frame Scene Container
  const vrHopjumpWrapper = document.getElementById('vr-hopjump-wrapper');
  const btnHopjumpBack = document.getElementById('btn-hopjump-back');

  // Web Audio FX
  const playSound = (type = 'click') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      // Fallback silent
    }
  };

  // --- Profile Modal Handlers ---
  const openProfilModal = () => {
    playSound('pop');
    if (modalProfil) {
      modalProfil.classList.add('active');
      modalProfil.setAttribute('aria-hidden', 'false');
    }
  };

  const closeProfilModal = () => {
    playSound('click');
    if (modalProfil) {
      modalProfil.classList.remove('active');
      modalProfil.setAttribute('aria-hidden', 'true');
    }
  };

  // Camera View Reset Helper (Resets Camera Position & Rotation to Initial Setting 0 1.6 0 and 0 0 0)
  const resetCameraView = (cameraId) => {
    const cameraEl = document.getElementById(cameraId);
    if (!cameraEl) return;

    cameraEl.setAttribute('position', '0 1.6 0');
    cameraEl.setAttribute('rotation', '0 0 0');

    if (cameraEl.object3D) {
      cameraEl.object3D.position.set(0, 1.6, 0);
      cameraEl.object3D.rotation.set(0, 0, 0);
    }

    if (cameraEl.components && cameraEl.components['look-controls']) {
      const lc = cameraEl.components['look-controls'];
      if (lc.pitchObject) lc.pitchObject.rotation.x = 0;
      if (lc.yawObject) lc.yawObject.rotation.y = 0;
    }
  };

  // --- VR Scene Navigation ---
  const enterVRScene = () => {
    playSound('start');
    if (appViewport) appViewport.style.display = 'none';
    if (vrWrapper) {
      vrWrapper.classList.add('active');
      vrWrapper.style.display = 'block';
    }

    resetCameraView('main-camera');

    const scene = document.querySelector('a-scene');
    if (scene) {
      if (scene.hasLoaded) {
        scene.resize();
      } else {
        scene.addEventListener('loaded', () => scene.resize());
      }
    }
  };

  const exitVRScene = () => {
    playSound('click');
    stopHopJumpAnimation();
    resetCameraView('main-camera');
    resetCameraView('hopjump-camera');

    if (vrHopjumpWrapper) vrHopjumpWrapper.style.display = 'none';
    if (vrWrapper) {
      vrWrapper.classList.remove('active');
      vrWrapper.style.display = 'none';
    }
    if (appViewport) appViewport.style.display = 'flex';
  };

  // Function to Reset GLTF Animation from Frame 0
  const resetHopJumpAnimation = () => {
    const hopjumpModel = document.getElementById('hopjump-gltf-model');
    if (!hopjumpModel) return;

    hopjumpModel.removeAttribute('animation-mixer');

    if (hopjumpModel.components && hopjumpModel.components['animation-mixer']) {
      const mixerComp = hopjumpModel.components['animation-mixer'];
      if (mixerComp.mixer) {
        mixerComp.mixer.stopAllAction();
        if (mixerComp.activeActions) {
          mixerComp.activeActions.forEach(action => {
            action.reset();
            action.stop();
          });
        }
      }
    }

    setTimeout(() => {
      hopjumpModel.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1');
      if (hopjumpModel.components && hopjumpModel.components['animation-mixer']) {
        const mixerComp = hopjumpModel.components['animation-mixer'];
        if (mixerComp.mixer && mixerComp.activeActions) {
          mixerComp.activeActions.forEach(action => {
            action.reset();
            action.play();
          });
        }
      }
    }, 60);
  };

  const stopHopJumpAnimation = () => {
    const hopjumpModel = document.getElementById('hopjump-gltf-model');
    if (!hopjumpModel) return;

    hopjumpModel.removeAttribute('animation-mixer');
    if (hopjumpModel.components && hopjumpModel.components['animation-mixer']) {
      const mixerComp = hopjumpModel.components['animation-mixer'];
      if (mixerComp.mixer) {
        mixerComp.mixer.stopAllAction();
      }
    }
  };

  // Open Dedicated Hop Jump A-Frame Scene (Resets Animation from Frame 0 & Camera View)
  const openHopJumpScene = () => {
    playSound('success');
    if (vrWrapper) vrWrapper.style.display = 'none';
    if (vrHopjumpWrapper) {
      vrHopjumpWrapper.style.display = 'block';
    }

    resetHopJumpAnimation();
    resetCameraView('hopjump-camera');

    const hopjumpScene = document.getElementById('hopjump-scene');
    if (hopjumpScene) {
      if (hopjumpScene.hasLoaded) {
        hopjumpScene.resize();
      } else {
        hopjumpScene.addEventListener('loaded', () => hopjumpScene.resize());
      }
    }
  };

  // Close Hop Jump Scene and Return to Main VR Menu (Resets Camera View)
  const closeHopJumpScene = () => {
    playSound('click');
    stopHopJumpAnimation();
    resetCameraView('main-camera');

    if (vrHopjumpWrapper) vrHopjumpWrapper.style.display = 'none';
    if (vrWrapper) {
      vrWrapper.style.display = 'block';
      const mainScene = document.querySelector('a-scene');
      if (mainScene) mainScene.resize();
    }
  };

  // Setup Event Listeners for 6 VR Menu Cards
  const attachCardListeners = () => {
    const menuCards = document.querySelectorAll('.vr-card-target');
    menuCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        playSound('pop');
        card.setAttribute('animation__scale', 'property: scale; to: 1.12 1.12 1.12; dur: 250; easing: easeOutCubic');
      });

      card.addEventListener('mouseleave', () => {
        card.setAttribute('animation__scale', 'property: scale; to: 1 1 1; dur: 200; easing: easeOutCubic');
      });

      card.addEventListener('click', () => {
        openHopJumpScene();
      });
    });
  };

  attachCardListeners();

  // Navigation Event Listeners
  const vr3dBackShape = document.getElementById('vr-3d-back-shape');
  if (vr3dBackShape) {
    const triggerBackToVRMenu = () => {
      playSound('click');
      closeHopJumpScene();
    };

    // Attach listeners to container and all child mesh elements
    vr3dBackShape.addEventListener('click', triggerBackToVRMenu);
    vr3dBackShape.addEventListener('fused', triggerBackToVRMenu);
    
    const clickables = vr3dBackShape.querySelectorAll('.clickable');
    clickables.forEach(elem => {
      elem.addEventListener('click', triggerBackToVRMenu);
      elem.addEventListener('fused', triggerBackToVRMenu);
    });

    vr3dBackShape.addEventListener('mouseenter', () => {
      playSound('pop');
      vr3dBackShape.setAttribute('animation__scale', 'property: scale; to: 1.25 1.25 1.25; dur: 200; easing: easeOutCubic');
    });

    vr3dBackShape.addEventListener('mouseleave', () => {
      vr3dBackShape.setAttribute('animation__scale', 'property: scale; to: 1 1 1; dur: 200; easing: easeOutCubic');
    });
  }

  // Dynamic Canvas Texture Generator for Pure White 3D Back Icon
  const applyWhiteBackTexture = () => {
    const iconPlane = document.getElementById('vr-3d-back-icon-plane');
    if (!iconPlane) return;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'Image/back.png';
    img.onload = () => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
      const imgData = ctx.getImageData(0, 0, 128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 10) { // Visible pixel
          data[i] = 255;     // R
          data[i + 1] = 255; // G
          data[i + 2] = 255; // B
        }
      }
      ctx.putImageData(imgData, 0, 0);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const updateMat = () => {
        if (iconPlane.components && iconPlane.components.material && iconPlane.components.material.material) {
          iconPlane.components.material.material.map = texture;
          iconPlane.components.material.material.needsUpdate = true;
        } else {
          setTimeout(updateMat, 100);
        }
      };
      updateMat();
    };
  };

  applyWhiteBackTexture();

  if (btnHopjumpBack) btnHopjumpBack.addEventListener('click', closeHopJumpScene);
  if (btnHeroVR) btnHeroVR.addEventListener('click', enterVRScene);
  if (btnVrBack) btnVrBack.addEventListener('click', exitVRScene);

  // Profile Modal Event Listeners
  if (navProfil) navProfil.addEventListener('click', openProfilModal);
  if (btnCloseProfil) btnCloseProfil.addEventListener('click', closeProfilModal);

  if (modalProfil) {
    modalProfil.addEventListener('click', (e) => {
      if (e.target === modalProfil) closeProfilModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalProfil && modalProfil.classList.contains('active')) {
        closeProfilModal();
      } else if (vrHopjumpWrapper && vrHopjumpWrapper.style.display === 'block') {
        closeHopJumpScene();
      } else if (vrWrapper && vrWrapper.classList.contains('active')) {
        exitVRScene();
      }
    }
  });

  console.log('🏁 Dynamic Card Shape Aspect-Ratio Matching Controller Ready!');
});
