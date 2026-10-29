// js/animation.js
// Falling Organic Ash Animation to Plant Container
export function initAshAnimation() {
  const container = document.getElementById('plantAnimBox');
  if (!container) return;

  setInterval(() => {
    const particle = document.createElement('div');
    particle.className = 'ash-particle';
    particle.style.left = Math.random() * 80 + 10 + '%';
    particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 3000);
  }, 400);
}
