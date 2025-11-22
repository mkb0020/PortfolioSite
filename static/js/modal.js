// modal.js – drop this file once and use forever

// TO USE
// <script type="module">
//    import { openModal } from "{{ url_for('static', filename='js/modal.js') }}";
//</script>
// EXAMPLES:
//              <button class="btn-holographic-glass" data-modal="manifold">Manifold Info</button>
//                <button class="btn-holographic-glass" data-modal="fractal">Fractals</button>
//                <button class="btn-holographic-glass" data-modal="highlights">Highlights</button>
//                <button class="btn-holographic-glass" data-modal="skills">Skills</button>
//


// static/js/modal.js
import { MODAL_CONTENTS } from './modal-content.js';

let currentModal = null;

export function openModal(key, overrides = {}) {
    closeModal(); 

    const data = { ...MODAL_CONTENTS[key], ...overrides };
    if (!data) {
        console.error(`Modal "${key}" not found!`);
        return;
    }

    const modalHTML = `
    <div class="mk-modal" id="currentModal">
        <div class="mk-modal-content">
            <button class="mk-modal-close" aria-label="Close">X</button>
            <div class="mk-modal-header">
                <h2 class="mk-modal-title">${data.title}</h2>
            </div>
            <div class="mk-modal-body">${data.content}</div>
            <div class="mk-modal-footer">
                <button class="btn-modal-pulse btn-close">Close</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    currentModal = document.getElementById('currentModal');
    currentModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    currentModal.querySelectorAll('.mk-modal-close, .btn-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

    currentModal.addEventListener('click', (e) => { // CLOSE ON BG CLICK
        if (e.target === currentModal) closeModal();
    });

    document.addEventListener('keydown', handleEsc); // ESC KEY
}

export function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEsc);
    }
}

function handleEsc(e) {
    if (e.key === 'Escape') closeModal();
}