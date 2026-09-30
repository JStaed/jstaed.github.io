const DARK_MODE_BUTTON = document.getElementById('toggleDark');
const ICON = DARK_MODE_BUTTON.querySelector('i');
const isDarkStored = localStorage.getItem('darkMode');

if (isDarkStored === 'true') {
    SetDarkMode(true);
} else if (isDarkStored === 'false') {
    SetDarkMode(false);
} else {
    SetDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function CompleteLoad() {
    setTimeout(function() {
        document.body.classList.add('loaded');
    }, 500);
}

function SetDarkMode(isDark) {
    if (isDark) {
        localStorage.setItem('darkMode', 'true');
        document.body.classList.add('dark');
        ICON.classList.remove('fa-sun');
        ICON.classList.add('fa-moon');
    } else {
        localStorage.setItem('darkMode', 'false');
        document.body.classList.remove('dark');
        ICON.classList.remove('fa-moon');
        ICON.classList.add('fa-sun');
    }
}

DARK_MODE_BUTTON.addEventListener('click', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        SetDarkMode(false);
    } else {
        SetDarkMode(true);
    }
});

const MOBILE_LAYOUT = window.matchMedia('(max-width: 760px)');

document.querySelectorAll('[data-project-tabs]').forEach(tabList => {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

    function UpdateProjectPanels() {
        tabs.forEach(tab => {
            const panel = document.getElementById(tab.getAttribute('aria-controls'));
            panel.hidden = MOBILE_LAYOUT.matches && tab.getAttribute('aria-selected') !== 'true';
        });
    }

    function SelectProjectTab(selectedTab, moveFocus = false) {
        tabs.forEach(tab => {
            const isSelected = tab === selectedTab;
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;
        });
        UpdateProjectPanels();
        if (moveFocus) selectedTab.focus();
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => SelectProjectTab(tab));
        tab.addEventListener('keydown', event => {
            let nextIndex;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabs.length - 1;
            if (nextIndex !== undefined) {
                event.preventDefault();
                SelectProjectTab(tabs[nextIndex], true);
            }
        });
    });

    window.addEventListener('resize', UpdateProjectPanels);
    UpdateProjectPanels();
});

document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
    const stage = gallery.querySelector('[data-gallery-stage]');
    const previousButton = gallery.querySelector('[data-gallery-previous]');
    const nextButton = gallery.querySelector('[data-gallery-next]');
    const counter = gallery.querySelector('[data-gallery-count]');

    if (!slides.length || !stage || !previousButton || !nextButton || !counter) return;

    let currentIndex = 0;

    slides.forEach(slide => {
        const image = slide.querySelector('img');
        if (image) image.draggable = false;
    });

    function ShowSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.hidden = slideIndex !== currentIndex;
            slide.setAttribute('aria-label', `${slideIndex + 1} of ${slides.length}`);
        });
        counter.textContent = `${currentIndex + 1} of ${slides.length}`;
    }

    previousButton.disabled = slides.length < 2;
    nextButton.disabled = slides.length < 2;
    previousButton.addEventListener('click', () => ShowSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => ShowSlide(currentIndex + 1));

    stage.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            ShowSlide(currentIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            ShowSlide(currentIndex + 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            ShowSlide(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            ShowSlide(slides.length - 1);
        }
    });

    let pointerStart = null;
    stage.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStart = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', event => {
        if (!pointerStart) return;
        const deltaX = event.clientX - pointerStart.x;
        const deltaY = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
        ShowSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => {
        pointerStart = null;
    });

    gallery.setAttribute('data-enhanced', 'true');
    const requestedStartIndex = gallery.dataset.startAt;
    const startIndex = requestedStartIndex === 'last'
        ? slides.length - 1
        : Number.parseInt(requestedStartIndex ?? '0', 10);
    ShowSlide(Number.isInteger(startIndex) ? Math.min(Math.max(startIndex, 0), slides.length - 1) : 0);
});

CompleteLoad();