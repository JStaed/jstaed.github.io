const DARK_MODE_BUTTON = document.getElementById('toggleDark');
const ICON = DARK_MODE_BUTTON.querySelector('i');

const isDarkStored = localStorage.getItem('darkMode');
if (isDarkStored === 'true') {
    SetDarkMode(true);
} else if (isDarkStored === 'false') {
    SetDarkMode(false);
} else {
    // No stored preference → use system setting
    SetDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
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