const SOUND_FILES = {
  suspense: "/sounds/suspense.mp3",
  win: "/sounds/win.mp3",
  miss: "/sounds/miss.mp3",
  // Reuses the suspense clip but as its own <audio> element so it doesn't
  // fight the real suspense sound for playback position.
  click: "/sounds/suspense.mp3",
};

const cache = {};

function getAudio(name) {
  if (!cache[name]) {
    const audio = new Audio(SOUND_FILES[name]);
    audio.preload = "auto";
    cache[name] = audio;
  }
  return cache[name];
}

function stopAll() {
  Object.values(cache).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function play(name, { volume = 1 } = {}) {
  const audio = getAudio(name);
  // Only one sfx should ever be audible at a time — switching cards
  // (or picking a new one while suspense is still ringing) should cut it off.
  stopAll();
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function playSuspenseSfx() {
  play("suspense", { volume: 0.6 });
}

export function playWinSfx() {
  play("win", { volume: 0.7 });
}

export function playMissSfx() {
  play("miss", { volume: 0.6 });
}

export function playClickSfx() {
  play("click", { volume: 0.12 });
}
