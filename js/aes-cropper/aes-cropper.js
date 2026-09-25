/**
 * aes-cropper.js - универсальная библиотека для кадрирования изображений
 * 
 * (c) AES Foundation, 2023-2026
 * https://docs.aes-wardarkness.ru/library/js/cropper
 * 
 * Лицензировано в соответствии с Лицензией Apache, Версия 2.0 («Лицензия»);
 * вы не можете использовать этот файл иначе как в соответствии с Лицензией.
 * Вы можете получить копию Лицензии по адресу:
 * 
 *     http://apache.org
 * 
 * Если это не предусмотрено применимым законодательством или не согласовано
 * в письменной форме, программное обеспечение, распространяемое по Лицензии,
 * предоставляется на условиях «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ ИЛИ УСЛОВИЙ,
 * явных или подразумеваемых.
 * 
 * Изучите Лицензию для получения информации о конкретных правах и
 * ограничениях в рамках этой Лицензии.
 * 
 * Вы можете свободно:
 *   - Делиться (копировать, распространять) материал на любом носителе и в любом формате
 *   - Адаптировать (изменять, перерабатывать) материал для любых целей, включая коммерческие
 * 
 * При обязательном условии:
 *   - Указание авторства — вы должны указать имя автора (AES Foundation | Faradey | AES WarDarkness), предоставить ссылку на лицензию
 *     и указать, были ли внесены изменения. Вы можете сделать это любым разумным способом,
 *     но не так, чтобы создавалось впечатление, что автор одобряет ваше использование.
 * 
 * 
 * @module AESCropper
 * @version 1.1.6
 * 
 * @description 
 *   Библиотека предоставляет удобный инструментарий для кадрирования изображения
 *   и разные возможности и вариации их воводов.
 *   Поддерживает автоматическое кадрирование, либо ручной выбор зоны при загрузке изображения.
 *   Вывод финального результата в разных форматах.
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

    const VERSION = '1.1.6';
    const STYLE_ID = 'aes-cropper-styles-v5';

    const CSS = `
.aes-cropper-overlay{
  --aes-bg: rgba(8,10,14,.78);
  --aes-modal-bg:#15181f;
  --aes-body-bg:#0b0d12;
  --aes-fg:#e8ecf2;
  --aes-fg-dim:#9aa4b2;
  --aes-accent:#2b8cff;
  --aes-accent-hover:#1c7bf0;
  --aes-border:rgba(255,255,255,.08);
  --aes-btn-bg:rgba(255,255,255,.06);
  --aes-btn-bg-hover:rgba(255,255,255,.12);
  position:fixed;inset:0;z-index:var(--aes-z,2147483000);display:flex;align-items:center;justify-content:center;
  background:var(--aes-bg);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  padding:20px;box-sizing:border-box;color:var(--aes-fg);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  animation:aes-cropper-fade .18s ease}
.aes-cropper-overlay.is-inline{
  position:relative;inset:auto;background:transparent;backdrop-filter:none;
  -webkit-backdrop-filter:none;padding:0;z-index:auto;animation:none;
  display:block;width:100%;height:100%;min-height:0;
}
@keyframes aes-cropper-fade{from{opacity:0}to{opacity:1}}
.aes-cropper-modal{background:var(--aes-modal-bg);border-radius:16px;
  box-shadow:0 24px 64px rgba(0,0,0,.6);width:min(920px,100%);height:min(720px,100%);
  display:flex;flex-direction:column;overflow:hidden;color:inherit;
  border:1px solid var(--aes-border);box-sizing:border-box}
.aes-cropper-overlay.is-inline .aes-cropper-modal{box-shadow:none;border-radius:12px;
  width:100%;height:100%;min-height:360px;max-height:100%}
.aes-cropper-overlay.is-inline .aes-cropper-body{min-height:0}
.aes-cropper-header{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 18px;border-bottom:1px solid var(--aes-border);flex-shrink:0;flex-wrap:wrap}
.aes-cropper-title{font-size:15px;font-weight:600;letter-spacing:.2px}
.aes-cropper-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.aes-cropper-btn{background:var(--aes-btn-bg);border:1px solid var(--aes-border);color:inherit;
  padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer;transition:background .15s;
  font-family:inherit;line-height:1;white-space:nowrap}
.aes-cropper-btn:hover{background:var(--aes-btn-bg-hover)}
.aes-cropper-btn:focus-visible{outline:2px solid var(--aes-accent);outline-offset:2px}
.aes-cropper-btn.is-active{background:var(--aes-accent);border-color:var(--aes-accent);color:#fff}
.aes-cropper-body{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;
  padding:16px;background:var(--aes-body-bg)}
.aes-cropper-stage{position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;
  user-select:none;-webkit-user-select:none;cursor:grab;border-radius:8px;background:var(--aes-body-bg);
  outline:none}
.aes-cropper-stage:active{cursor:grabbing}
.aes-cropper-stage:focus-visible{box-shadow:0 0 0 2px var(--aes-accent) inset}
.aes-cropper-stage[data-mode="crop"],
.aes-cropper-stage[data-mode="crop"]:active{cursor:default}
.aes-cropper-image{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform;
  pointer-events:none;user-select:none;-webkit-user-drag:none;display:block}
.aes-cropper-box{position:absolute;top:0;left:0;box-shadow:0 0 0 9999px rgba(0,0,0,.62);
  outline:1px solid rgba(255,255,255,.95);cursor:move;will-change:transform;box-sizing:border-box}
.aes-cropper-grid{position:absolute;inset:0;pointer-events:none;transition:opacity .15s;opacity:1}
.aes-cropper-grid.is-hidden{opacity:0}
.aes-cropper-grid span{position:absolute;background:rgba(255,255,255,.42);box-shadow:0 0 1px rgba(0,0,0,.5)}
.aes-cropper-grid span:nth-child(1){left:33.333%;top:0;width:1px;height:100%}
.aes-cropper-grid span:nth-child(2){left:66.666%;top:0;width:1px;height:100%}
.aes-cropper-grid span:nth-child(3){top:33.333%;left:0;height:1px;width:100%}
.aes-cropper-grid span:nth-child(4){top:66.666%;left:0;height:1px;width:100%}
.aes-cropper-handle{position:absolute;background:#fff;border:2px solid var(--aes-accent);box-sizing:border-box;
  z-index:2;transition:transform .1s;outline:none}
.aes-cropper-handle:hover{transform:scale(1.15)}
.aes-cropper-handle:focus-visible{box-shadow:0 0 0 3px rgba(43,140,255,.55);z-index:3;transform:scale(1.15)}
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
  padding:14px 18px;border-top:1px solid var(--aes-border);flex-shrink:0;
  background:var(--aes-modal-bg);flex-wrap:wrap}
.aes-cropper-zoom{display:flex;align-items:center;gap:10px;flex:1;max-width:280px;font-size:12px;
  color:var(--aes-fg-dim);min-width:140px}
.aes-cropper-zoom input[type="range"]{flex:1;accent-color:var(--aes-accent);cursor:pointer;min-width:0}
.aes-cropper-actions{display:flex;gap:8px}
.aes-cropper-btn--primary{background:var(--aes-accent);border-color:var(--aes-accent);color:#fff;font-weight:500}
.aes-cropper-btn--primary:hover{background:var(--aes-accent-hover)}
.aes-cropper-btn--ghost{background:transparent}
.aes-cropper-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:14px;background:var(--aes-body-bg);color:var(--aes-fg-dim);
  font-size:13px;z-index:5;text-align:center;padding:24px;box-sizing:border-box}
.aes-cropper-loading[hidden]{display:none}
.aes-cropper-spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.14);
  border-top-color:var(--aes-accent);border-radius:50%;animation:aes-cropper-spin .9s linear infinite}
@keyframes aes-cropper-spin{to{transform:rotate(360deg)}}
.aes-cropper-loading.is-error .aes-cropper-spinner{display:none}
.aes-cropper-error-title{color:#ff6b6b;font-weight:600;font-size:14px}
.aes-cropper-error-msg{max-width:420px;line-height:1.4;word-break:break-word}
@media (max-width:640px){
  .aes-cropper-overlay{padding:0}
  .aes-cropper-modal{width:100%;height:100%;border-radius:0;border:none}
  .aes-cropper-zoom{max-width:120px}
}
@media (pointer:coarse){
  .aes-cropper-handle[data-handle="nw"],.aes-cropper-handle[data-handle="ne"],
  .aes-cropper-handle[data-handle="sw"],.aes-cropper-handle[data-handle="se"]{width:22px;height:22px}
  .aes-cropper-handle[data-handle="nw"]{top:-11px;left:-11px}
  .aes-cropper-handle[data-handle="ne"]{top:-11px;right:-11px}
  .aes-cropper-handle[data-handle="sw"]{bottom:-11px;left:-11px}
  .aes-cropper-handle[data-handle="se"]{bottom:-11px;right:-11px}
  .aes-cropper-handle[data-handle="n"],.aes-cropper-handle[data-handle="s"]{height:14px}
  .aes-cropper-handle[data-handle="e"],.aes-cropper-handle[data-handle="w"]{width:14px}
}
@media (prefers-reduced-motion: reduce){
  .aes-cropper-overlay{animation:none}
  .aes-cropper-handle{transition:none}
  .aes-cropper-spinner{animation-duration:1.6s}
}
`;

    function injectStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function isFiniteNum(v) { return typeof v === 'number' && isFinite(v); }

    function isBlobLike(v) {
        if (!v || typeof v !== 'object') return false;
        const tag = Object.prototype.toString.call(v);
        return tag === '[object Blob]' || tag === '[object File]';
    }

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
                } catch (_) { resolve(null); }
            }
        });
    }

    const raf = (typeof requestAnimationFrame === 'function')
        ? requestAnimationFrame
        : function (cb) { return setTimeout(cb, 16); };

    async function loadSource(input, opts) {
        opts = opts || {};
        const useExif = opts.useExif !== false;
        const referrerPolicy = opts.referrerPolicy || null;
        const coOpt = opts.crossOrigin;

        if (isBlobLike(input)) {
            if (typeof createImageBitmap === 'function') {
                try {
                    const bmp = await createImageBitmap(input, {
                        imageOrientation: useExif ? 'from-image' : 'none',
                    });
                    return {
                        bitmap: bmp,
                        width: bmp.width,
                        height: bmp.height,
                        revoke: function () { if (bmp.close) bmp.close(); },
                    };
                } catch (_) { /* fallthrough */ }
            }
            const url = URL.createObjectURL(input);
            try {
                const img = await loadImageEl(url, null, referrerPolicy, !useExif);
                return {
                    bitmap: img,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    revoke: function () { URL.revokeObjectURL(url); },
                };
            } catch (e) {
                URL.revokeObjectURL(url);
                throw e;
            }
        }

        const url = String(input);
        let crossOrigin = null;
        if (coOpt === 'anonymous' || coOpt === 'use-credentials') {
            crossOrigin = coOpt;
        } else if (coOpt !== false && coOpt !== null && coOpt !== undefined) {
            try {
                if (typeof location !== 'undefined') {
                    const u = new URL(url, location.href);
                    if ((u.protocol === 'http:' || u.protocol === 'https:') && u.origin !== location.origin) {
                        crossOrigin = 'anonymous';
                    }
                }
            } catch (_) { }
        } else if (coOpt === undefined) {
            try {
                if (typeof location !== 'undefined') {
                    const u = new URL(url, location.href);
                    if ((u.protocol === 'http:' || u.protocol === 'https:') && u.origin !== location.origin) {
                        crossOrigin = 'anonymous';
                    }
                }
            } catch (_) { }
        }

        const img = await loadImageEl(url, crossOrigin, referrerPolicy, !useExif);
        return {
            bitmap: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            revoke: function () { },
        };
    }

    function loadImageEl(src, crossOrigin, referrerPolicy, disableExifOrientation) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            if (crossOrigin) img.crossOrigin = crossOrigin;
            if (referrerPolicy) img.referrerPolicy = referrerPolicy;
            if (disableExifOrientation) {
                try { img.style.imageOrientation = 'none'; } catch (_) { }
            }
            img.onload = () => {
                if (typeof img.decode === 'function') {
                    img.decode().then(() => resolve(img), () => resolve(img));
                } else {
                    resolve(img);
                }
            };
            img.onerror = () => reject(new Error('AESCropper: не удалось загрузить изображение - ' + src));
            img.src = src;
        });
    }

    const bodyLocks = new WeakMap();
    function lockBody(doc) {
        let st = bodyLocks.get(doc);
        if (!st) { st = { count: 0, overflow: '', padRight: '', padRightSet: false }; bodyLocks.set(doc, st); }
        if (st.count === 0) {
            st.overflow = doc.body.style.overflow || '';
            st.padRight = doc.body.style.paddingRight || '';
            st.padRightSet = false;
            try {
                const comp = window.innerWidth - doc.documentElement.clientWidth;
                if (comp > 0) {
                    const cur = parseFloat(getComputedStyle(doc.body).paddingRight) || 0;
                    doc.body.style.paddingRight = (cur + comp) + 'px';
                    st.padRightSet = true;
                }
            } catch (_) { }
        }
        st.count++;
        doc.body.style.overflow = 'hidden';
    }
    function unlockBody(doc) {
        const st = bodyLocks.get(doc);
        if (!st) return;
        st.count = Math.max(0, st.count - 1);
        if (st.count === 0) {
            doc.body.style.overflow = st.overflow || '';
            if (st.padRightSet) doc.body.style.paddingRight = st.padRight || '';
            bodyLocks.delete(doc);
        }
    }

    function drawRotated(ctx, source, rotation) {
        const bw = source.width, bh = source.height;
        if (rotation === 90) {
            ctx.translate(bh, 0);
            ctx.rotate(Math.PI / 2);
        } else if (rotation === 180) {
            ctx.translate(bw, bh);
            ctx.rotate(Math.PI);
        } else if (rotation === 270) {
            ctx.translate(0, bw);
            ctx.rotate(-Math.PI / 2);
        }
        ctx.drawImage(source, 0, 0, bw, bh);
    }

    function rotatedDims(w, h, rotation) {
        return (rotation === 90 || rotation === 270) ? { w: h, h: w } : { w: w, h: h };
    }

    function rotateCropRectNatural(rect, fromW, fromH) {
        return {
            x: fromH - rect.y - rect.h,
            y: rect.x,
            w: rect.h,
            h: rect.w,
        };
    }

    const DEFAULTS = {
        aspectRatio: null,
        targetWidth: null,
        targetHeight: null,
        preview: null,
        container: null,
        modal: true,
        grid: true,

        dragMode: 'image',
        showModeToggle: true,
        showRotateToggle: true,
        clampCropOnZoom: true,

        mimeType: 'image/jpeg',
        quality: 0.92,
        minCropSize: 40,
        maxZoom: 8,
        background: '#ffffff',

        maxDisplaySize: 4096,

        zIndex: 2147483000,
        injectStyles: true,
        returnDataURL: false,
        useExifOrientation: true,
        referrerPolicy: null,
        crossOrigin: undefined,

        closeOnEscape: true,
        closeOnBackdrop: true,
        wheelZoom: true,

        initialCrop: null,

        title: 'Обрезка изображения',
        applyText: 'Применить',
        cancelText: 'Отмена',
        resetText: 'Сбросить',
        gridText: 'Сетка',
        rotateText: '90 градусов',
        rotateTitle: 'Повернуть на 90°',
        modeImageText: 'Двигать картинку',
        modeCropText: 'Двигать рамку',
        modeImageTitle: 'Сейчас двигается картинка (рамка зафиксирована в центре). Нажмите, чтобы переключить на перемещение рамки.',
        modeCropTitle: 'Сейчас двигается рамка (картинка зафиксирована). Нажмите, чтобы переключить на перемещение картинки.',
        zoomLabel: 'Масштаб',
        stageLabel: 'Область обрезки',
        handleLabel: 'Изменить размер рамки',

        autoCloseOnApply: true,

        loadingText: 'Загрузка изображения…',
        errorTitle: 'Не удалось загрузить изображение',

        onComplete: null,
        onCancel: null,
        onChange: null,
        onReady: null,
        onLoad: null,
        onError: null,
    };

    const _openStack = [];

    class AESCropper {
        constructor(options) {
            this.options = Object.assign({}, DEFAULTS, options || {});

            if (this.options.dragMode !== 'crop') this.options.dragMode = 'image';
            if (!(this.options.maxZoom >= 1)) this.options.maxZoom = 1;
            if (!(this.options.maxDisplaySize >= 0)) this.options.maxDisplaySize = 0;

            this.aspect = null;
            if (this.options.aspectRatio) {
                this.aspect = this.options.aspectRatio;
            } else if (this.options.targetWidth && this.options.targetHeight) {
                this.aspect = this.options.targetWidth / this.options.targetHeight;
            }

            this._bitmap = null;
            this._bitmapRevoke = null;
            this._bitmapWidth = 0;
            this._bitmapHeight = 0;
            this.naturalWidth = 0;
            this.naturalHeight = 0;

            this._canvasWidth = 0;
            this._canvasHeight = 0;
            this._displayScale = 1;

            this._rotation = 0;

            this.imgScale = 1;
            this.imgX = 0;
            this.imgY = 0;
            this.cropX = 0;
            this.cropY = 0;
            this.cropW = 0;
            this.cropH = 0;

            this._drag = null;
            this._pointers = new Map();
            this._pinch = null;

            this._previewURL = null;
            this._bodyLocked = false;
            this._openToken = 0;

            this._gridOn = !!this.options.grid;
            this._escHandler = null;
            this._keyHandler = null;
            this._focusTrapHandler = null;
            this._emitScheduled = false;
            this._resizeObserver = null;
            this._winResizeHandler = null;
            this._prevActiveEl = null;
            this._lastLayoutW = 0;
            this._lastLayoutH = 0;
            this._lastResult = null;

            this._layoutRetry = false;

            if (typeof document !== 'undefined' && this.options.injectStyles) injectStyles();
        }

        async open(file) {
            if (typeof document === 'undefined') throw new Error('AESCropper: open() недоступен вне браузера');

            const token = ++this._openToken;

            if (!this.overlayEl) this._buildModal();

            this._releaseBitmap();

            this._prevActiveEl = document.activeElement;

            this._setLoadingState();
            this._showOverlay();

            if (this.options.modal) {
                try { lockBody(document); this._bodyLocked = true; } catch (_) { }
            }

            let loaded;
            try {
                loaded = await loadSource(file, {
                    useExif: this.options.useExifOrientation,
                    referrerPolicy: this.options.referrerPolicy,
                    crossOrigin: this.options.crossOrigin,
                });
            } catch (e) {
                if (token === this._openToken) {
                    this._setErrorState(e);
                }
                if (typeof this.options.onError === 'function') this.options.onError(e);
                throw e;
            }

            if (token !== this._openToken) {
                loaded.revoke && loaded.revoke();
                return this;
            }

            this._bitmap = loaded.bitmap;
            this._bitmapRevoke = loaded.revoke || null;
            this._bitmapWidth = loaded.width;
            this._bitmapHeight = loaded.height;
            this._rotation = 0;

            this._updateRotatedDims();
            this._redrawDisplayCanvas();
            this._setStageState();

            await new Promise((r) => raf(() => raf(r)));
            if (token !== this._openToken) return this;

            await this._waitForStageSize(3000);
            if (token !== this._openToken) return this;

            this._lastLayoutW = 0;
            this._lastLayoutH = 0;
            this._layout(false);
            if (this.options.initialCrop) this._applyInitialCrop();

            try { this.stageEl.focus({ preventScroll: true }); } catch (_) { this.stageEl.focus(); }

            this._attachResizeHandlers();

            if (typeof this.options.onLoad === 'function') this.options.onLoad(this);
            if (typeof this.options.onReady === 'function') this.options.onReady(this);
            return this;
        }

        async autoCrop(file) {
            const token = ++this._openToken;
            const loaded = await loadSource(file, {
                useExif: this.options.useExifOrientation,
                referrerPolicy: this.options.referrerPolicy,
                crossOrigin: this.options.crossOrigin,
            });
            try {
                if (token !== this._openToken) return null;
                this._releaseBitmap();
                this._bitmap = loaded.bitmap;
                this._bitmapRevoke = loaded.revoke || null;
                this._bitmapWidth = loaded.width;
                this._bitmapHeight = loaded.height;
                this._rotation = 0;
                this._updateRotatedDims();
                this._displayScale = 1;
                this._canvasWidth = this.naturalWidth;
                this._canvasHeight = this.naturalHeight;

                const result = await this._autoCropImage();
                this._lastResult = result;
                this._renderPreview(result);
                if (typeof this.options.onComplete === 'function') this.options.onComplete(result);
                return result;
            } finally {
                this._releaseBitmap();
            }
        }

        isOpen() { return this._isOpen(); }

        close() {
            if (!this.overlayEl) return;

            this._openToken++;

            this._hideOverlay();

            if (this._bodyLocked) {
                try { unlockBody(document); } catch (_) { }
                this._bodyLocked = false;
            }

            this._detachResizeHandlers();
            this._detachFocusTrap();

            this._drag = null;
            this._pinch = null;
            this._pointers.clear();
            this._layoutRetry = false;

            this._releaseBitmap();

            if (this._prevActiveEl && this._prevActiveEl.focus) {
                try { this._prevActiveEl.focus({ preventScroll: true }); } catch (_) { }
            }
            this._prevActiveEl = null;
        }

        destroy() {
            this._openToken++;
            this.close();

            if (this._escHandler && typeof document !== 'undefined') {
                document.removeEventListener('keydown', this._escHandler, true);
                this._escHandler = null;
            }
            if (this._keyHandler && this.stageEl) {
                this.stageEl.removeEventListener('keydown', this._keyHandler);
                this._keyHandler = null;
            }

            if (this._previewURL) {
                URL.revokeObjectURL(this._previewURL);
                this._previewURL = null;
            }

            this._releaseBitmap();

            if (this.overlayEl && this.overlayEl.parentNode) {
                this.overlayEl.parentNode.removeChild(this.overlayEl);
            }
            this.overlayEl = null;
            this.modalEl = null;
            this.stageEl = null;
            this.imageEl = null;
            this.boxEl = null;
            this.gridEl = null;
            this.gridBtn = null;
            this.modeBtn = null;
            this.rotateBtn = null;
            this.zoomInput = null;
            this.loadingEl = null;
            this._lastResult = null;
        }

        setAspectRatio(ratio) {
            const saved = this._snapshotState();
            this.options.aspectRatio = ratio || null;
            this.aspect = ratio || null;
            if (!this.options.aspectRatio && this.options.targetWidth && this.options.targetHeight) {
                this.aspect = this.options.targetWidth / this.options.targetHeight;
            }
            if (this._isOpen()) {
                this._layout(false);
                if (saved) this._restoreState(saved, false);
            }
            return this;
        }

        setTargetSize(w, h) {
            const saved = this._snapshotState();
            this.options.targetWidth = w || null;
            this.options.targetHeight = h || null;
            if (!this.options.aspectRatio && w && h) this.aspect = w / h;
            if (this._isOpen()) {
                this._layout(false);
                if (saved) this._restoreState(saved, false);
            }
            return this;
        }

        setGrid(on) {
            this._gridOn = !!on;
            this.options.grid = this._gridOn;
            if (this.gridEl) this.gridEl.classList.toggle('is-hidden', !this._gridOn);
            if (this.gridBtn) this.gridBtn.classList.toggle('is-active', this._gridOn);
            return this;
        }

        setDragMode(mode) {
            if (mode !== 'image' && mode !== 'crop') return this;
            if (this.options.dragMode === mode) return this;

            const saved = this._snapshotState();
            this.options.dragMode = mode;

            if (this.modeBtn) {
                this.modeBtn.textContent = this._modeBtnText();
                this.modeBtn.title = this._modeBtnTitle();
            }
            if (this.stageEl) this.stageEl.dataset.mode = mode;

            if (this._isOpen()) {
                this._layout(false);
                if (saved) this._restoreState(saved, true);
            }
            return this;
        }

        getDragMode() { return this.options.dragMode; }

        getCrop(space) {
            if (space === 'natural' || space === 'image') return this._stageCropToNatural();
            return { x: this.cropX, y: this.cropY, width: this.cropW, height: this.cropH };
        }

        getZoom() { return this._getZoomFactor(); }

        getImageTransform() {
            return { x: this.imgX, y: this.imgY, scale: this.imgScale };
        }

        setImageTransform(t) {
            if (!t || !this.stageEl || !this.naturalWidth) return this;
            if (isFiniteNum(t.scale)) {
                const base = this._baseScale();
                if (base > 0) {
                    this.imgScale = clamp(t.scale, base, base * this.options.maxZoom);
                }
            }
            if (isFiniteNum(t.x)) this.imgX = t.x;
            if (isFiniteNum(t.y)) this.imgY = t.y;
            if (this.options.dragMode === 'image') this._clampImage();
            else this._clampCropBox();
            this._render();
            this._emitChange();
            return this;
        }

        getRotation() { return this._rotation; }

        getNaturalSize() {
            return { width: this.naturalWidth, height: this.naturalHeight };
        }

        getResult() { return this._lastResult; }

        setCrop(x, y, w, h) {
            if (!this.stageEl || !this.naturalWidth) return this;

            const minS = this._effectiveMinCrop();
            const aspect = this.aspect;

            let cw = Math.max(minS, w);
            let ch = Math.max(minS, h);

            if (aspect) {
                if (cw / ch > aspect) ch = cw / aspect;
                else cw = ch * aspect;
            }

            this.cropX = x;
            this.cropY = y;
            this.cropW = cw;
            this.cropH = ch;

            this._ensureCropFitsImage();
            this._clampCropBox();
            this._render();
            this._emitChange();
            return this;
        }

        setZoom(z, anchor) {
            this._setZoomFactor(z, anchor);
            this._emitChange();
            return this;
        }

        setMaxZoom(max) {
            if (!(max >= 1)) return this;
            this.options.maxZoom = max;
            if (this.zoomInput) this.zoomInput.max = String(max);
            this._setZoomFactor(clamp(this._getZoomFactor(), 1, max));
            return this;
        }

        rotate90() {
            const saved = this._snapshotState();

            if (!saved) {
                this._rotation = (this._rotation + 90) % 360;
                this._updateRotatedDims();
                this._redrawDisplayCanvas();
                if (this._isOpen()) this._layout(false);
                this._emitChange();
                return this;
            }

            const oldH = this.naturalHeight;
            const oldW = this.naturalWidth;
            const newNCrop = rotateCropRectNatural(saved.nCrop, oldW, oldH);

            this._rotation = (this._rotation + 90) % 360;
            this._updateRotatedDims();
            this._redrawDisplayCanvas();

            if (this._isOpen()) {
                this._layout(false);
                this._restoreState({ nCrop: newNCrop, zoom: saved.zoom }, true);
            }
            this._emitChange();
            return this;
        }

        reset() {
            this._rotation = 0;
            this._updateRotatedDims();
            this._redrawDisplayCanvas();
            if (this._isOpen()) {
                this._layout(false);
                if (this.options.initialCrop) this._applyInitialCrop();
            }
            this._emitChange();
            return this;
        }

        async export() {
            const result = await this._export();
            this._lastResult = result;
            return result;
        }

        _isOpen() {
            if (!this.overlayEl) return false;
            if (!this.overlayEl.isConnected) return false;
            const d = this.overlayEl.style.display;
            return d !== 'none' && d !== '';
        }

        _releaseBitmap() {
            if (this._bitmapRevoke) {
                try { this._bitmapRevoke(); } catch (_) { }
                this._bitmapRevoke = null;
            }
            this._bitmap = null;
            this._bitmapWidth = 0;
            this._bitmapHeight = 0;
            this._canvasWidth = 0;
            this._canvasHeight = 0;
            this._displayScale = 1;
            this.naturalWidth = 0;
            this.naturalHeight = 0;
        }

        _updateRotatedDims() {
            const d = rotatedDims(this._bitmapWidth, this._bitmapHeight, this._rotation);
            this.naturalWidth = d.w;
            this.naturalHeight = d.h;
        }

        _effectiveMinCrop() {
            const stage = this.stageEl;
            if (!stage) return this.options.minCropSize;
            const W = stage.clientWidth, H = stage.clientHeight;
            if (!W || !H) return this.options.minCropSize;
            const lim = Math.min(W, H) * 0.5;
            return Math.min(this.options.minCropSize, Math.max(1, lim));
        }

        _getCropImageCenter() {
            if (!this.imgScale) return null;
            return {
                x: (this.cropX + this.cropW / 2 - this.imgX) / this.imgScale,
                y: (this.cropY + this.cropH / 2 - this.imgY) / this.imgScale,
            };
        }

        _restoreCropImageCenter(c) {
            if (!c || !this.imgScale) return;
            const cx = this.imgX + c.x * this.imgScale;
            const cy = this.imgY + c.y * this.imgScale;
            this.cropX = cx - this.cropW / 2;
            this.cropY = cy - this.cropH / 2;
            this._clampCropBox();
        }

        _stageCropToNatural() {
            const ds = this._displayScale || 1;
            const k = (this.imgScale || 0) * ds;
            if (!isFinite(k) || k <= 0) {
                return { x: 0, y: 0, w: 0, h: 0 };
            }
            return {
                x: (this.cropX - this.imgX) / k,
                y: (this.cropY - this.imgY) / k,
                w: this.cropW / k,
                h: this.cropH / k,
            };
        }

        _snapshotState() {
            if (!this.cropW || !this.cropH || !this.imgScale || !this._canvasWidth) return null;
            const nc = this._stageCropToNatural();
            if (!isFinite(nc.w) || !isFinite(nc.h) || nc.w <= 0 || nc.h <= 0) return null;
            return {
                nCrop: nc,
                zoom: this._getZoomFactor(),
            };
        }

        _restoreState(s, keepSize) {
            if (!s || !s.nCrop || !this.stageEl) return;
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (!W || !H) return;

            const base = this._baseScale();
            if (!base || !isFinite(base)) return;

            const targetScale = base * clamp(s.zoom, 1, this.options.maxZoom);
            this.imgScale = targetScale;
            const ds = this._displayScale || 1;
            const k = this.imgScale * ds;
            if (!isFinite(k) || k <= 0) return;

            if (keepSize) {
                this.cropW = s.nCrop.w * k;
                this.cropH = s.nCrop.h * k;
                this.cropX = (W - this.cropW) / 2;
                this.cropY = (H - this.cropH) / 2;
                this.imgX = this.cropX - s.nCrop.x * k;
                this.imgY = this.cropY - s.nCrop.y * k;
            } else {
                const cxN = s.nCrop.x + s.nCrop.w / 2;
                const cyN = s.nCrop.y + s.nCrop.h / 2;
                this.cropX = (W - this.cropW) / 2;
                this.cropY = (H - this.cropH) / 2;
                this.imgX = this.cropX + this.cropW / 2 - cxN * k;
                this.imgY = this.cropY + this.cropH / 2 - cyN * k;
            }

            if (this.options.dragMode === 'image') this._clampImage();
            else this._clampCropBox();

            this._render();
            this._emitChange();
        }

        _applyInitialCrop() {
            const ic = this.options.initialCrop;
            if (!ic || !this.stageEl) return;
            if (!isFiniteNum(this.imgScale) || this.imgScale <= 0) return;
            const ds = this._displayScale || 1;
            const k = this.imgScale * ds;
            if (!isFinite(k) || k <= 0) return;
            const x = this.imgX + ic.x * k;
            const y = this.imgY + ic.y * k;
            const w = ic.width * k;
            const h = ic.height * k;
            if (!(w > 0) || !(h > 0) || !isFinite(w) || !isFinite(h)) return;
            this.setCrop(x, y, w, h);
        }

        _emitChange() {
            if (typeof this.options.onChange !== 'function') return;
            if (this._emitScheduled) return;
            this._emitScheduled = true;
            raf(() => {
                this._emitScheduled = false;
                if (typeof this.options.onChange !== 'function') return;
                this.options.onChange({
                    crop: { x: this.cropX, y: this.cropY, width: this.cropW, height: this.cropH },
                    cropNatural: this._stageCropToNatural(),
                    image: { x: this.imgX, y: this.imgY, scale: this.imgScale },
                    dragMode: this.options.dragMode,
                    rotation: this._rotation,
                });
            });
        }

        _modeBtnText() {
            return this.options.dragMode === 'image'
                ? this.options.modeImageText
                : this.options.modeCropText;
        }
        _modeBtnTitle() {
            return this.options.dragMode === 'image'
                ? this.options.modeImageTitle
                : this.options.modeCropTitle;
        }

        _setLoadingState() {
            if (!this.loadingEl) return;
            this.loadingEl.hidden = false;
            this.loadingEl.classList.remove('is-error');
            this.loadingEl.innerHTML =
                '<div class="aes-cropper-spinner" aria-hidden="true"></div>' +
                '<div>' + escapeHtml(this.options.loadingText) + '</div>';
            if (this.stageEl) this.stageEl.style.display = 'none';
        }

        _setStageState() {
            if (this.loadingEl) this.loadingEl.hidden = true;
            if (this.stageEl) this.stageEl.style.display = '';
        }

        _setErrorState(err) {
            if (!this.loadingEl) return;
            this.loadingEl.hidden = false;
            this.loadingEl.classList.add('is-error');
            const msg = (err && err.message) ? err.message : String(err || '');
            this.loadingEl.innerHTML =
                '<div class="aes-cropper-error-title">' + escapeHtml(this.options.errorTitle) + '</div>' +
                '<div class="aes-cropper-error-msg">' + escapeHtml(msg) + '</div>';
            if (this.stageEl) this.stageEl.style.display = 'none';
        }

        _buildModal() {
            const o = this.options;

            const overlay = document.createElement('div');
            overlay.className = 'aes-cropper-overlay' + (o.modal ? '' : ' is-inline');
            overlay.style.display = 'none';
            overlay.style.setProperty('--aes-z', String(o.zIndex));
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', o.modal ? 'true' : 'false');

            const modal = document.createElement('div');
            modal.className = 'aes-cropper-modal';

            const header = document.createElement('div');
            header.className = 'aes-cropper-header';

            const title = document.createElement('div');
            title.className = 'aes-cropper-title';
            title.textContent = o.title;
            title.id = 'aes-cropper-title-' + Math.random().toString(36).slice(2, 8);
            overlay.setAttribute('aria-labelledby', title.id);

            const tools = document.createElement('div');
            tools.className = 'aes-cropper-tools';

            let modeBtn = null;
            if (o.showModeToggle) {
                modeBtn = document.createElement('button');
                modeBtn.type = 'button';
                modeBtn.className = 'aes-cropper-btn';
                modeBtn.textContent = this._modeBtnText();
                modeBtn.title = this._modeBtnTitle();
                modeBtn.addEventListener('click', () => {
                    this.setDragMode(this.options.dragMode === 'image' ? 'crop' : 'image');
                });
                tools.appendChild(modeBtn);
            }

            let rotateBtn = null;
            if (o.showRotateToggle) {
                rotateBtn = document.createElement('button');
                rotateBtn.type = 'button';
                rotateBtn.className = 'aes-cropper-btn';
                rotateBtn.textContent = o.rotateText;
                rotateBtn.title = o.rotateTitle;
                rotateBtn.addEventListener('click', () => this.rotate90());
                tools.appendChild(rotateBtn);
            }

            const gridBtn = document.createElement('button');
            gridBtn.type = 'button';
            gridBtn.className = 'aes-cropper-btn' + (this._gridOn ? ' is-active' : '');
            gridBtn.textContent = o.gridText;
            gridBtn.addEventListener('click', () => this.setGrid(!this._gridOn));

            const resetBtn = document.createElement('button');
            resetBtn.type = 'button';
            resetBtn.className = 'aes-cropper-btn';
            resetBtn.textContent = o.resetText;
            resetBtn.addEventListener('click', () => this.reset());

            tools.appendChild(gridBtn);
            tools.appendChild(resetBtn);
            header.appendChild(title);
            header.appendChild(tools);

            const body = document.createElement('div');
            body.className = 'aes-cropper-body';

            const loading = document.createElement('div');
            loading.className = 'aes-cropper-loading';
            loading.setAttribute('role', 'status');
            loading.setAttribute('aria-live', 'polite');

            const stage = document.createElement('div');
            stage.className = 'aes-cropper-stage';
            stage.dataset.mode = o.dragMode;
            stage.tabIndex = 0;
            stage.setAttribute('role', 'application');
            stage.setAttribute('aria-label', o.stageLabel);
            stage.style.display = 'none';

            const image = document.createElement('canvas');
            image.className = 'aes-cropper-image';
            image.setAttribute('aria-hidden', 'true');

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
                el.tabIndex = 0;
                el.setAttribute('role', 'button');
                el.setAttribute('aria-label', o.handleLabel + ' - ' + h);
                this._bindHandleKeyboard(el, h);
                box.appendChild(el);
            });

            stage.appendChild(image);
            stage.appendChild(box);
            body.appendChild(loading);
            body.appendChild(stage);

            const footer = document.createElement('div');
            footer.className = 'aes-cropper-footer';

            const zoomWrap = document.createElement('div');
            zoomWrap.className = 'aes-cropper-zoom';
            const zoomLabel = document.createElement('span');
            zoomLabel.textContent = o.zoomLabel;
            const zoomInput = document.createElement('input');
            zoomInput.type = 'range';
            zoomInput.min = '1';
            zoomInput.max = String(o.maxZoom);
            zoomInput.step = '0.01';
            zoomInput.value = '1';
            zoomInput.setAttribute('aria-label', o.zoomLabel);
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
            applyBtn.addEventListener('click', () => {
                this._apply().catch(() => { });
            });

            actions.appendChild(cancelBtn);
            actions.appendChild(applyBtn);
            footer.appendChild(zoomWrap);
            footer.appendChild(actions);

            modal.appendChild(header);
            modal.appendChild(body);
            modal.appendChild(footer);
            overlay.appendChild(modal);

            overlay.addEventListener('pointerdown', (e) => {
                if (e.target === overlay && o.modal && this.options.closeOnBackdrop) this._cancel();
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
            this.modeBtn = modeBtn;
            this.rotateBtn = rotateBtn;
            this.zoomInput = zoomInput;
            this.loadingEl = loading;

            this._bindStage();
            this._bindKeyboard();

            this._escHandler = (e) => {
                if (e.key === 'Escape' && this._isOpen()) {
                    if (!this.options.closeOnEscape) return;
                    if (_openStack[_openStack.length - 1] !== this) return;
                    e.stopPropagation();
                    this._cancel();
                }
            };
            document.addEventListener('keydown', this._escHandler, true);
        }

        _showOverlay() {
            if (!this.overlayEl.isConnected) {
                const o = this.options;
                const container = o.container
                    ? (typeof o.container === 'string' ? document.querySelector(o.container) : o.container)
                    : document.body;
                (container || document.body).appendChild(this.overlayEl);
            }

            this.overlayEl.style.display = this.options.modal ? 'flex' : 'block';

            if (this.options.modal) this._attachFocusTrap();

            const i = _openStack.indexOf(this);
            if (i !== -1) _openStack.splice(i, 1);
            _openStack.push(this);
        }

        _hideOverlay() {
            this.overlayEl.style.display = 'none';
            this._drag = null;
            this._pinch = null;
            this._pointers.clear();

            const i = _openStack.indexOf(this);
            if (i !== -1) _openStack.splice(i, 1);
        }

        _attachFocusTrap() {
            this._detachFocusTrap();
            this._focusTrapHandler = (e) => {
                if (e.key !== 'Tab' || !this._isOpen() || !this.modalEl) return;
                if (_openStack[_openStack.length - 1] !== this) return;
                const focusables = this.modalEl.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
                    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                const active = document.activeElement;
                if (e.shiftKey) {
                    if (active === first || !this.modalEl.contains(active)) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (active === last || !this.modalEl.contains(active)) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            };
            document.addEventListener('keydown', this._focusTrapHandler, true);
        }

        _detachFocusTrap() {
            if (this._focusTrapHandler) {
                document.removeEventListener('keydown', this._focusTrapHandler, true);
                this._focusTrapHandler = null;
            }
        }

        _redrawDisplayCanvas() {
            if (!this._bitmap || !this.imageEl) return;
            const nw = this.naturalWidth;
            const nh = this.naturalHeight;
            if (!nw || !nh) return;

            const maxSize = this.options.maxDisplaySize > 0 ? this.options.maxDisplaySize : Infinity;
            const scale = Math.min(1, maxSize / Math.max(nw, nh));
            this._displayScale = scale;
            this._canvasWidth = Math.max(1, Math.round(nw * scale));
            this._canvasHeight = Math.max(1, Math.round(nh * scale));

            const c = this.imageEl;
            c.width = this._canvasWidth;
            c.height = this._canvasHeight;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.save();
            ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
            if (scale < 1) ctx.scale(scale, scale);
            drawRotated(ctx, this._bitmap, this._rotation);
            ctx.restore();
        }

        _attachResizeHandlers() {
            this._detachResizeHandlers();

            if (typeof ResizeObserver === 'function') {
                this._resizeObserver = new ResizeObserver(() => {
                    if (this._isOpen()) this._layout('full');
                });
                try { this._resizeObserver.observe(this.stageEl); } catch (_) { }
                if (!this.options.modal && this.overlayEl) {
                    try { this._resizeObserver.observe(this.overlayEl); } catch (_) { }
                }
            }
            this._winResizeHandler = () => {
                if (this._isOpen()) this._layout('full');
            };
            window.addEventListener('resize', this._winResizeHandler);
            window.addEventListener('orientationchange', this._winResizeHandler);
        }

        _detachResizeHandlers() {
            if (this._resizeObserver) {
                try { this._resizeObserver.disconnect(); } catch (_) { }
                this._resizeObserver = null;
            }
            if (this._winResizeHandler) {
                window.removeEventListener('resize', this._winResizeHandler);
                window.removeEventListener('orientationchange', this._winResizeHandler);
                this._winResizeHandler = null;
            }
        }

        _bindHandleKeyboard(handleEl, handle) {
            handleEl.addEventListener('keydown', (e) => {
                if (!this._isOpen()) return;
                const step = e.shiftKey ? 10 : 1;
                let dx = 0, dy = 0;
                switch (e.key) {
                    case 'ArrowLeft': dx = -step; break;
                    case 'ArrowRight': dx = step; break;
                    case 'ArrowUp': dy = -step; break;
                    case 'ArrowDown': dy = step; break;
                    default: return;
                }
                e.preventDefault();
                e.stopPropagation();
                this._applyResize(handle, dx, dy, {
                    x: this.cropX, y: this.cropY, w: this.cropW, h: this.cropH,
                });
                if (this.options.dragMode === 'image') this._clampImage();
                else this._clampCropBox();
                this._render();
                this._emitChange();
            });
        }

        _bindStage() {
            const stage = this.stageEl;
            const pointers = this._pointers;

            stage.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                if (e.target.closest && e.target.closest('.aes-cropper-handle')) {
                    try { e.target.focus({ preventScroll: true }); } catch (_) { }
                }
                pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (pointers.size === 2) {
                    this._drag = null;
                    this._pinch = this._computePinch();
                } else if (pointers.size === 1) {
                    const handleEl = e.target.closest ? e.target.closest('.aes-cropper-handle') : null;

                    if (handleEl) {
                        this._drag = {
                            type: 'resize',
                            handle: handleEl.dataset.handle,
                            startX: e.clientX,
                            startY: e.clientY,
                            orig: { x: this.cropX, y: this.cropY, w: this.cropW, h: this.cropH },
                        };
                    } else if (this.options.dragMode === 'crop') {
                        this._drag = {
                            type: 'move-crop',
                            startX: e.clientX,
                            startY: e.clientY,
                            origCropX: this.cropX,
                            origCropY: this.cropY,
                        };
                    } else {
                        this._drag = {
                            type: 'move-image',
                            startX: e.clientX,
                            startY: e.clientY,
                            origImgX: this.imgX,
                            origImgY: this.imgY,
                        };
                    }
                }

                try { stage.setPointerCapture(e.pointerId); } catch (_) { }
                e.preventDefault();
            });

            stage.addEventListener('pointermove', (e) => {
                if (!pointers.has(e.pointerId)) return;
                pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (pointers.size >= 2 && this._pinch) {
                    const now = this._computePinch();
                    if (this._pinch.distance > 0 && now.distance > 0) {
                        const factor = now.distance / this._pinch.distance;
                        const rect = stage.getBoundingClientRect();
                        const cx = now.cx - rect.left;
                        const cy = now.cy - rect.top;
                        this._zoomAround(cx, cy, factor);
                        this._render();
                        this._emitChange();
                    }
                    this._pinch = now;
                    return;
                }

                if (!this._drag) return;
                const dx = e.clientX - this._drag.startX;
                const dy = e.clientY - this._drag.startY;

                if (this._drag.type === 'move-image') {
                    this.imgX = this._drag.origImgX + dx;
                    this.imgY = this._drag.origImgY + dy;
                    this._clampImage();
                } else if (this._drag.type === 'move-crop') {
                    this.cropX = this._drag.origCropX + dx;
                    this.cropY = this._drag.origCropY + dy;
                    this._clampCropBox();
                } else if (this._drag.type === 'resize') {
                    this._applyResize(this._drag.handle, dx, dy, this._drag.orig);
                    if (this.options.dragMode === 'image') this._clampImage();
                    else this._clampCropBox();
                }

                this._render();
                this._emitChange();
            });

            const endPointer = (e) => {
                pointers.delete(e.pointerId);
                if (pointers.size < 2) this._pinch = null;
                if (pointers.size === 0) this._drag = null;
                try { stage.releasePointerCapture(e.pointerId); } catch (_) { }
            };
            stage.addEventListener('pointerup', endPointer);
            stage.addEventListener('pointercancel', endPointer);
            stage.addEventListener('pointerleave', (e) => {
                if (e.pointerType !== 'mouse') return;
                if (!pointers.has(e.pointerId)) return;
                try {
                    if (stage.hasPointerCapture && stage.hasPointerCapture(e.pointerId)) return;
                } catch (_) { }
                endPointer(e);
            });

            stage.addEventListener('wheel', (e) => {
                if (!this._isOpen()) return;
                if (!this.options.wheelZoom) return;
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                const rect = stage.getBoundingClientRect();
                const cx = e.clientX - rect.left;
                const cy = e.clientY - rect.top;
                const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
                const factor = Math.pow(1.0018, -delta);
                this._zoomAround(cx, cy, factor);
                this._render();
                this._emitChange();
            }, { passive: false });

            stage.addEventListener('dblclick', (e) => {
                if (e.target.closest && e.target.closest('.aes-cropper-handle')) return;
                this._layout(false);
            });
        }

        _bindKeyboard() {
            const stage = this.stageEl;

            this._keyHandler = (e) => {
                if (!this._isOpen()) return;
                if (e.target.closest && e.target.closest('.aes-cropper-handle')) return;

                const step = e.shiftKey ? 10 : 1;
                let handled = true;

                switch (e.key) {
                    case 'ArrowLeft': this._nudge(-step, 0); break;
                    case 'ArrowRight': this._nudge(step, 0); break;
                    case 'ArrowUp': this._nudge(0, -step); break;
                    case 'ArrowDown': this._nudge(0, step); break;
                    case '+':
                    case '=':
                        this.setZoom(this._getZoomFactor() * 1.1);
                        break;
                    case '-':
                    case '_':
                        this.setZoom(this._getZoomFactor() / 1.1);
                        break;
                    case 'r':
                    case 'R':
                        this.rotate90();
                        break;
                    case 'g':
                    case 'G':
                        this.setGrid(!this._gridOn);
                        break;
                    default:
                        handled = false;
                }

                if (handled) {
                    e.preventDefault();
                    this._render();
                    this._emitChange();
                }
            };

            stage.addEventListener('keydown', this._keyHandler);
        }

        _nudge(dx, dy) {
            if (this.options.dragMode === 'crop') {
                this.cropX += dx;
                this.cropY += dy;
                this._clampCropBox();
            } else {
                this.imgX += dx;
                this.imgY += dy;
                this._clampImage();
            }
        }

        _computePinch() {
            const it = this._pointers.values();
            const a = it.next().value;
            const b = it.next().value;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            return {
                distance: Math.hypot(dx, dy),
                cx: (a.x + b.x) / 2,
                cy: (a.y + b.y) / 2,
            };
        }

        _layout(mode) {
            if (!this.naturalWidth || !this.stageEl) return;
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (!W || !H) {
                this._scheduleLayoutRetry(mode);
                return;
            }

            this._lastLayoutW = W;
            this._lastLayoutH = H;

            const preserve = (mode === true || mode === 'full') && this.cropW > 0 && this._canvasWidth > 0;
            const full = mode === 'full';

            let saved = null;
            if (preserve) saved = this._snapshotState();

            if (this.options.dragMode === 'crop') this._layoutCropMode(W, H);
            else this._layoutImageMode(W, H);

            if (saved) this._restoreStateInternal(saved, full, W, H);

            this._render();
            this._emitChange();
        }

        _scheduleLayoutRetry(mode) {
            if (this._layoutRetry) return;
            const token = this._openToken;
            const start = (typeof performance !== 'undefined' && performance.now)
                ? performance.now() : Date.now();
            const MAX_MS = 3000;

            const tick = () => {
                if (token !== this._openToken) { this._layoutRetry = false; return; }
                if (!this._isOpen() || !this.stageEl) { this._layoutRetry = false; return; }
                const W = this.stageEl.clientWidth;
                const H = this.stageEl.clientHeight;
                if (W > 0 && H > 0) {
                    this._layoutRetry = false;
                    this._layout(mode);
                    return;
                }
                const now = (typeof performance !== 'undefined' && performance.now)
                    ? performance.now() : Date.now();
                if (now - start > MAX_MS) { this._layoutRetry = false; return; }
                raf(tick);
            };
            this._layoutRetry = true;
            raf(tick);
        }

        _waitForStageSize(timeoutMs) {
            return new Promise((resolve) => {
                if (!this.stageEl) return resolve(false);
                const ok = () => this.stageEl.clientWidth > 0 && this.stageEl.clientHeight > 0;
                if (ok()) return resolve(true);

                const token = this._openToken;
                const start = (typeof performance !== 'undefined' && performance.now)
                    ? performance.now() : Date.now();
                const MAX_MS = timeoutMs || 3000;

                const tick = () => {
                    if (token !== this._openToken) return resolve(false);
                    if (!this._isOpen() || !this.stageEl) return resolve(false);
                    if (ok()) return resolve(true);
                    const now = (typeof performance !== 'undefined' && performance.now)
                        ? performance.now() : Date.now();
                    if (now - start > MAX_MS) return resolve(false);
                    raf(tick);
                };
                raf(tick);
            });
        }

        _restoreStateInternal(s, keepSize, W, H) {
            const base = this._baseScale();
            if (!base || !isFinite(base)) return;
            const targetScale = base * clamp(s.zoom, 1, this.options.maxZoom);
            this.imgScale = targetScale;
            const ds = this._displayScale || 1;
            const k = this.imgScale * ds;
            if (!isFinite(k) || k <= 0) return;

            if (keepSize) {
                this.cropW = s.nCrop.w * k;
                this.cropH = s.nCrop.h * k;
                this.cropX = (W - this.cropW) / 2;
                this.cropY = (H - this.cropH) / 2;
                this.imgX = this.cropX - s.nCrop.x * k;
                this.imgY = this.cropY - s.nCrop.y * k;
            } else {
                const cxN = s.nCrop.x + s.nCrop.w / 2;
                const cyN = s.nCrop.y + s.nCrop.h / 2;
                this.cropX = (W - this.cropW) / 2;
                this.cropY = (H - this.cropH) / 2;
                this.imgX = this.cropX + this.cropW / 2 - cxN * k;
                this.imgY = this.cropY + this.cropH / 2 - cyN * k;
            }

            if (this.options.dragMode === 'image') this._clampImage();
            else this._clampCropBox();
        }

        _layoutImageMode(W, H) {
            const pad = 0.08;
            const maxW = W * (1 - pad * 2);
            const maxH = H * (1 - pad * 2);

            let cw, ch;
            if (this.aspect) {
                if (maxW / maxH > this.aspect) { ch = maxH; cw = ch * this.aspect; }
                else { cw = maxW; ch = cw / this.aspect; }
            } else {
                cw = maxW; ch = maxH;
            }

            this.cropW = cw;
            this.cropH = ch;
            this.cropX = (W - cw) / 2;
            this.cropY = (H - ch) / 2;

            const iw = this._canvasWidth || this.naturalWidth;
            const ih = this._canvasHeight || this.naturalHeight;
            const coverScale = Math.max(cw / iw, ch / ih);
            this.imgScale = coverScale;

            const dW = iw * this.imgScale;
            const dH = ih * this.imgScale;
            this.imgX = this.cropX + (cw - dW) / 2;
            this.imgY = this.cropY + (ch - dH) / 2;
        }

        _layoutCropMode(W, H) {
            const pad = 0.06;
            const maxW = W * (1 - pad * 2);
            const maxH = H * (1 - pad * 2);

            const iw = this._canvasWidth || this.naturalWidth;
            const ih = this._canvasHeight || this.naturalHeight;

            const fitScale = Math.min(maxW / iw, maxH / ih);
            this.imgScale = fitScale;

            const dW = iw * this.imgScale;
            const dH = ih * this.imgScale;
            this.imgX = (W - dW) / 2;
            this.imgY = (H - dH) / 2;

            const factor = 0.85;
            let cw, ch;
            if (this.aspect) {
                if (dW / dH > this.aspect) { ch = dH * factor; cw = ch * this.aspect; }
                else { cw = dW * factor; ch = cw / this.aspect; }
            } else {
                cw = dW * factor; ch = dH * factor;
            }
            cw = Math.min(cw, dW);
            ch = Math.min(ch, dH);

            this.cropW = cw;
            this.cropH = ch;
            this.cropX = (W - cw) / 2;
            this.cropY = (H - ch) / 2;
        }

        _render() {
            if (!this.imageEl || !this.naturalWidth) return;

            this.imageEl.style.transform =
                'translate3d(' + this.imgX + 'px,' + this.imgY + 'px,0) scale(' + this.imgScale + ')';

            this.boxEl.style.width = this.cropW + 'px';
            this.boxEl.style.height = this.cropH + 'px';
            this.boxEl.style.transform = 'translate3d(' + this.cropX + 'px,' + this.cropY + 'px,0)';

            if (this.zoomInput) {
                const z = this._getZoomFactor();
                if (isFinite(z)) {
                    this.zoomInput.value = String(clamp(z, 1, this.options.maxZoom));
                }
            }
        }

        _baseScale() {
            if (!this.naturalWidth || !this.stageEl) return 1;
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (!W || !H) return 0;
            const iw = this._canvasWidth || this.naturalWidth;
            const ih = this._canvasHeight || this.naturalHeight;
            if (!iw || !ih) return 0;
            if (this.options.dragMode === 'crop') {
                const pad = 0.06;
                return Math.min(
                    (W * (1 - pad * 2)) / iw,
                    (H * (1 - pad * 2)) / ih
                );
            }
            return Math.max(this.cropW / iw, this.cropH / ih);
        }

        _clampImage() {
            const nw = this._canvasWidth || this.naturalWidth;
            const nh = this._canvasHeight || this.naturalHeight;
            if (!nw || !nh || !this.imgScale) return;

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

        _clampCropBox() {
            if (!this.stageEl) return;
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (!W || !H || !this.imgScale) return;

            const iw = (this._canvasWidth || this.naturalWidth) * this.imgScale;
            const ih = (this._canvasHeight || this.naturalHeight) * this.imgScale;

            const minX = Math.max(0, this.imgX);
            const minY = Math.max(0, this.imgY);
            const maxX = Math.min(W, this.imgX + iw) - this.cropW;
            const maxY = Math.min(H, this.imgY + ih) - this.cropH;

            if (maxX >= minX) this.cropX = clamp(this.cropX, minX, maxX);
            else this.cropX = minX;
            if (maxY >= minY) this.cropY = clamp(this.cropY, minY, maxY);
            else this.cropY = minY;
        }

        _ensureCropFitsImage() {
            if (!this.stageEl) return;
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (!W || !H || !this.imgScale) return;

            const iw = (this._canvasWidth || this.naturalWidth) * this.imgScale;
            const ih = (this._canvasHeight || this.naturalHeight) * this.imgScale;

            if (this.cropW > iw || this.cropH > ih) {
                const s = Math.min(iw / this.cropW, ih / this.cropH);
                this.cropW *= s;
                this.cropH *= s;
            }

            const minX = Math.max(0, this.imgX);
            const minY = Math.max(0, this.imgY);
            const maxX = Math.min(W, this.imgX + iw) - this.cropW;
            const maxY = Math.min(H, this.imgY + ih) - this.cropH;

            if (maxX >= minX) this.cropX = clamp(this.cropX, minX, maxX);
            else this.cropX = minX;
            if (maxY >= minY) this.cropY = clamp(this.cropY, minY, maxY);
            else this.cropY = minY;
        }

        _getZoomFactor() {
            if (!this.naturalWidth) return 1;
            const base = this._baseScale();
            if (!base || !isFinite(base)) return 1;
            const z = this.imgScale / base;
            return isFinite(z) && z > 0 ? z : 1;
        }

        _setZoomFactor(v, anchor) {
            if (!this.naturalWidth || !this.stageEl) return;

            const base = this._baseScale();
            if (!base || !isFinite(base)) return;

            let cx, cy;
            if (anchor && isFiniteNum(anchor.x)) {
                cx = anchor.x;
                cy = anchor.y;
            } else if (this.options.dragMode === 'crop') {
                cx = this.stageEl.clientWidth / 2;
                cy = this.stageEl.clientHeight / 2;
            } else {
                cx = this.cropX + this.cropW / 2;
                cy = this.cropY + this.cropH / 2;
            }

            const target = base * clamp(v, 1, this.options.maxZoom);
            if (this.imgScale > 0) this._zoomAround(cx, cy, target / this.imgScale);
            this._render();
        }

        _zoomAround(cx, cy, factor) {
            if (!this.naturalWidth || !isFinite(factor) || factor <= 0) return;

            const base = this._baseScale();
            if (!base || !isFinite(base)) return;
            const minScale = base;
            const maxScale = base * this.options.maxZoom;

            let newScale = this.imgScale * factor;
            newScale = clamp(newScale, minScale, maxScale);
            if (newScale === this.imgScale) return;

            const ix = (cx - this.imgX) / this.imgScale;
            const iy = (cy - this.imgY) / this.imgScale;
            this.imgScale = newScale;
            this.imgX = cx - ix * newScale;
            this.imgY = cy - iy * newScale;

            if (this.options.dragMode === 'image') {
                this._clampImage();
            } else if (this.options.clampCropOnZoom) {
                this._clampCropBox();
            }
        }

        _getResizeBounds() {
            const W = this.stageEl.clientWidth;
            const H = this.stageEl.clientHeight;
            if (this.options.dragMode === 'image') {
                return { left: 0, top: 0, right: W, bottom: H };
            }
            const iw = (this._canvasWidth || this.naturalWidth) * this.imgScale;
            const ih = (this._canvasHeight || this.naturalHeight) * this.imgScale;
            return {
                left: Math.max(0, this.imgX),
                top: Math.max(0, this.imgY),
                right: Math.min(W, this.imgX + iw),
                bottom: Math.min(H, this.imgY + ih),
            };
        }

        _applyResize(handle, dx, dy, orig) {
            const minS = this._effectiveMinCrop();
            const aspect = this.aspect;
            const b = this._getResizeBounds();

            const isW = handle.indexOf('w') !== -1;
            const isE = handle.indexOf('e') !== -1;
            const isN = handle.indexOf('n') !== -1;
            const isS = handle.indexOf('s') !== -1;
            const isCorner = (isW || isE) && (isN || isS);

            const minW = aspect ? Math.max(minS, minS * aspect) : minS;
            const minH = aspect ? Math.max(minS, minS / aspect) : minS;

            const anchorX = isW ? orig.x + orig.w : orig.x;
            const anchorY = isN ? orig.y + orig.h : orig.y;
            const centerX = orig.x + orig.w / 2;
            const centerY = orig.y + orig.h / 2;

            let newW, newH;

            if (isCorner) {
                const rawW = isE ? orig.w + dx : orig.w - dx;
                const rawH = isS ? orig.h + dy : orig.h - dy;

                if (aspect) {
                    const wChange = Math.abs(rawW - orig.w) / Math.max(1, orig.w);
                    const hChange = Math.abs(rawH - orig.h) / Math.max(1, orig.h);
                    const r = wChange >= hChange ? (rawW / Math.max(1, orig.w)) : (rawH / Math.max(1, orig.h));
                    newW = orig.w * r;
                    newH = orig.h * r;
                } else {
                    newW = rawW;
                    newH = rawH;
                }

                const maxW = isW ? (orig.x + orig.w - b.left) : (b.right - orig.x);
                const maxH = isN ? (orig.y + orig.h - b.top) : (b.bottom - orig.y);

                newW = clamp(newW, minW, Math.max(minW, maxW));
                newH = clamp(newH, minH, Math.max(minH, maxH));

                if (aspect) {
                    if (newW / aspect > newH) newW = newH * aspect;
                    else newH = newW / aspect;
                    newW = Math.min(newW, maxW);
                    newH = Math.min(newH, maxH);
                    newW = Math.max(newW, minW);
                    newH = Math.max(newH, minH);
                }
            } else if (isN || isS) {
                const rawH = isS ? orig.h + dy : orig.h - dy;
                newH = Math.max(rawH, minH);
                const maxH = isN ? (orig.y + orig.h - b.top) : (b.bottom - orig.y);
                newH = Math.min(newH, Math.max(minH, maxH));

                if (aspect) {
                    newW = newH * aspect;
                    const maxW = 2 * Math.min(centerX - b.left, b.right - centerX);
                    if (newW > maxW) { newW = maxW; newH = newW / aspect; }
                    if (newW < minW) { newW = minW; newH = newW / aspect; }
                    if (newH < minH) { newH = minH; newW = newH * aspect; }
                } else {
                    newW = orig.w;
                    const maxW = 2 * Math.min(centerX - b.left, b.right - centerX);
                    if (newW > maxW) newW = maxW;
                }
            } else {
                const rawW = isE ? orig.w + dx : orig.w - dx;
                newW = Math.max(rawW, minW);
                const maxW = isW ? (orig.x + orig.w - b.left) : (b.right - orig.x);
                newW = Math.min(newW, Math.max(minW, maxW));

                if (aspect) {
                    newH = newW / aspect;
                    const maxH = 2 * Math.min(centerY - b.top, b.bottom - centerY);
                    if (newH > maxH) { newH = maxH; newW = newH * aspect; }
                    if (newW < minW) { newW = minW; newH = newW / aspect; }
                    if (newH < minH) { newH = minH; newW = newH * aspect; }
                } else {
                    newH = orig.h;
                    const maxH = 2 * Math.min(centerY - b.top, b.bottom - centerY);
                    if (newH > maxH) newH = maxH;
                }
            }

            let x0, y0, x1, y1;

            if (isW) { x1 = anchorX; x0 = x1 - newW; }
            else if (isE) { x0 = anchorX; x1 = x0 + newW; }
            else { x0 = centerX - newW / 2; x1 = centerX + newW / 2; }

            if (isN) { y1 = anchorY; y0 = y1 - newH; }
            else if (isS) { y0 = anchorY; y1 = y0 + newH; }
            else { y0 = centerY - newH / 2; y1 = centerY + newH / 2; }

            if (x0 < b.left) { x1 += b.left - x0; x0 = b.left; }
            if (y0 < b.top) { y1 += b.top - y0; y0 = b.top; }
            if (x1 > b.right) { x0 -= x1 - b.right; x1 = b.right; }
            if (y1 > b.bottom) { y0 -= y1 - b.bottom; y1 = b.bottom; }

            const nw = x1 - x0;
            const nh = y1 - y0;
            if (nw < minW - 0.5 || nh < minH - 0.5) return;
            if (x0 < b.left - 0.5 || y0 < b.top - 0.5 || x1 > b.right + 0.5 || y1 > b.bottom + 0.5) return;

            this.cropX = x0;
            this.cropY = y0;
            this.cropW = nw;
            this.cropH = nh;
        }

        async _apply() {
            try {
                const result = await this._export();
                this._lastResult = result;
                this._renderPreview(result);
                if (typeof this.options.onComplete === 'function') this.options.onComplete(result);
                if (this.options.autoCloseOnApply) this.close();
                return result;
            } catch (err) {
                console.error('AESCropper:', err);
                if (typeof this.options.onError === 'function') this.options.onError(err);
                throw err;
            }
        }

        _cancel() {
            this.close();
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
        }

        _export() {
            if (!this._bitmap || !this.naturalWidth) {
                return Promise.reject(new Error('AESCropper: изображение не загружено'));
            }
            if (!isFiniteNum(this.imgScale) || this.imgScale <= 0) {
                return Promise.reject(new Error('AESCropper: размеры области ещё не рассчитаны (подождите, пока контейнер получит размеры)'));
            }

            const nc = this._stageCropToNatural();
            const sx = nc.x;
            const sy = nc.y;
            const sw = nc.w;
            const sh = nc.h;

            if (!(sw > 0) || !(sh > 0) || !isFinite(sw) || !isFinite(sh)) {
                return Promise.reject(new Error('AESCropper: некорректная область обрезки'));
            }

            let ow = this.options.targetWidth;
            let oh = this.options.targetHeight;

            if (ow && !oh) oh = Math.round(ow * (sh / sw));
            if (oh && !ow) ow = Math.round(oh * (sw / sh));
            if (!ow && !oh) { ow = Math.round(sw); oh = Math.round(sh); }

            return this._drawToResult(sx, sy, sw, sh, ow, oh);
        }

        _autoCropImage() {
            const nw = this.naturalWidth;
            const nh = this.naturalHeight;

            let tw = this.options.targetWidth;
            let th = this.options.targetHeight;
            const aspect = this.aspect;

            if (aspect) {
                if (tw && !th) th = Math.round(tw / aspect);
                if (th && !tw) tw = Math.round(th * aspect);
            }

            const targetAspect = (tw && th) ? (tw / th) : (aspect || (nw / nh));
            const srcAspect = nw / nh;

            let sx = 0, sy = 0, sw = nw, sh = nh;
            if (srcAspect > targetAspect) {
                sw = nh * targetAspect;
                sx = (nw - sw) / 2;
            } else if (srcAspect < targetAspect) {
                sh = nw / targetAspect;
                sy = (nh - sh) / 2;
            }

            let ow = Math.round(sw);
            let oh = Math.round(sh);

            if (tw && th) {
                if (sw >= tw && sh >= th) { ow = tw; oh = th; }
            }

            return this._drawToResult(sx, sy, sw, sh, ow, oh);
        }

        _drawToResult(sx, sy, sw, sh, ow, oh) {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(ow));
            canvas.height = Math.max(1, Math.round(oh));
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (this.options.mimeType === 'image/jpeg') {
                ctx.fillStyle = this.options.background || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const scaleX = canvas.width / sw;
            const scaleY = canvas.height / sh;

            ctx.save();
            ctx.translate(-sx * scaleX, -sy * scaleY);
            ctx.scale(scaleX, scaleY);
            drawRotated(ctx, this._bitmap, this._rotation);
            ctx.restore();

            const type = this.options.mimeType;
            const quality = this.options.quality;
            const wantDataURL = !!this.options.returnDataURL;

            let dataURL = null;
            if (wantDataURL) {
                try {
                    dataURL = canvas.toDataURL(type, quality);
                } catch (e) {
                    return Promise.reject(new Error(
                        'AESCropper: canvas загрязнён (cross-origin без CORS). ' +
                        'Используйте файл/Blob или настройте CORS на сервере. ' + e.message
                    ));
                }
            }

            return toBlob(canvas, type, quality).then((blob) => {
                if (!blob && !dataURL) {
                    throw new Error('AESCropper: не удалось создать изображение (Blob пуст)');
                }
                return {
                    blob,
                    dataURL,
                    width: canvas.width,
                    height: canvas.height,
                    canvas,
                    size: blob ? blob.size : 0,
                    type,
                    rotation: this._rotation,
                };
            }).catch((e) => {
                if (/tainted|SecurityError/i.test(String(e && e.message))) {
                    throw new Error(
                        'AESCropper: canvas загрязнён (cross-origin без CORS). ' +
                        'Используйте файл/Blob или настройте CORS на сервере.'
                    );
                }
                throw e;
            });
        }

        _renderPreview(result) {
            const target = this.options.preview;
            if (!target) return;
            const el = typeof target === 'string' ? document.querySelector(target) : target;
            if (!el) return;

            if (this._previewURL) {
                URL.revokeObjectURL(this._previewURL);
                this._previewURL = null;
            }

            const src = result.blob
                ? (this._previewURL = URL.createObjectURL(result.blob))
                : result.dataURL;

            if (!src) return;

            if (el.tagName === 'IMG') {
                el.src = src;
                return;
            }

            el.innerHTML = '';
            const img = document.createElement('img');
            img.alt = 'Обрезанное изображение';
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.borderRadius = 'inherit';
            img.src = src;
            el.appendChild(img);
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    AESCropper.version = VERSION;
    let _lastOpenInstance = null;

    AESCropper.autoCrop = function (file, options) {
        const c = new AESCropper(Object.assign({}, options || {}, { modal: false }));
        return c.autoCrop(file).finally(() => {
            try { c.destroy(); } catch (_) { }
        });
    };

    AESCropper.open = function (file, options) {
        if (_lastOpenInstance) {
            const prev = _lastOpenInstance;
            _lastOpenInstance = null;
            try {
                if (typeof prev.options.onCancel === 'function') prev.options.onCancel();
            } catch (_) { }
            try { prev.destroy(); } catch (_) { }
        }
        const c = new AESCropper(Object.assign({}, options || {}, { modal: true }));
        _lastOpenInstance = c;
        return c.open(file).catch((err) => {
            if (_lastOpenInstance === c) _lastOpenInstance = null;
            throw err;
        });
    };

    AESCropper._getLastInstance = function () { return _lastOpenInstance; };
    AESCropper._getOpenStack = function () { return _openStack.slice(); };

    return AESCropper;
});