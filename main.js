// main.js - A-Frame Interactive Controls & HUD Integration

document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const modelEl = document.querySelector('#hop-jump-model');
  const cameraRig = document.querySelector('#camera-rig');
  const loaderOverlay = document.querySelector('#loader-overlay');
  const envEntity = document.querySelector('#env-entity');
  
  // UI Controls
  const rotateInput = document.querySelector('#input-rotate');
  const rotateValText = document.querySelector('#rotate-val');
  const scaleInput = document.querySelector('#input-scale');
  const scaleValText = document.querySelector('#scale-val');
  const jumpBtn = document.querySelector('#btn-jump-action');
  const envSwitchBtn = document.querySelector('#btn-env-switch');
  const envLabelText = document.querySelector('#env-label');
  const soundBtn = document.querySelector('#btn-sound');
  const soundLabelText = document.querySelector('#sound-label');
  const enterVrBtn = document.querySelector('#btn-enter-vr');
  const fullscreenBtn = document.querySelector('#btn-fullscreen');
  const presetBtns = document.querySelectorAll('.btn-preset');

  // State Variables
  let rotationSpeed = 1.0;
  let currentScale = 1.0;
  let isSoundEnabled = true;
  let isJumping = false;
  let audioCtx = null;

  // Environment Presets List
  const envPresets = [
    { name: 'Neon Cyberpunk', preset: 'neon', skyType: 'atmosphere', gridColor: '#00f0ff' },
    { name: 'Sunset Studio', preset: 'sunset', skyType: 'gradient', gridColor: '#ff007b' },
    { name: 'Sci-Fi Hangar', preset: 'checkerboard', skyType: 'color', gridColor: '#7000ff' },
    { name: 'Volcanic Arena', preset: 'volcano', skyType: 'atmosphere', gridColor: '#ff4500' },
    { name: 'Starry Void', preset: 'starry', skyType: 'atmosphere', gridColor: '#00ffaa' }
  ];
  let currentEnvIndex = 0;

  // Synthesize UI Sound Effects using Web Audio API
  function playSound(type) {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'land') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Check if opened via file:// protocol (CORS restriction in Chrome/Safari)
  if (window.location.protocol === 'file:') {
    console.warn('CORS Warning: Running via file:// protocol. Browsers block GLTF/GLB 3D loading.');
    const loaderText = document.querySelector('.loader-text');
    const loaderSubtext = document.querySelector('.loader-subtext');
    if (loaderText && loaderSubtext) {
      loaderText.innerHTML = '<span style="color:#ff4500;">Peringatan CORS Browser!</span>';
      loaderSubtext.innerHTML = 'File dibuka langsung (file://). Browser memblokir pemuatan file 3D (.glb).<br><br><b>Solusi:</b> Jalankan <code>python3 -m http.server 8080</code> di terminal lalu buka <b>http://localhost:8080</b>';
    }
  }

  // Model Loading Complete Listener
  modelEl.addEventListener('model-loaded', () => {
    console.log('HOP JUMP 3D Model loaded successfully!');
    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
    }
  });

  // Model Loading Error Listener
  modelEl.addEventListener('model-error', (e) => {
    console.error('Model load error:', e);
    const loaderText = document.querySelector('.loader-text');
    const loaderSubtext = document.querySelector('.loader-subtext');
    if (loaderText && loaderSubtext) {
      loaderText.innerHTML = '<span style="color:#ff007b;">Gagal Memuat Model 3D</span>';
      loaderSubtext.innerHTML = 'Silakan buka melalui server HTTP lokal (http://localhost:8080).';
    }
  });

  // Fallback timer to hide loader overlay if loaded or after 4s over HTTP
  setTimeout(() => {
    if (loaderOverlay && !loaderOverlay.classList.contains('hidden') && window.location.protocol !== 'file:') {
      loaderOverlay.classList.add('hidden');
    }
  }, 4000);

  // Auto Rotation Loop
  function animateRotation() {
    if (modelEl && rotationSpeed > 0 && !isJumping) {
      const currentRot = modelEl.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      modelEl.setAttribute('rotation', {
        x: currentRot.x,
        y: (currentRot.y + rotationSpeed * 0.5) % 360,
        z: currentRot.z
      });
    }
    requestAnimationFrame(animateRotation);
  }
  animateRotation();

  // Rotation Control
  rotateInput.addEventListener('input', (e) => {
    rotationSpeed = parseFloat(e.target.value);
    rotateValText.textContent = rotationSpeed.toFixed(1) + 'x';
  });

  // Scale Control
  scaleInput.addEventListener('input', (e) => {
    currentScale = parseFloat(e.target.value);
    scaleValText.textContent = currentScale.toFixed(1) + 'x';
    modelEl.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
  });

  // HOP Jump FX Trigger
  jumpBtn.addEventListener('click', () => {
    if (isJumping) return;
    isJumping = true;
    playSound('jump');

    // Smooth bounce up & down using JS animation frame
    const startY = 0.3;
    const peakY = 2.5;
    const duration = 700; // ms
    const startTime = performance.now();

    function stepJump(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Parabolic jump arc
      const height = Math.sin(progress * Math.PI) * (peakY - startY);
      const currentY = startY + height;

      // Squish scale dynamic effect
      const squishY = 1.0 + Math.sin(progress * Math.PI) * 0.25;
      const squishXZ = 1.0 - Math.sin(progress * Math.PI) * 0.12;

      modelEl.setAttribute('position', `0 ${currentY} -4`);
      modelEl.setAttribute('scale', `${currentScale * squishXZ} ${currentScale * squishY} ${currentScale * squishXZ}`);

      if (progress < 1.0) {
        requestAnimationFrame(stepJump);
      } else {
        // Reset scale & position
        modelEl.setAttribute('position', `0 ${startY} -4`);
        modelEl.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
        playSound('land');
        isJumping = false;
      }
    }

    requestAnimationFrame(stepJump);
  });

  // Camera Presets Switching
  const cameraPresets = {
    overview: { pos: '0 1.8 0.5', rot: '0 0 0' },
    closeup: { pos: '0 1.1 -2.0', rot: '-5 0 0' },
    topdown: { pos: '0 5.5 -4.0', rot: '-85 0 0' },
    side: { pos: '-3.2 1.5 -4.0', rot: '0 -75 0' }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.dataset.cam;
      const preset = cameraPresets[presetKey];
      if (preset && cameraRig) {
        cameraRig.setAttribute('animation__pos', {
          property: 'position',
          to: preset.pos,
          dur: 800,
          easing: 'easeInOutCubic'
        });
        cameraRig.setAttribute('animation__rot', {
          property: 'rotation',
          to: preset.rot,
          dur: 800,
          easing: 'easeInOutCubic'
        });
      }
    });
  });

  // Environment Switcher
  envSwitchBtn.addEventListener('click', () => {
    playSound('click');
    currentEnvIndex = (currentEnvIndex + 1) % envPresets.length;
    const current = envPresets[currentEnvIndex];
    
    if (envEntity) {
      envEntity.setAttribute('environment', {
        preset: current.preset,
        skyType: current.skyType,
        gridColor: current.gridColor
      });
    }
    envLabelText.textContent = `Preset: ${current.name}`;
  });

  // Sound Toggle
  soundBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundLabelText.textContent = isSoundEnabled ? 'Audio ON' : 'Audio OFF';
    soundBtn.style.opacity = isSoundEnabled ? '1' : '0.5';
  });

  // Enter WebXR VR Mode
  enterVrBtn.addEventListener('click', () => {
    playSound('click');
    if (sceneEl.enterVR) {
      sceneEl.enterVR();
    } else {
      alert('Browser tidak mendukung WebXR VR secara langsung.');
    }
  });

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', () => {
    playSound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
});
