/* ============================================
   Agent Playground Mobile — CJX Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------
     Login: Clipboard paste detection
     ------------------------------------------ */
  const tokenInput = document.querySelector('.token-input');
  if (tokenInput) {
    tokenInput.addEventListener('focus', function () {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function (text) {
          if (text && text.length === 64) {
            const pasteHint = document.querySelector('.paste-hint');
            if (pasteHint) pasteHint.style.display = 'block';
          }
        }).catch(function () {
          /* clipboard read not available — ignore */
        });
      }
    });
  }

  /* ------------------------------------------
     Login: Toggle token visibility
     ------------------------------------------ */
  const revealToggle = document.querySelector('.reveal-toggle');
  if (revealToggle && tokenInput) {
    revealToggle.addEventListener('click', function () {
      const isPassword = tokenInput.type === 'password';
      tokenInput.type = isPassword ? 'text' : 'password';
      revealToggle.textContent = isPassword ? 'Hide' : 'Show';
    });
  }

  /* ------------------------------------------
     Login: Shake animation on error
     ------------------------------------------ */
  const loginForm = document.querySelector('.login-form');
  const errorText = document.querySelector('.error-text');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (tokenInput && tokenInput.value.length !== 64) {
        tokenInput.parentElement.style.animation = 'shake 0.5s ease-in-out';
        if (errorText) {
          errorText.style.display = 'block';
          errorText.textContent = 'Invalid token. Please enter a valid 64-character token.';
        }
        setTimeout(function () {
          tokenInput.parentElement.style.animation = '';
        }, 500);
      }
    });
  }

  /* ------------------------------------------
     Chat: Auto-grow textarea
     ------------------------------------------ */
  const chatInput = document.querySelector('.input-field');
  const sendBtn = document.querySelector('.send-btn');
  if (chatInput) {
    chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 96) + 'px';

      if (sendBtn) {
        if (this.value.trim().length > 0) {
          sendBtn.classList.add('send-active');
          sendBtn.classList.remove('send-disabled');
        } else {
          sendBtn.classList.remove('send-active');
          sendBtn.classList.add('send-disabled');
        }
      }
    });
  }

  /* ------------------------------------------
     Mention autocomplete: show/hide on @ input
     ------------------------------------------ */
  const mentionDropdown = document.querySelector('.mention-dropdown');
  if (chatInput && mentionDropdown) {
    chatInput.addEventListener('input', function () {
      const value = this.value;
      const atIndex = value.lastIndexOf('@');
      if (atIndex !== -1 && atIndex === value.length - 1) {
        mentionDropdown.style.display = 'block';
      } else if (atIndex !== -1) {
        const query = value.slice(atIndex + 1).toLowerCase();
        const items = mentionDropdown.querySelectorAll('.mention-item');
        let visibleCount = 0;
        items.forEach(function (item) {
          const name = item.querySelector('.mention-name').textContent.toLowerCase();
          if (name.includes(query)) {
            item.style.display = 'flex';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });
        mentionDropdown.style.display = visibleCount > 0 ? 'block' : 'none';
      } else {
        mentionDropdown.style.display = 'none';
      }
    });

    const mentionItems = mentionDropdown.querySelectorAll('.mention-item');
    mentionItems.forEach(function (item) {
      item.addEventListener('click', function () {
        const name = this.querySelector('.mention-name').textContent;
        const value = chatInput.value;
        const atIndex = value.lastIndexOf('@');
        chatInput.value = value.slice(0, atIndex) + '@' + name + ' ';
        mentionDropdown.style.display = 'none';
        chatInput.focus();
      });
    });
  }

  /* ------------------------------------------
     Filter chips: toggle active state
     ------------------------------------------ */
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const group = this.parentElement;
      group.querySelectorAll('.filter-chip').forEach(function (sibling) {
        sibling.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  /* ------------------------------------------
     Tab bar: active state
     ------------------------------------------ */
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabItems.forEach(function (sibling) {
        sibling.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  /* ------------------------------------------
     Conversation items: tap navigation hint
     ------------------------------------------ */
  const conversationItems = document.querySelectorAll('.conversation-item');
  conversationItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const link = this.getAttribute('data-href');
      if (link) window.location.href = link;
    });
  });

  /* ------------------------------------------
     Image viewer: toggle header visibility
     ------------------------------------------ */
  const imageViewerContent = document.querySelector('.image-viewer-content');
  const imageViewerHeader = document.querySelector('.image-viewer-header');
  if (imageViewerContent && imageViewerHeader) {
    let headerVisible = true;
    imageViewerContent.addEventListener('click', function () {
      headerVisible = !headerVisible;
      imageViewerHeader.style.opacity = headerVisible ? '1' : '0';
      imageViewerHeader.style.transition = 'opacity 0.3s ease';
    });
  }
});
