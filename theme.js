/**
 * Tim Dixon Design System — theme bootstrap.
 *
 * Drop this file into any project as the FIRST thing in <head>, BEFORE
 * any <link rel="stylesheet"> or <style>. It sets data-theme on <html>
 * synchronously so there is never a flash of the wrong palette.
 *
 *   <script src="theme.js"></script>
 *
 * Persistence key: localStorage["td-theme"] = "light" | "dark".
 * No saved preference -> follows the OS prefers-color-scheme.
 */
(function () {
  var t = localStorage.getItem('td-theme');
  document.documentElement.dataset.theme =
    t === 'dark' || t === 'light' ? t
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}());
