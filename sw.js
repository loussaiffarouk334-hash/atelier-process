/*
  Service worker — Atelier Process (PWA)

  Stratégie : "stale-while-revalidate" pour les fichiers de l'app (HTML/CSS/JS/
  icônes) uniquement. Tout le reste (Supabase, polices Google, CDN Tailwind)
  passe directement au réseau, sans jamais être mis en cache, pour ne jamais
  servir de données de production périmées.

  ⚠️ Pensez à incrémenter CACHE_NAME à chaque déploiement important si vous
  voulez forcer les appareils à re-télécharger les fichiers immédiatement
  (sinon la mise à jour arrive automatiquement en tâche de fond au bout de
  quelques rechargements, ce qui est suffisant dans la plupart des cas).
*/
const CACHE_NAME = "atelier-process-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/db.js",
  "./js/i18n.js",
  "./js/charts.js",
  "./js/views.js",
  "./js/views_process.js",
  "./js/views_quality.js",
  "./js/modals.js",
  "./js/app.js",
  "./landing/door-3d.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // On ne touche qu'aux fichiers de notre propre site. Supabase, les
  // polices Google et le CDN Tailwind restent toujours en direct.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
