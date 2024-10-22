/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
    //'use strict'

    // Constantes para selectores de elementos
    const THEME_SWITCHER_SELECTOR = '#bd-theme';
    const THEME_SWITCHER_TEXT_SELECTOR = '#bd-theme-text';
    const THEME_ICON_ACTIVE_SELECTOR = '.theme-icon-active use';
    const THEME_TOGGLE_SELECTOR = '[data-bs-theme-value]';

    // Obtiene el tema almacenado en localStorage
    const getStoredTheme = () => localStorage.getItem('theme');

    // Almacena el tema en localStorage
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    // Obtiene el tema preferido del usuario
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Establece el tema en el documento
    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    };

    // Muestra el tema activo en el interruptor de temas
    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector(THEME_SWITCHER_SELECTOR);
        if (!themeSwitcher) {
            return;
        }

        const themeSwitcherText = document.querySelector(THEME_SWITCHER_TEXT_SELECTOR);
        const activeThemeIcon = document.querySelector(THEME_ICON_ACTIVE_SELECTOR);
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);
        const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href');

        document.querySelectorAll(THEME_TOGGLE_SELECTOR).forEach(element => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');
        });

        btnToActive.classList.add('active');
        btnToActive.setAttribute('aria-pressed', 'true');
        activeThemeIcon.setAttribute('href', svgOfActiveBtn);
        const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

        if (focus) {
            themeSwitcher.focus();
        }
    };

    // Establece el tema inicial
    setTheme(getPreferredTheme());

    // Escucha cambios en el esquema de color preferido del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
        }
    });

    // Configura los manejadores de eventos una vez que el DOM esté completamente cargado
    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme());

        document.querySelectorAll(THEME_TOGGLE_SELECTOR).forEach(toggle => {
            toggle.addEventListener('click', () => {
                const theme = toggle.getAttribute('data-bs-theme-value');
                setStoredTheme(theme);
                setTheme(theme);
                showActiveTheme(theme, true);
            });
        });
    });
})();