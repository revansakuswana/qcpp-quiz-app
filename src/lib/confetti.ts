import confetti from 'canvas-confetti';

export function fireConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#e21b3c', '#1368ce'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#d89e00', '#26890c'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ffffff', '#864cbf'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#e21b3c', '#d89e00', '#26890c'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#1368ce', '#864cbf'],
    });
  } catch (err) {
    console.warn('Confetti effect unavailable:', err);
  }
}
