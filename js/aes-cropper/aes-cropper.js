/*!
 * AESCropper v1.0.0
 * Универсальная библиотека обрезки изображений
 * © AES Foundation - https://www.aes-wardarkness.ru
 *
 * Лицензия: Apache License 2.0
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.AESCropper = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION = '1.0.0';
  const STYLE_ID = 'aes-cropper-styles-v1';

  /* ------------------------------------------------------------------ */
  /*  Стили                                                             */
  /* ------------------------------------------------------------------ */
  const CSS = `
.aes-cropper-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;
  background:rgba(8,10,14,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  padding:20px;box-sizing:border-box;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  animation:aes-cropper-fade .18s ease}
@keyframes aes-cropper-fade{from{opacity:0}to{opacity:1}}
.aes-cropper-modal{background:#15181f;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,.6);
  width:min(920px,100%);height:min(720px,100%);display:flex;flex-direction:column;overflow:hidden;
  color:#e8ecf2;border:1px solid rgba(255,255,255,.08);box-sizing:border-box}
.aes-cropper-header{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
.aes-cropper-title{font-size:15px;font-weight:600;letter-spacing:.2px}
.aes-cropper-tools{display:flex;gap:8px;align-items:center}
.aes-cropper-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:inherit;
  padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer;transition:background .15s;
  font-family:inherit;line-height:1;white-space:nowrap}
.aes-cropper-btn:hover{background:rgba(255,255,255,.12)}
.aes-cropper-btn.is-active{background:#2b8cff;border-color:#2b8cff;color:#fff}
.aes-cropper-body{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;
  padding:16px;background:#0b0d12}
.aes-cropper-stage{position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;
  user-select:none;-webkit-user-select:none;cursor:grab;border-radius:8px;background:#0b0d12}
.aes-cropper-stage:active{cursor:grabbing}
.aes-cropper-image{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform;
  pointer-events:none;user-select:none;-webkit-user-drag:none}
.aes-cropper-box{position:absolute;top:0;left:0;box-shadow:0 0 0 9999px rgba(0,0,0,.62);
  outline:1px solid rgba(255,255,255,.95);cursor:move;will-change:transform;box-sizing:border-box}
.aes-cropper-grid{position:absolute;inset:0;pointer-events:none;transition:opacity .15s;opacity:1}
.aes-cropper-grid.is-hidden{opacity:0}
.aes-cropper-grid span{position:absolute;background:rgba(255,255,255,.42);box-shadow:0 0 1px rgba(0,0,0,.5)}
.aes-cropper-grid span:nth-child(1){left:33.333%;top:0;width:1px;height:100%}
.aes-cropper-grid span:nth-child(2){left:66.666%;top:0;width:1px;height:100%}
.aes-cropper-grid span:nth-child(3){top:33.333%;left:0;height:1px;width:100%}
.aes-cropper-grid span:nth-child(4){top:66.666%;left:0;height:1px;width:100%}
.aes-cropper-handle{position:absolute;background:#fff;border:2px solid #2b8cff;box-sizing:border-box;z-index:2;
  transition:transform .1s}
.aes-cropper-handle:hover{transform:scale(1.15)}
.aes-cropper-handle[data-handle="nw"],.aes-cropper-handle[data-handle="ne"],
.aes-cropper-handle[data-handle="sw"],.aes-cropper-handle[data-handle="se"]{width:14px;height:14px;border-radius:50%}
.aes-cropper-handle[data-handle="nw"]{top:-7px;left:-7px;cursor:nwse-resize}
.aes-cropper-handle[data-handle="ne"]{top:-7px;right:-7px;cursor:nesw-resize}
.aes-cropper-handle[data-handle="sw"]{bottom:-7px;left:-7px;cursor:nesw-resize}
.aes-cropper-handle[data-handle="se"]{bottom:-7px;right:-7px;cursor:nwse-resize}
.aes-cropper-handle[data-handle="n"],.aes-cropper-handle[data-handle="s"]{width:28px;height:10px;border-radius:5px;
  left:50%;margin-left:-14px}
.aes-cropper-handle[data-handle="n"]{top:-5px;cursor:ns-resize}
.aes-cropper-handle[data-handle="s"]{bottom:-5px;cursor:ns-resize}
.aes-cropper-handle[data-handle="e"],.aes-cropper-handle[data-handle="w"]{width:10px;height:28px;border-radius:5px;
  top:50%;margin-top:-14px}
.aes-cropper-handle[data-handle="e"]{right:-5px;cursor:ew-resize}
.aes-cropper-handle[data-handle="w"]{left:-5px;cursor:ew-resize}
.aes-cropper-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);flex-shrink:0;background:#15181f}
.aes-cropper-zoom{display:flex;align-items:center;gap:10px;flex:1;max-width:280px;font-size:12px;color:#9aa4b2}
.aes-cropper-zoom input[type="range"]{flex:1;accent-color:#2b8cff;cursor:pointer;min-width:0}
.aes-cropper-actions{display:flex;gap:8px}
.aes-cropper-btn--primary{background:#2b8cff;border-color:#2b8cff;color:#fff;font-weight:500}
.aes-cropper-btn--primary:hover{background:#1c7bf0}
.aes-cropper-btn--ghost{background:transparent}
@media (max-width:640px){
  .aes-cropper-overlay{padding:0}
  .aes-cropper-modal{width:100%;height:100%;border-radius:0;border:none}
  .aes-cropper-zoom{max-width:160px}
}
`;

  /* ------------------------------------------------------------------ */
  /*  Утилиты                                                           */
  /* ------------------------------------------------------------------ */
  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('AESCropper: не удалось загрузить изображение - ' + src));
      img.src = src;
    });
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function toBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      if (canvas.toBlob) {
        canvas.toBlob((b) => resolve(b), type, quality);
      } else {
        try {
          const dataURL = canvas.toDataURL(type, quality);
          const bin = atob(dataURL.split(',')[1]);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          resolve(new Blob([arr], { type }));
        } catch (e) { resolve(null); }
      }
    });
  }

  function isBlobLike(v) {
    if (!v) return false;
    if (typeof File !== 'undefined' && v instanceof File) return true;
    if (typeof Blob !== 'undefined' && v instanceof Blob) return true;
    return false;
  }

  /* ------------------------------------------------------------------ */
  /*  Настройки по умолчанию                                            */
  /* ------------------------------------------------------------------ */
  const DEFAULTS = {
    aspectRatio: null,        // число, напр. 16/9, или null
    targetWidth: null,        // ширина результата в px
    targetHeight: null,       // высота результата в px
    preview: null,            // селектор / DOM-элемент для превью
    container: null,          // куда монтировать модалку (по умолчанию body)
    modal: true,              // true - открывать окно, false - только autoCrop
    grid: true,               // показывать сетку 3×3
    mimeType: 'image/jpeg',   // image/jpeg | image/png | image/webp
    quality: 0.92,            // 0..1 для jpeg/webp
    minCropSize: 40,          // минимальный размер рамки, px
    maxZoom: 8,               // максимальный зум
    title: 'Обрезка изображения',
    applyText: 'Применить',
    cancelText: 'Отмена',
    resetText: 'Сбросить',
    gridText: 'Сетка',
    autoCloseOnApply: true,
    onComplete: null,         // (result) => {}
    onCancel: null,           // () => {}
    onChange: null,           // ({crop, image}) => {}
    onReady: null,            // (instance) => {}
  };

  /* ================================================================== */
  /*  Класс AESCropper                                                  */
  /* ================================================================== */
  class AESCropper {
    constructor(options) {
      this.options = Object.assign({}, DEFAULTS, options || {});

      // Вычисляем соотношение
      this.aspect = null;
      if (this.options.aspectRatio) {
        this.aspect = this.options.aspectRatio;
      } else if (this.options.targetWidth && this.options.targetHeight) {
        this.aspect = this.options.targetWidth / this.options.targetHeight;
      }

      // Состояние
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      this.imgScale = 1;
      this.imgX = 0;
      this.imgY = 0;
      this.cropX = 0;
      this.cropY = 0;
      this.cropW = 0;
      this.cropH = 0;
      this._drag = null;
      this._objectURL = null;
      this._gridOn = !!this.options.grid;
      this._escHandler = null;

      if (typeof document !== 'undefined') injectStyles();
    }

    /* ==================== ПУБЛИЧНЫЙ API ==================== */

    /**
     * Открывает модальное окно редактирования с файлом.
     * @param {File|Blob|string} file
     * @returns {Promise<AESCropper>}
     */
    async open(file) {
      if (typeof document === 'undefined') throw new Error('AESCropper: open() недоступен вне браузера');
      if (!this.overlayEl) this._buildModal();

      const useObjectURL = isBlobLike(file);
      const src = useObjectURL ? URL.createObjectURL(file) : String(file);
      this._objectURL = useObjectURL ? src : null;

      await this._setSource(src);

      this.overlayEl.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Ждём, пока модалка получит размеры
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      this._layout();

      if (typeof this.options.onReady === 'function') this.options.onReady(this);
      return this;
    }

    /**
     * «Тихая» обрезка без модального окна.
     * Если изображение больше заданных размеров - обрезает по центру.
     * Если меньше - возвращает как есть (без апскейла).
     * @param {File|Blob|string} file
     * @returns {Promise<{blob:Blob,dataURL:string,width:number,height:number,canvas:HTMLCanvasElement,type:string}>}
     */
    async autoCrop(file) {
      const useObjectURL = isBlobLike(file);
      const src = useObjectURL ? URL.createObjectURL(file) : String(file);

      try {
        const img = await loadImage(src);
        const result = await this._autoCropImage(img);
        this._renderPreview(result);
        if (typeof this.options.onComplete === 'function') this.options.onComplete(result);
        return result;
      } finally {
        if (useObjectURL) URL.revokeObjectURL(src);
      }
    }

    /** Закрывает модалку. */
    close() {
      if (!this.overlayEl) return;
      this.overlayEl.style.display = 'none';
      if (typeof document !== 'undefined') document.body.style.overflow = '';
      if (this._objectURL) {
        URL.revokeObjectURL(this._objectURL);
        this._objectURL = null;
      }
      this._drag = null;
    }

    /** Полностью удаляет модалку и слушатели. */
    destroy() {
      this.close();
      if (this._escHandler && typeof document !== 'undefined') {
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
      if (this.overlayEl && this.overlayEl.parentNode) {
        this.overlayEl.parentNode.removeChild(this.overlayEl);
      }
      this.overlayEl = null;
      this.modalEl = null;
      this.stageEl = null;
      this.imageEl = null;
      this.boxEl = null;
    }

    /** Установить соотношение сторон (например 16/9) или null. */
    setAspectRatio(ratio) {
      this.options.aspectRatio = ratio || null;
      this.aspect = ratio || null;
      if (this._isOpen()) this._layout();
      return this;
    }

    /** Установить целевой размер в пикселях. */
    setTargetSize(w, h) {
      this.options.targetWidth = w || null;
      this.options.targetHeight = h || null;
      if (!this.options.aspectRatio && w && h) this.aspect = w / h;
      if (this._isOpen()) this._layout();
      return this;
    }

    /** Включить/выключить сетку 3×3. */
    setGrid(on) {
      this._gridOn = !!on;
      this.options.grid = this._gridOn;
      if (this.gridEl) this.gridEl.classList.toggle('is-hidden', !this._gridOn);
      if (this.gridBtn) this.gridBtn.classList.toggle('is-active', this._gridOn);
      return this;
    }

    /** Возвращает результат текущей обрезки (без закрытия модалки). */
    async export() { return this._export(); }

    /* ==================== ВНУТРЕННЕЕ ==================== */

    _isOpen() {
      return this.overlayEl && this.overlayEl.style.display !== 'none';
    }

    _emitChange() {
      if (typeof this.options.onChange === 'function') {
        this.options.onChange({
          crop: { x: this.cropX, y: this.cropY, width: this.cropW, height: this.cropH },
          image: { x: this.imgX, y: this.imgY, scale: this.imgScale },
        });
      }
    }

    /* ---------- Построение модалки ---------- */
    _buildModal() {
      const o = this.options;

      const overlay = document.createElement('div');
      overlay.className = 'aes-cropper-overlay';
      overlay.style.display = 'none';

      const modal = document.createElement('div');
      modal.className = 'aes-cropper-modal';

      /* --- header --- */
      const header = document.createElement('div');
      header.className = 'aes-cropper-header';

      const title = document.createElement('div');
      title.className = 'aes-cropper-title';
      title.textContent = o.title;

      const tools = document.createElement('div');
      tools.className = 'aes-cropper-tools';

      const gridBtn = document.createElement('button');
      gridBtn.type = 'button';
      gridBtn.className = 'aes-cropper-btn' + (this._gridOn ? ' is-active' : '');
      gridBtn.textContent = o.gridText;
      gridBtn.addEventListener('click', () => this.setGrid(!this._gridOn));

      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'aes-cropper-btn';
      resetBtn.textContent = o.resetText;
      resetBtn.addEventListener('click', () => this._layout());

      tools.appendChild(gridBtn);
      tools.appendChild(resetBtn);
      header.appendChild(title);
      header.appendChild(tools);

      /* --- body --- */
      const body = document.createElement('div');
      body.className = 'aes-cropper-body';

      const stage = document.createElement('div');
      stage.className = 'aes-cropper-stage';

      const image = document.createElement('img');
      image.className = 'aes-cropper-image';
      image.draggable = false;
      image.alt = '';

      const box = document.createElement('div');
      box.className = 'aes-cropper-box';

      const grid = document.createElement('div');
      grid.className = 'aes-cropper-grid' + (this._gridOn ? '' : ' is-hidden');
      for (let i = 0; i < 4; i++) grid.appendChild(document.createElement('span'));
      box.appendChild(grid);

      ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((h) => {
        const el = document.createElement('div');
        el.className = 'aes-cropper-handle';
        el.dataset.handle = h;
        box.appendChild(el);
      });

      stage.appendChild(image);
      stage.appendChild(box);
      body.appendChild(stage);

      /* --- footer --- */
      const footer = document.createElement('div');
      footer.className = 'aes-cropper-footer';

      const zoomWrap = document.createElement('div');
      zoomWrap.className = 'aes-cropper-zoom';
      const zoomLabel = document.createElement('span');
      zoomLabel.textContent = 'Масштаб';
      const zoomInput = document.createElement('input');
      zoomInput.type = 'range';
      zoomInput.min = '1';
      zoomInput.max = String(o.maxZoom);
      zoomInput.step = '0.01';
      zoomInput.value = '1';
      zoomInput.addEventListener('input', () => {
        this._setZoomFactor(parseFloat(zoomInput.value));
        this._emitChange();
      });
      zoomWrap.appendChild(zoomLabel);
      zoomWrap.appendChild(zoomInput);

      const actions = document.createElement('div');
      actions.className = 'aes-cropper-actions';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'aes-cropper-btn aes-cropper-btn--ghost';
      cancelBtn.textContent = o.cancelText;
      cancelBtn.addEventListener('click', () => this._cancel());

      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'aes-cropper-btn aes-cropper-btn--primary';
      applyBtn.textContent = o.applyText;
      applyBtn.addEventListener('click', () => this._apply());

      actions.appendChild(cancelBtn);
      actions.appendChild(applyBtn);
      footer.appendChild(zoomWrap);
      footer.appendChild(actions);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      overlay.appendChild(modal);

      // Клик по затемнению - закрыть
      overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) this._cancel();
      });

      const container = o.container
        ? (typeof o.container === 'string' ? document.querySelector(o.container) : o.container)
        : document.body;
      (container || document.body).appendChild(overlay);

      this.overlayEl = overlay;
      this.modalEl = modal;
      this.stageEl = stage;
      this.imageEl = image;
      this.boxEl = box;
      this.gridEl = grid;
      this.gridBtn = gridBtn;
      this.zoomInput = zoomInput;

      this._bindStage();

      this._escHandler = (e) => {
        if (e.key === 'Escape' && this._isOpen()) this._cancel();
      };
      document.addEventListener('keydown', this._escHandler);
    }

    /* ---------- Загрузка источника в <img> ---------- */
    _setSource(src) {
      return new Promise((resolve, reject) => {
        const img = this.imageEl;
        if (!img) return reject(new Error('AESCropper: image element отсутствует'));

        if (img.src === src && img.complete && img.naturalWidth) {
          this.naturalWidth = img.naturalWidth;
          this.naturalHeight = img.naturalHeight;
          return resolve();
        }
        img.onload = () => {
          this.naturalWidth = img.naturalWidth;
          this.naturalHeight = img.naturalHeight;
          resolve();
        };
        img.onerror = () => reject(new Error('AESCropper: ошибка загрузки изображения'));
        img.src = src;
      });
    }

    /* ---------- Привязка событий стадии ---------- */
    _bindStage() {
      const stage = this.stageEl;

      stage.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        const handleEl = e.target.closest ? e.target.closest('.aes-cropper-handle') : null;

        if (handleEl) {
          this._drag = {
            type: 'resize',
            handle: handleEl.dataset.handle,
            startX: e.clientX,
            startY: e.clientY,
            orig: { x: this.cropX, y: this.cropY, w: this.cropW, h: this.cropH },
          };
        } else {
          this._drag = {
            type: 'move',
            startX: e.clientX,
            startY: e.clientY,
            origImgX: this.imgX,
            origImgY: this.imgY,
          };
        }

        if (stage.setPointerCapture) {
          try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        }
        e.preventDefault();
      });

      stage.addEventListener('pointermove', (e) => {
        if (!this._drag) return;
        const dx = e.clientX - this._drag.startX;
        const dy = e.clientY - this._drag.startY;

        if (this._drag.type === 'move') {
          this.imgX = this._drag.origImgX + dx;
          this.imgY = this._drag.origImgY + dy;
        } else {
          this._applyResize(this._drag.handle, dx, dy, this._drag.orig);
        }
        this._clampImage();
        this._render();
        this._emitChange();
      });

      const endDrag = (e) => {
        if (!this._drag) return;
        this._drag = null;
        if (stage.releasePointerCapture) {
          try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };
      stage.addEventListener('pointerup', endDrag);
      stage.addEventListener('pointercancel', endDrag);

      stage.addEventListener('wheel', (e) => {
        if (!this._isOpen()) return;
        e.preventDefault();
        const rect = stage.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const factor = Math.pow(1.0018, -e.deltaY);
        this._zoomAround(cx, cy, factor);
        this._render();
        this._emitChange();
      }, { passive: false });

      stage.addEventListener('dblclick', () => this._layout());
    }

    /* ---------- Раскладка (стартовая позиция) ---------- */
    _layout() {
      if (!this.naturalWidth || !this.stageEl) return;
      const W = this.stageEl.clientWidth;
      const H = this.stageEl.clientHeight;
      if (!W || !H) return;

      const pad = 0.08;
      const maxW = W * (1 - pad * 2);
      const maxH = H * (1 - pad * 2);

      let cw, ch;
      if (this.aspect) {
        if (maxW / maxH > this.aspect) {
          ch = maxH; cw = ch * this.aspect;
        } else {
          cw = maxW; ch = cw / this.aspect;
        }
      } else {
        cw = maxW; ch = maxH;
      }

      this.cropW = cw;
      this.cropH = ch;
      this.cropX = (W - cw) / 2;
      this.cropY = (H - ch) / 2;

      const coverScale = Math.max(cw / this.naturalWidth, ch / this.naturalHeight);
      this.imgScale = coverScale;

      const dW = this.naturalWidth * this.imgScale;
      const dH = this.naturalHeight * this.imgScale;
      this.imgX = this.cropX + (cw - dW) / 2;
      this.imgY = this.cropY + (ch - dH) / 2;

      this._render();
      this._emitChange();
    }

    /* ---------- Отрисовка ---------- */
    _render() {
      if (!this.imageEl || !this.naturalWidth) return;

      const dW = this.naturalWidth * this.imgScale;
      const dH = this.naturalHeight * this.imgScale;

      this.imageEl.style.width = dW + 'px';
      this.imageEl.style.height = dH + 'px';
      this.imageEl.style.transform = 'translate3d(' + this.imgX + 'px,' + this.imgY + 'px,0)';

      this.boxEl.style.width = this.cropW + 'px';
      this.boxEl.style.height = this.cropH + 'px';
      this.boxEl.style.transform = 'translate3d(' + this.cropX + 'px,' + this.cropY + 'px,0)';

      if (this.zoomInput) {
        const z = this._getZoomFactor();
        this.zoomInput.value = String(clamp(z, 1, this.options.maxZoom));
      }
    }

    /* ---------- Ограничение изображения ---------- */
    _clampImage() {
      const nw = this.naturalWidth, nh = this.naturalHeight;
      if (!nw || !nh) return;

      const coverScale = Math.max(this.cropW / nw, this.cropH / nh);
      const maxScale = coverScale * this.options.maxZoom;

      if (this.imgScale < coverScale) this.imgScale = coverScale;
      if (this.imgScale > maxScale) this.imgScale = maxScale;

      const dW = nw * this.imgScale;
      const dH = nh * this.imgScale;

      if (this.imgX > this.cropX) this.imgX = this.cropX;
      if (this.imgY > this.cropY) this.imgY = this.cropY;
      if (this.imgX + dW < this.cropX + this.cropW) this.imgX = this.cropX + this.cropW - dW;
      if (this.imgY + dH < this.cropY + this.cropH) this.imgY = this.cropY + this.cropH - dH;
    }

    /* ---------- Зум ---------- */
    _getZoomFactor() {
      if (!this.naturalWidth) return 1;
      const coverScale = Math.max(this.cropW / this.naturalWidth, this.cropH / this.naturalHeight);
      if (!coverScale) return 1;
      return this.imgScale / coverScale;
    }

    _setZoomFactor(v) {
      if (!this.naturalWidth) return;
      const coverScale = Math.max(this.cropW / this.naturalWidth, this.cropH / this.naturalHeight);
      const target = coverScale * clamp(v, 1, this.options.maxZoom);
      const cx = this.cropX + this.cropW / 2;
      const cy = this.cropY + this.cropH / 2;
      this._zoomAround(cx, cy, target / this.imgScale);
      this._render();
    }

    _zoomAround(cx, cy, factor) {
      if (!this.naturalWidth || !isFinite(factor) || factor <= 0) return;
      const newScale = this.imgScale * factor;
      const ix = (cx - this.imgX) / this.imgScale;
      const iy = (cy - this.imgY) / this.imgScale;
      this.imgScale = newScale;
      this.imgX = cx - ix * newScale;
      this.imgY = cy - iy * newScale;
      this._clampImage();
    }

    /* ---------- Изменение размеров рамки ---------- */
    _applyResize(handle, dx, dy, orig) {
      const minS = this.options.minCropSize;
      const aspect = this.aspect;
      const W = this.stageEl.clientWidth;
      const H = this.stageEl.clientHeight;

      let x0 = orig.x, y0 = orig.y, x1 = orig.x + orig.w, y1 = orig.y + orig.h;

      if (handle.indexOf('w') !== -1) x0 += dx;
      if (handle.indexOf('e') !== -1) x1 += dx;
      if (handle.indexOf('n') !== -1) y0 += dy;
      if (handle.indexOf('s') !== -1) y1 += dy;

      if (x1 - x0 < minS) { if (handle.indexOf('w') !== -1) x0 = x1 - minS; else x1 = x0 + minS; }
      if (y1 - y0 < minS) { if (handle.indexOf('n') !== -1) y0 = y1 - minS; else y1 = y0 + minS; }

      let nw = x1 - x0, nh = y1 - y0;
      const isCorner = handle.length === 2;

      if (aspect) {
        if (isCorner) {
          const anchorX = handle.indexOf('w') !== -1 ? orig.x + orig.w : orig.x;
          const anchorY = handle.indexOf('n') !== -1 ? orig.y + orig.h : orig.y;

          let w2 = Math.abs(x1 - x0);
          let h2 = Math.abs(y1 - y0);

          if (w2 / aspect > h2) h2 = w2 / aspect;
          else w2 = h2 * aspect;

          const nx = anchorX + (handle.indexOf('w') !== -1 ? -w2 : w2);
          const ny = anchorY + (handle.indexOf('n') !== -1 ? -h2 : h2);

          x0 = Math.min(anchorX, nx);
          x1 = Math.max(anchorX, nx);
          y0 = Math.min(anchorY, ny);
          y1 = Math.max(anchorY, ny);
        } else if (handle === 'n' || handle === 's') {
          nw = nh * aspect;
          const cx = orig.x + orig.w / 2;
          x0 = cx - nw / 2;
          x1 = cx + nw / 2;
        } else {
          nh = nw / aspect;
          const cy = orig.y + orig.h / 2;
          y0 = cy - nh / 2;
          y1 = cy + nh / 2;
        }
      }

      // Клэмп в пределах стадии
      if (x0 < 0) { x1 -= x0; x0 = 0; }
      if (y0 < 0) { y1 -= y0; y0 = 0; }
      if (x1 > W) { x0 -= (x1 - W); x1 = W; }
      if (y1 > H) { y0 -= (y1 - H); y1 = H; }

      nw = x1 - x0; nh = y1 - y0;
      if (nw < minS || nh < minS) return;
      if (x0 < 0 || y0 < 0 || x1 > W || y1 > H) return;

      this.cropX = x0;
      this.cropY = y0;
      this.cropW = nw;
      this.cropH = nh;
    }

    /* ---------- Применение / отмена ---------- */
    async _apply() {
      try {
        const result = await this._export();
        this._renderPreview(result);
        if (typeof this.options.onComplete === 'function') this.options.onComplete(result);
        if (this.options.autoCloseOnApply) this.close();
        return result;
      } catch (err) {
        console.error('AESCropper:', err);
        throw err;
      }
    }

    _cancel() {
      this.close();
      if (typeof this.options.onCancel === 'function') this.options.onCancel();
    }

    /* ---------- Экспорт результата из модалки ---------- */
    _export() {
      if (!this.naturalWidth) {
        return Promise.reject(new Error('AESCropper: изображение не загружено'));
      }
      const sx = (this.cropX - this.imgX) / this.imgScale;
      const sy = (this.cropY - this.imgY) / this.imgScale;
      const sw = this.cropW / this.imgScale;
      const sh = this.cropH / this.imgScale;

      let ow = this.options.targetWidth;
      let oh = this.options.targetHeight;

      if (ow && !oh) oh = Math.round(ow * (sh / sw));
      if (oh && !ow) ow = Math.round(oh * (sw / sh));
      if (!ow && !oh) { ow = Math.round(sw); oh = Math.round(sh); }

      return this._drawToResult(this.imageEl, sx, sy, sw, sh, ow, oh);
    }

    /* ---------- Авто-обрезка ---------- */
    _autoCropImage(img) {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      let tw = this.options.targetWidth;
      let th = this.options.targetHeight;
      const aspect = this.aspect;

      if (aspect) {
        if (tw && !th) th = Math.round(tw / aspect);
        if (th && !tw) tw = Math.round(th * aspect);
      }

      const targetAspect = (tw && th) ? (tw / th) : (aspect || (nw / nh));
      const srcAspect = nw / nh;

      // Центрируем и подрезаем под нужный аспект
      let sx = 0, sy = 0, sw = nw, sh = nh;
      if (srcAspect > targetAspect) {
        sw = nh * targetAspect;
        sx = (nw - sw) / 2;
      } else if (srcAspect < targetAspect) {
        sh = nw / targetAspect;
        sy = (nh - sh) / 2;
      }

      // Итоговый размер
      let ow = Math.round(sw);
      let oh = Math.round(sh);

      if (tw && th) {
        // Если вырезанная область >= целевых - ресайзим до целевых,
        // иначе не апскейлим (отдаём как есть).
        if (sw >= tw && sh >= th) {
          ow = tw;
          oh = th;
        }
      }

      return this._drawToResult(img, sx, sy, sw, sh, ow, oh);
    }

    /* ---------- Рендер в canvas ---------- */
    _drawToResult(img, sx, sy, sw, sh, ow, oh) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(ow));
      canvas.height = Math.max(1, Math.round(oh));
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (this.options.mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      try {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        return Promise.reject(e);
      }

      const type = this.options.mimeType;
      const quality = this.options.quality;

      return toBlob(canvas, type, quality).then((blob) => ({
        blob,
        dataURL: canvas.toDataURL(type, quality),
        width: canvas.width,
        height: canvas.height,
        canvas,
        size: blob ? blob.size : 0,
        type,
      }));
    }

    /* ---------- Превью ---------- */
    _renderPreview(result) {
      const target = this.options.preview;
      if (!target) return;
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      el.innerHTML = '';
      const img = document.createElement('img');
      img.src = result.dataURL;
      img.alt = 'Обрезанное изображение';
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      img.style.borderRadius = 'inherit';
      el.appendChild(img);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Статические помощники                                              */
  /* ------------------------------------------------------------------ */
  AESCropper.version = VERSION;

  AESCropper.autoCrop = function (file, options) {
    const c = new AESCropper(Object.assign({}, options || {}, { modal: false }));
    return c.autoCrop(file);
  };

  AESCropper.open = function (file, options) {
    const c = new AESCropper(Object.assign({}, options || {}, { modal: true }));
    return c.open(file);
  };

  return AESCropper;
});
