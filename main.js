// main.js - A-Frame VR Automatic Animation Engine (No Overlay UI)

// Register custom A-Frame component for guaranteed 100% native GLTF auto-animation playback
AFRAME.registerComponent('auto-play-gltf', {
  init: function () {
    this.el.addEventListener('model-loaded', (e) => {
      const model = e.detail.model;
      if (model && model.animations && model.animations.length > 0) {
        console.log('3D GLB Model Loaded. Auto-playing animation clips:', model.animations);
        this.mixer = new THREE.AnimationMixer(model);
        model.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat);
          action.clampWhenFinished = false;
          action.enabled = true;
          action.play();
        });
      }
    });
  },
  tick: function (t, dt) {
    if (this.mixer) {
      this.mixer.update(dt / 1000);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const modelEl = document.querySelector('#hop-jump-model');
  const loaderOverlay = document.querySelector('#loader-overlay');

  // Protocol Check (CORS Warning for file://)
  if (window.location.protocol === 'file:') {
    console.warn('CORS Warning: Running via file:// protocol. Browsers block GLTF/GLB 3D loading.');
    const loaderText = document.querySelector('.loader-text');
    const loaderSubtext = document.querySelector('.loader-subtext');
    if (loaderText && loaderSubtext) {
      loaderText.innerHTML = '<span style="color:#ff4500;">Peringatan CORS Browser!</span>';
      loaderSubtext.innerHTML = 'File dibuka langsung (file://). Browser memblokir pemuatan file 3D (.glb).<br><br><b>Solusi:</b> Jalankan <code>start_offline.command</code> atau <code>python3 -m http.server 8080</code> lalu buka <b>http://localhost:8080</b>';
    }
  }

  // Model Loading Listener - Hide Loader Overlay
  modelEl.addEventListener('model-loaded', () => {
    console.log('HOP JUMP 3D Model loaded successfully!');
    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
    }
  });

  // Model Load Error Listener
  modelEl.addEventListener('model-error', (e) => {
    console.error('Model load error:', e);
    const loaderText = document.querySelector('.loader-text');
    const loaderSubtext = document.querySelector('.loader-subtext');
    if (loaderText && loaderSubtext) {
      loaderText.innerHTML = '<span style="color:#ff007b;">Gagal Memuat Model 3D</span>';
      loaderSubtext.innerHTML = 'Silakan buka melalui server HTTP lokal (http://localhost:8080).';
    }
  });

  // Fallback timer to hide loader overlay
  setTimeout(() => {
    if (loaderOverlay && !loaderOverlay.classList.contains('hidden') && window.location.protocol !== 'file:') {
      loaderOverlay.classList.add('hidden');
    }
  }, 3500);
});
