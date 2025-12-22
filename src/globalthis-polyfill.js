// src/globalthis-polyfill.js
(function() {
    if (typeof globalThis === 'undefined') {
      if (typeof self !== 'undefined') {
        self.globalThis = self;
      } else if (typeof window !== 'undefined') {
        window.globalThis = window;
      } else {
        // fallback universal
        Object.defineProperty(Object.prototype, 'globalThis', {
          get: function() {
            return this;
          },
          configurable: true
        });
      }
    }
  })();
  