// cart-icon.js - Chỉ quan sát #cart-count (do updateCartBadge() của main.js).
// Không đụng vào getCart/saveCart/localStorage.
(function () {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  let last = 0;
  function sync() {
    const n = parseInt(badge.textContent, 10) || 0;
    badge.hidden = n <= 0;               // giỏ trống thì ẩn huy hiệu
    if (n !== last) {                    // đổi số lượng thì nảy một cái
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
      last = n;
    }
  }

  new MutationObserver(sync).observe(badge, {
    childList: true, characterData: true, subtree: true
  });
  sync();
})();