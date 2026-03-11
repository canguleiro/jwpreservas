const CACHE_NAME = 'gestao-casas-v1';

// Ficheiros estáticos mínimos para cache (opcional, pode deixar vazio se preferir sempre rede)
const urlsToCache = [
  './index.html',
  './manifest.json'
  // Adicione aqui os nomes dos seus ficheiros de ícones quando os tiver:
  // './icone-192.png',
  // './icone-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  // Força a atualização imediata do Service Worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação e limpeza de caches antigas
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceção de pedidos (Network First, Fallback to Cache)
// Especialmente importante para a API do Google Sheets não ser bloqueada pelo cache
self.addEventListener('fetch', (event) => {
  // Se for um pedido para a API do Google Scripts (onde estão os dados dinâmicos)
  // DEVE ir sempre à rede para obter os dados mais recentes.
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para outros ficheiros (HTML, imagens), tenta a rede primeiro, depois cai para a cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
