// Aplica el tema antes del primer paint (evita el destello claro/oscuro). Va como archivo externo
// porque la CSP (script-src 'self') bloquea scripts inline. Misma lógica que src/context/darkmodecontext.tsx.
(function () {
  var isDark;
  try {
    var saved = localStorage.getItem('darkMode');
    if (saved !== null) isDark = Boolean(JSON.parse(saved));
  } catch {
    // almacenamiento no disponible o valor corrupto: se usa la preferencia del sistema
  }
  if (isDark === undefined) {
    try {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      isDark = false;
    }
  }
  var root = document.documentElement;
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#08110D' : '#E3EAE5');
})();
