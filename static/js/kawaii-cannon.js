// static/js/kawaii-cannon.js


export function initKawaiiCannon() {

    document.querySelectorAll('.kawaii-heart-button, .kawaii-paw-button, .floating-kawaii-cannon').forEach(btn => {

        if (btn.dataset.kawaiiReady) return;
        btn.dataset.kawaiiReady = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 

            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

         
            for (let i = 0; i < 20; i++) {
                const heart = document.createElement('div');
                const symbols = ['♥','♡','❥','✧','★','✿','☾','☆','💖','🌸','💫','🐾','🩷','✨','🌺','💜'];
                heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

                heart.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    font-size: ${24 + Math.random() * 28}px;
                    color: ${['#FF69B4','#FFB6C1','#FF1493','#FF8CCD','#FF69B4'][Math.floor(Math.random()*5)]};
                    pointer-events: none;
                    z-index: 999999;
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    text-shadow: 0 0 20px currentColor;
                    user-select: none;
                    will-change: transform, opacity;
                `;

                document.body.appendChild(heart);

                void heart.offsetHeight;

                const angle = Math.random() * Math.PI * 2;
                const velocity = 280 + Math.random() * 520;
                const duration = 0.9 + Math.random() * 1.0;

                heart.style.transition = `all ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`;
                heart.style.transform = `
                    translate(-50%, -50%)
                    translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px)
                    scale(0) rotate(${1080 + Math.random() * 1080}deg)
                `;
                heart.style.opacity = '0';

                setTimeout(() => heart.remove(), duration * 1000 + 100);
            }
        });
    });
}

