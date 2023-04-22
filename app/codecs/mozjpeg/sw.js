if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function(registration) {
          console.log('Service Worker 注册成功:', registration);
        },
        function(err) {
          console.log('Service Worker 注册失败:', err);
        }
      );
    });
  }