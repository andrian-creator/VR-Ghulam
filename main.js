// main.js - A-Frame VR Automatic Animation Engine (No Overlay UI)

document.addEventListener('DOMContentLoaded', () => {
  const modelEl = document.querySelector('#hop-jump-model');
  const loaderOverlay = document.querySelector('#loader-overlay');
  
  let animationMixer = null;
  let clock = new (window.THREE ? window.THREE.Clock : function() { this.getDelta = () => 0.016; })();

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

  // Model Loading Listener - Auto-Play Embedded GLTF Animations
  modelEl.addEventListener('model-loaded', (evt) => {
    console.log('HOP JUMP 3D Model loaded successfully!');
    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
    }

    // Play embedded GLTF skeletal/mesh animation clips automatically
    const mesh = modelEl.getObject3D('mesh');
    if (mesh && evt.detail.model) {
      const animations = evt.detail.model.animations || (mesh.geometry ? mesh.geometry.animations : []);
      if (animations && animations.length > 0) {
        console.log(`Found ${animations.length} embedded animation clip(s). Playing automatically...`);
        animationMixer = new THREE.AnimationMixer(mesh);
        animations.forEach((clip) => {
          const action = animationMixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat);
          action.play();
        });
      }
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

  // Automatic Movement Animation Loop (Continuous Rotation + Floating & Periodic Jump Arc)
  let angle = 0;
  const startY = 0.3;

  function animateScene(timestamp) {
    const delta = clock ? clock.getDelta() : 0.016;

    // 1. Update GLTF Animation Mixer (if embedded clips exist)
    if (animationMixer) {
      animationMixer.update(delta);
    }

    // 2. Automatic Continuous Rotation & Natural Floating/Bounce Motion
    if (modelEl) {
      angle += 0.015;

      // Continuous 360 Spin
      const currentRot = modelEl.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      modelEl.setAttribute('rotation', {
        x: Math.sin(angle * 0.5) * 3,
        y: (currentRot.y + 0.6) % 360,
        z: Math.cos(angle * 0.5) * 3
      });

      // Automatic Floating + Parabolic Periodic HOP Bounce Arc
      const floatY = Math.sin(angle * 2) * 0.15;
      const jumpCycle = Math.pow(Math.abs(Math.sin(angle * 0.6)), 3) * 1.8;
      const totalY = startY + floatY + jumpCycle;

      modelEl.setAttribute('position', `0 ${totalY} -4`);
    }

    requestAnimationFrame(animateScene);
  }

  requestAnimationFrame(animateScene);
});
