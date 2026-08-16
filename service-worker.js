const CACHE_NAME = "campus-flow-v6";

const STATIC_FILES = [
  "./",
  "./manifest.json"
];

/* Install */
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          STATIC_FILES
        );

      })

  );

});


/* Activate */
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key =>
              key !== CACHE_NAME
            )
            .map(key =>
              caches.delete(key)
            )

        );

      })

      .then(() =>
        self.clients.claim()
      )

  );

});


/* Fetch */
self.addEventListener("fetch", event => {

  const request =
    event.request;

  /*
    Always get index.html from the network.
    This prevents GitHub/Safari from serving
    an old Campus Flow interface.
  */

  if(
    request.method === "GET" &&
    (
      request.mode === "navigate" ||
      request.url.endsWith("/index.html")
    )
  ){

    event.respondWith(

      fetch(request)
        .then(response => {

          return response;

        })
        .catch(() => {

          return caches.match(
            "./index.html"
          );

        })

    );

    return;

  }


  /*
    Everything else uses cache first,
    then network.
  */

  event.respondWith(

    caches.match(request)
      .then(cached => {

        if(cached){

          return cached;

        }

        return fetch(request)
          .then(response => {

            if(
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ){

              return response;

            }

            const copy =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  request,
                  copy
                );

              });

            return response;

          });

      })

  );

});
