/**
 * aes-loader.js - универсальная библиотека для красивых загрузчиков
 * 
 * (c) AES Foundation, 2023-2026
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
 * @module AESLoader
 * @version 2.0.1
 * 
 * @description 
 *   Библиотека предоставляет набор стильных анимированных загрузчиков с поддержкой
 *   различных визуальных тем (Cyber, Glitch, Terminal, Minimal, Logic3D).
 *   Поддерживает автоматический показ при загрузке страницы, ручное управление,
 *   отображение финального состояния (успех/ошибка) с анимацией.
 * 
 * @example
 * // Базовое использование (автоматический режим)
 * // Достаточно подключить скрипт — загрузчик появится сам и исчезнет после загрузки страницы.
 * 
 * @example
 * // Ручной вызов
 * const loader = new AESLoader({
 *   defaultStyle: 'glitch',
 *   defaultTitle: 'Подождите',
 *   defaultText: 'Идёт загрузка данных...'
 * });
 * const instance = loader.showLoader('cyber', 'Загрузка', 'Пожалуйста, подождите...');
 * // Через некоторое время
 * instance.success('Готово!');
 * // или instance.fail('Ошибка', 'Не удалось загрузить данные');
 * 
 * @example
 * // Использование с промисом
 * const loader = new AESLoader();
 * const { promise } = loader.showLoader();
 * promise.then(() => console.log('Загрузка завершена'));
 * 
 * @example
 * // Встраивание в конкретный контейнер
 * const loader = new AESLoader({ mode: 'window' });
 * const inst = loader.showLoader('terminal', 'Выполняется', 'Обработка...', null, '#my-container');
 */

(function (global) {
    'use strict';

    // ========================================================================
    // Конфигурация по умолчанию
    // ========================================================================
    const DEFAULT_CONFIG = {
        mode: 'default',          // 'default' — на весь экран, 'window' — в указанные контейнеры
        containers: [],           // массив селекторов или элементов для режима 'window'
        defaultStyle: 'cyber',    // стиль по умолчанию: cyber, glitch, terminal, minimal, logic3d
        defaultTitle: 'Загрузка',
        defaultText: 'Пожалуйста, подождите...',
        defaultFinalText: 'Готово',
        autoStart: true,          // автоматически показать загрузчик при загрузке страницы
        zIndex: 998,              // z-index оверлея
        showFinal: true,          // показывать финальный экран (успех/ошибка) перед закрытием
    };

    // ========================================================================
    // Основной класс AESLoader
    // ========================================================================

    /**
     * Создаёт экземпляр менеджера загрузчиков.
     * @param {Object} [config] - конфигурация
     * @param {string} [config.mode='default'] - режим: 'default' (весь экран) или 'window' (контейнеры)
     * @param {Array<string|Element>} [config.containers=[]] - список контейнеров для режима 'window'
     * @param {string} [config.defaultStyle='cyber'] - стиль по умолчанию
     * @param {string} [config.defaultTitle='Загрузка'] - заголовок по умолчанию
     * @param {string} [config.defaultText='Пожалуйста, подождите...'] - текст по умолчанию
     * @param {string} [config.defaultFinalText='Готово'] - финальный текст при успехе
     * @param {boolean} [config.autoStart=true] - автоматический показ при загрузке
     * @param {number} [config.zIndex=9999] - z-index оверлея
     * @param {boolean} [config.showFinal=true] - показывать финальную анимацию
     * @returns {AESLoader} Экземпляр загрузчика
     */
    class AESLoader {
        constructor(config = {}) {
            this.config = Object.assign({}, DEFAULT_CONFIG, config);
            this.loaders = new Map();          // хранилище активных загрузчиков
            this.counter = 0;                  // счётчик для уникальных ID
            this._injectStyles();              // внедрить CSS
            if (this.config.autoStart) this._autoStart();
        }

        // --------------------------------------------------------------------
        // Внутренние методы
        // --------------------------------------------------------------------

        /**
         * Внедряет все стили в документ.
         * @private
         */
        _injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                /* === Общие контейнеры === */
                .aes-loader-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: ${this.config.zIndex};
                    backdrop-filter: blur(4px);
                    pointer-events: auto;
                    animation: aesFadeIn 0.3s ease;
                }
                .aes-loader-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: ${this.config.zIndex};
                    animation: aesFadeIn 0.3s ease;
                }
                @keyframes aesFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .aes-loader-wrapper {
                    transition: opacity 0.6s ease;
                }
                .aes-loader-wrapper.fade-out {
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                .aes-loader-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.4s ease;
                }
                .aes-loader-content.fade-out {
                    opacity: 0;
                }
                .aes-loader-content.fade-in {
                    opacity: 1;
                }

                /* === Cyber === */
                .cyber-loader {
                    text-align: center;
                    color: #fff;
                    position: relative;
                }
                .cyber-ring {
                    display: inline-block;
                    width: 80px;
                    height: 80px;
                    border: 4px solid transparent;
                    border-radius: 50%;
                    border-top: 4px solid #ff4141;
                    border-right: 4px solid #ff4141;
                    animation: cyberSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    margin: 0 5px;
                    transition: all 0.8s ease;
                }
                .cyber-ring:nth-child(2) {
                    width: 60px;
                    height: 60px;
                    border-top-color: #00f2ff;
                    border-right-color: #00f2ff;
                    animation-duration: 1.5s;
                    margin-top: 10px;
                }
                .cyber-ring:nth-child(3) {
                    width: 40px;
                    height: 40px;
                    border-top-color: #ff761b;
                    border-right-color: #ff761b;
                    animation-duration: 1.8s;
                    margin-top: 20px;
                }
                @keyframes cyberSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .cyber-text {
                    margin-top: 30px;
                    transition: opacity 0.4s ease;
                }
                .cyber-title {
                    font-size: 24px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    text-shadow: 0 0 10px #ff4141;
                }
                .cyber-sub {
                    font-size: 14px;
                    color: #aaa;
                    margin-top: 8px;
                    letter-spacing: 2px;
                }
                .cyber-final .cyber-ring {
                    animation: cyberMerge 0.8s ease forwards;
                }
                .cyber-final .cyber-ring:nth-child(1) { animation-delay: 0s; }
                .cyber-final .cyber-ring:nth-child(2) { animation-delay: 0.2s; }
                .cyber-final .cyber-ring:nth-child(3) { animation-delay: 0.4s; }
                @keyframes cyberMerge {
                    0% { transform: scale(1) rotate(0deg); opacity: 1; }
                    100% { transform: scale(1.5) rotate(360deg); opacity: 0; }
                }
                .cyber-final .cyber-text {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .cyber-final-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60px;
                    height: 60px;
                    opacity: 0;
                    animation: cyberIconAppear 0.6s ease 0.8s forwards;
                }
                .cyber-final-icon svg {
                    width: 100%;
                    height: 100%;
                    stroke: #fff;
                    stroke-width: 4;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .cyber-final-icon .check {
                    stroke-dasharray: 50;
                    stroke-dashoffset: 50;
                    animation: drawCheck 0.6s ease 1s forwards;
                }
                .cyber-final-icon .cross {
                    stroke-dasharray: 40;
                    stroke-dashoffset: 40;
                    animation: drawCross 0.6s ease 1s forwards;
                }
                @keyframes cyberIconAppear {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                .cyber-final-text {
                    margin-top: 80px;
                    opacity: 0;
                    animation: fadeInUp 0.5s ease 1.2s forwards;
                }
                .cyber-final-text .cyber-title {
                    color: #fff;
                    text-shadow: 0 0 20px rgba(255,255,255,0.3);
                }
                .cyber-final-text .cyber-sub {
                    color: #ccc;
                }
                @keyframes drawCheck {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes drawCross {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* === Glitch === */
                .glitch-loader {
                    text-align: center;
                    color: #fff;
                }
                .glitch-box {
                    display: inline-block;
                    padding: 20px 40px;
                    border: 2px solid #ff4141;
                    background: rgba(0, 0, 0, 0.7);
                    box-shadow: 0 0 30px rgba(255, 65, 65, 0.3);
                    position: relative;
                    transition: all 0.4s ease;
                }
                .glitch-text {
                    font-size: 32px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 6px;
                    position: relative;
                    display: inline-block;
                    color: #fff;
                }
                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                }
                .glitch-text::before {
                    color: #ff4141;
                    z-index: -1;
                    animation: glitch1 1.2s infinite linear alternate-reverse;
                }
                .glitch-text::after {
                    color: #00f2ff;
                    z-index: -2;
                    animation: glitch2 1.2s infinite linear alternate-reverse;
                }
                @keyframes glitch1 {
                    0% { clip: rect(10px, 999px, 40px, 0); transform: translate(-3px, -3px); }
                    20% { clip: rect(60px, 999px, 80px, 0); transform: translate(3px, 3px); }
                    40% { clip: rect(20px, 999px, 50px, 0); transform: translate(-5px, 0); }
                    60% { clip: rect(80px, 999px, 100px, 0); transform: translate(5px, -2px); }
                    80% { clip: rect(30px, 999px, 70px, 0); transform: translate(-2px, 5px); }
                    100% { clip: rect(50px, 999px, 90px, 0); transform: translate(0, 0); }
                }
                @keyframes glitch2 {
                    0% { clip: rect(30px, 999px, 60px, 0); transform: translate(4px, 2px); }
                    20% { clip: rect(70px, 999px, 90px, 0); transform: translate(-4px, -2px); }
                    40% { clip: rect(10px, 999px, 30px, 0); transform: translate(6px, 0); }
                    60% { clip: rect(50px, 999px, 70px, 0); transform: translate(-6px, 3px); }
                    80% { clip: rect(20px, 999px, 50px, 0); transform: translate(3px, -4px); }
                    100% { clip: rect(40px, 999px, 80px, 0); transform: translate(0, 0); }
                }
                .glitch-sub {
                    font-size: 14px;
                    color: #aaa;
                    margin-top: 15px;
                    letter-spacing: 3px;
                }
                .glitch-bar {
                    width: 100%;
                    height: 2px;
                    background: #ff4141;
                    margin-top: 15px;
                    animation: glitchBar 1.5s infinite;
                }
                @keyframes glitchBar {
                    0%, 100% { transform: scaleX(1); opacity: 1; }
                    50% { transform: scaleX(0.3); opacity: 0.5; }
                }
                .glitch-final .glitch-box {
                    animation: glitchCloud 0.8s ease;
                }
                @keyframes glitchCloud {
                    0% { transform: scale(1) skew(0deg); opacity: 1; }
                    10% { transform: scale(1.1) skew(5deg); opacity: 0.8; }
                    30% { transform: scale(0.95) skew(-8deg); opacity: 0.5; }
                    50% { transform: scale(1.05) skew(3deg); opacity: 0.7; }
                    70% { transform: scale(0.98) skew(-2deg); opacity: 0.9; }
                    100% { transform: scale(1) skew(0deg); opacity: 1; }
                }
                .glitch-final .glitch-text {
                    opacity: 0;
                    animation: none;
                }
                .glitch-final .glitch-text::before,
                .glitch-final .glitch-text::after {
                    animation: none;
                }
                .glitch-final .glitch-sub {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .glitch-final-icon {
                    display: inline-block;
                    width: 60px;
                    height: 60px;
                    margin: 10px auto 5px;
                    opacity: 0;
                    animation: glitchIconAppear 0.6s ease 0.4s forwards;
                }
                .glitch-final-icon svg {
                    width: 100%;
                    height: 100%;
                    stroke: #fff;
                    stroke-width: 4;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .glitch-final-icon .check {
                    stroke-dasharray: 50;
                    stroke-dashoffset: 50;
                    animation: drawCheck 0.6s ease 0.6s forwards;
                }
                .glitch-final-icon .cross {
                    stroke-dasharray: 40;
                    stroke-dashoffset: 40;
                    animation: drawCross 0.6s ease 0.6s forwards;
                }
                @keyframes glitchIconAppear {
                    0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .glitch-final-text {
                    margin-top: 5px;
                    opacity: 0;
                    animation: fadeInUp 0.5s ease 0.8s forwards;
                }
                .glitch-final-text .glitch-text {
                    opacity: 1;
                    animation: glitchTextFinal 0.5s ease;
                }
                .glitch-final-text .glitch-text::before,
                .glitch-final-text .glitch-text::after {
                    animation: glitch1 0.3s infinite linear alternate-reverse, glitch2 0.3s infinite linear alternate-reverse;
                }
                .glitch-final-text .glitch-sub {
                    opacity: 1 !important;
                    animation: fadeInUp 0.5s ease 1s forwards;
                    color: #ccc;
                }
                @keyframes glitchTextFinal {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* === Terminal === */
                .terminal-loader {
                    text-align: left;
                    color: #33ff00;
                    font-family: 'Courier New', monospace;
                }
                .terminal-window {
                    background: rgba(0, 0, 0, 0.85);
                    border: 1px solid #33ff00;
                    border-radius: 8px;
                    padding: 20px;
                    min-width: 400px;
                    box-shadow: 0 0 30px rgba(51, 255, 0, 0.15);
                }
                .terminal-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #33ff00;
                    margin-bottom: 15px;
                }
                .terminal-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .terminal-dot.red { background: #ff4444; }
                .terminal-dot.yellow { background: #ffbb33; }
                .terminal-dot.green { background: #33ff00; }
                .terminal-title {
                    color: #33ff00;
                    font-size: 14px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    margin-left: 10px;
                    text-transform: uppercase;
                }
                .terminal-body {
                    font-size: 16px;
                    line-height: 1.8;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }
                .terminal-main-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    white-space: nowrap;
                }
                .terminal-line {
                    display: inline-block;
                    overflow: hidden;
                    border-right: 2px solid #33ff00;
                    animation: terminalTyping 2s steps(40, end), terminalBlink 0.8s step-end infinite;
                    flex-shrink: 0;
                }
                .terminal-line:not(:last-child) {
                    margin-right: 10px;
                }
                @keyframes terminalTyping {
                    from { width: 0; }
                    to { width: 100%; }
                }
                @keyframes terminalBlink {
                    from, to { border-color: transparent; }
                    50% { border-color: #33ff00; }
                }
                .terminal-final .terminal-line {
                    animation: terminalTyping 1s steps(40, end), terminalBlink 0.8s step-end infinite;
                }
                .terminal-final-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    margin-left: 12px;
                    opacity: 0;
                    animation: terminalIconAppear 0.4s ease 1.2s forwards;
                }
                .terminal-final-icon svg {
                    width: 100%;
                    height: 100%;
                    stroke: #fff;
                    stroke-width: 3;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .terminal-final-icon .check {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: drawCheck 0.4s ease 1.4s forwards;
                }
                .terminal-final-icon .cross {
                    stroke-dasharray: 20;
                    stroke-dashoffset: 20;
                    animation: drawCross 0.4s ease 1.4s forwards;
                }
                @keyframes terminalIconAppear {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                .terminal-final-text {
                    width: 100%;
                    margin-top: 10px;
                    opacity: 0;
                    animation: fadeInUp 0.5s ease 1.6s forwards;
                }
                .terminal-final-text .terminal-line {
                    border-right-color: #33ff00;
                }
                .terminal-final-text .terminal-line:last-child {
                    border-right: none;
                }

                /* === Minimal === */
                .minimal-loader {
                    text-align: center;
                    color: #fff;
                }
                .minimal-spinner {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top: 4px solid #fff;
                    border-radius: 50%;
                    animation: minimalSpin 1s linear infinite;
                    transition: all 0.4s ease;
                }
                @keyframes minimalSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .minimal-text {
                    margin-top: 20px;
                    transition: opacity 0.4s ease;
                }
                .minimal-title {
                    font-size: 20px;
                    font-weight: 300;
                    letter-spacing: 2px;
                }
                .minimal-sub {
                    font-size: 13px;
                    color: #888;
                    margin-top: 6px;
                }
                .minimal-final .minimal-spinner {
                    animation: none;
                    border-color: #fff;
                    border-top-color: #fff;
                    background: #ffffffb4;
                    transform: scale(1.2);
                    opacity: 0;
                }
                .minimal-final .minimal-text {
                    opacity: 0;
                }
                .minimal-final-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 90px;
                    height: 90px;
                    background: #ffffffb4;
                    border-radius: 50%;
                    box-shadow: 0 0 40px rgba(255,255,255,0.4);
                    opacity: 0;
                    animation: minimalIconAppear 0.6s ease 0.4s forwards;
                    margin: 0 auto;
                }
                .minimal-final-icon svg {
                    width: 56px;
                    height: 56px;
                    stroke: #000;
                    stroke-width: 5;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .minimal-final-icon .check {
                    stroke-dasharray: 50;
                    stroke-dashoffset: 50;
                    animation: drawCheck 0.6s ease 0.6s forwards;
                }
                .minimal-final-icon .cross {
                    stroke-dasharray: 40;
                    stroke-dashoffset: 40;
                    animation: drawCross 0.6s ease 0.6s forwards;
                }
                @keyframes minimalIconAppear {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                .minimal-final-text {
                    margin-top: 20px;
                    opacity: 0;
                    animation: fadeInUp 0.5s ease 0.8s forwards;
                }
                .minimal-final-text .minimal-title {
                    color: #fff;
                }
                .minimal-final-text .minimal-sub {
                    color: #ccc;
                }

                /* === Logic3D === */
                .logic3d-loader {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #0a0b0d;
                    overflow: hidden;
                }
                .logic3d-grid {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background-image: 
                        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    transform: perspective(500px) rotateX(60deg);
                    animation: logic3dGridMove 20s linear infinite;
                    z-index: 0;
                    pointer-events: none;
                }
                @keyframes logic3dGridMove {
                    from { transform: perspective(500px) rotateX(60deg) translateY(0); }
                    to { transform: perspective(500px) rotateX(60deg) translateY(50px); }
                }
                .logic3d-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 4px, 3px 100%;
                    z-index: 1;
                    pointer-events: none;
                }
                .logic3d-panel {
                    position: relative;
                    z-index: 2;
                    width: 90%;
                    max-width: 700px;
                    padding: 40px;
                    border-left: 4px solid #ff4d00;
                    background: rgba(20, 22, 26, 0.8);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 30px rgba(0,0,0,0.5);
                    clip-path: polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%);
                    text-align: left;
                }
                .logic3d-status {
                    display: inline-block;
                    background: #ff4d00;
                    color: #000;
                    padding: 2px 8px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }
                .logic3d-title {
                    font-size: 80px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1;
                    margin-bottom: 10px;
                    position: relative;
                    display: inline-block;
                    letter-spacing: 2px;
                }
                .logic3d-title::before,
                .logic3d-title::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.8;
                }
                .logic3d-title::before {
                    color: #00f2ff;
                    z-index: -1;
                    animation: logic3dGlitch1 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
                }
                .logic3d-title::after {
                    color: #ff4d00;
                    z-index: -2;
                    animation: logic3dGlitch2 0.3s cubic-bezier(.25, .46, .45, .94) reverse both infinite;
                }
                @keyframes logic3dGlitch1 {
                    0% { transform: translate(0); }
                    20% { transform: translate(-3px, 3px); }
                    40% { transform: translate(-3px, -3px); }
                    60% { transform: translate(3px, 3px); }
                    80% { transform: translate(3px, -3px); }
                    100% { transform: translate(0); }
                }
                @keyframes logic3dGlitch2 {
                    0% { transform: translate(0); }
                    20% { transform: translate(3px, -3px); }
                    40% { transform: translate(3px, 3px); }
                    60% { transform: translate(-3px, -3px); }
                    80% { transform: translate(-3px, 3px); }
                    100% { transform: translate(0); }
                }
                .logic3d-message {
                    font-family: 'Courier New', monospace;
                    color: #a0a5ad;
                    margin: 20px 0 30px;
                    font-size: 16px;
                }
                .logic3d-typewriter {
                    overflow: hidden;
                    border-right: .15em solid #ff4d00;
                    white-space: nowrap;
                    letter-spacing: .15em;
                    animation: logic3dTyping 3.5s steps(40, end), logic3dBlink .75s step-end infinite;
                    display: inline-block;
                    margin: 0;
                }
                @keyframes logic3dTyping {
                    from { width: 0; }
                    to { width: 100%; }
                }
                @keyframes logic3dBlink {
                    from, to { border-color: transparent; }
                    50% { border-color: #ff4d00; }
                }
                .logic3d-loader-bar {
                    width: 100%;
                    height: 3px;
                    background: rgba(255,255,255,0.1);
                    margin-top: 15px;
                    position: relative;
                    overflow: hidden;
                    transition: opacity 0.4s ease;
                }
                .logic3d-loader-bar::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: #ff4d00;
                    animation: logic3dBar 2s ease-in-out infinite;
                }
                @keyframes logic3dBar {
                    0% { left: -100%; }
                    50% { left: 0%; }
                    100% { left: 100%; }
                }
                .logic3d-log {
                    margin-top: 20px;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    color: rgba(255,255,255,0.3);
                    text-align: right;
                    line-height: 1.6;
                    pointer-events: none;
                    white-space: pre-line;
                }
                .logic3d-log .line {
                    opacity: 0;
                    animation: logic3dLogFade 0.5s forwards;
                }
                .logic3d-log .line:nth-child(1) { animation-delay: 0.2s; }
                .logic3d-log .line:nth-child(2) { animation-delay: 0.8s; }
                .logic3d-log .line:nth-child(3) { animation-delay: 1.4s; }
                .logic3d-log .line:nth-child(4) { animation-delay: 2.0s; }
                .logic3d-log .line:nth-child(5) { animation-delay: 2.6s; }
                @keyframes logic3dLogFade {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .logic3d-final .logic3d-loader-bar {
                    opacity: 0;
                }
                .logic3d-final .logic3d-message {
                    opacity: 0;
                }
                .logic3d-final .logic3d-log {
                    opacity: 0;
                }
                .logic3d-final-content {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    width: 100%;
                    min-height: 100px;
                }
                .logic3d-final-box {
                    flex-shrink: 0;
                    width: 100px;
                    height: 100px;
                    background: #ff4d00;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 40px rgba(255, 77, 0, 0.3);
                    opacity: 0;
                    animation: logic3dBoxAppear 0.6s ease 0.4s forwards;
                }
                @keyframes logic3dBoxAppear {
                    from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .logic3d-final-box svg {
                    width: 70px;
                    height: 70px;
                    stroke: #fff;
                    stroke-width: 4;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .logic3d-final-box .check {
                    stroke-dasharray: 50;
                    stroke-dashoffset: 50;
                    animation: drawCheck 0.6s ease 0.8s forwards;
                }
                .logic3d-final-box .cross {
                    stroke-dasharray: 40;
                    stroke-dashoffset: 40;
                    animation: drawCross 0.6s ease 0.8s forwards;
                }
                .logic3d-final-text {
                    flex: 1;
                    opacity: 0;
                    animation: fadeInUp 0.5s ease 1s forwards;
                }
                .logic3d-final-text .logic3d-title {
                    font-size: 40px;
                    color: #fff;
                    text-shadow: none;
                }
                .logic3d-final-text .logic3d-title::before,
                .logic3d-final-text .logic3d-title::after {
                    display: none;
                }
                .logic3d-final-text .logic3d-message {
                    opacity: 1;
                    color: #ccc;
                    font-size: 14px;
                    margin: 5px 0 0;
                }
                .logic3d-final-text.error .logic3d-title {
                    color: #ff4141;
                }
                .logic3d-final-text.error .logic3d-message {
                    color: #ffaaaa;
                }

                @media (max-width: 600px) {
                    .logic3d-title { font-size: 60px; }
                    .logic3d-panel { padding: 25px; }
                    .logic3d-message { font-size: 14px; }
                    .terminal-window { min-width: auto; width: 90%; }
                    .glitch-box { padding: 15px 20px; }
                    .glitch-text { font-size: 24px; }
                    .cyber-ring { width: 60px; height: 60px; }
                    .cyber-ring:nth-child(2) { width: 45px; height: 45px; }
                    .cyber-ring:nth-child(3) { width: 30px; height: 30px; }
                    .cyber-final-icon { width: 40px; height: 40px; }
                    .cyber-final-text { margin-top: 60px; }
                    .logic3d-final-content { flex-direction: column; text-align: center; gap: 15px; }
                    .logic3d-final-box { width: 80px; height: 80px; }
                    .logic3d-final-box svg { width: 50px; height: 50px; }
                    .logic3d-final-text .logic3d-title { font-size: 28px; }
                    .minimal-final-icon { width: 70px; height: 70px; }
                    .minimal-final-icon svg { width: 44px; height: 44px; }
                    .terminal-final-icon { width: 28px; height: 28px; }
                }
                @media (max-width: 400px) {
                    .logic3d-title { font-size: 44px; }
                    .logic3d-panel { padding: 15px; }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Автоматический запуск загрузчика при загрузке страницы.
         * @private
         */
        _autoStart() {
            const start = () => {
                const loader = this.showLoader(
                    this.config.defaultStyle,
                    this.config.defaultTitle,
                    this.config.defaultText,
                    null,
                    null,
                    this.config.defaultFinalText,
                    this.config.showFinal
                );
                const hideOnLoad = () => {
                    loader.success();
                    window.removeEventListener('load', hideOnLoad);
                    document.removeEventListener('DOMContentLoaded', hideOnLoad);
                };
                if (document.readyState === 'complete') {
                    hideOnLoad();
                } else {
                    window.addEventListener('load', hideOnLoad);
                    document.addEventListener('DOMContentLoaded', hideOnLoad);
                }
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', start);
            } else {
                start();
            }
        }

        /**
         * Возвращает массив DOM-элементов-контейнеров для отображения загрузчика.
         * @param {string|Element|null} element - селектор или элемент (опционально)
         * @returns {Element[]} массив контейнеров
         * @private
         */
        _getContainers(element) {
            let containers = [];
            if (element) {
                const el = typeof element === 'string' ? document.querySelector(element) : element;
                if (el) containers = [el];
            } else if (this.config.mode === 'default') {
                containers = [document.body || document.documentElement];
            } else if (this.config.mode === 'window') {
                if (this.config.containers.length > 0) {
                    this.config.containers.forEach(sel => {
                        const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
                        if (el) containers.push(el);
                    });
                }
                if (containers.length === 0) {
                    containers = [document.body || document.documentElement];
                }
            }
            return containers;
        }

        // ====================================================================
        // Публичные методы
        // ====================================================================

        /**
         * Показывает загрузчик.
         * @param {string} [style] - стиль (cyber, glitch, terminal, minimal, logic3d)
         * @param {string} [title] - заголовок
         * @param {string} [text] - подзаголовок / описание
         * @param {number|null} [period] - таймаут в мс, по истечении которого загрузчик автоматически завершится ошибкой
         * @param {string|Element|null} [element] - контейнер (селектор или DOM-элемент)
         * @param {string} [finalText] - финальный текст при успехе
         * @param {boolean} [showFinal] - показывать ли финальный экран
         * @returns {Object} Объект управления загрузчиком:
         *   - id: {string} уникальный идентификатор
         *   - hide: {function} принудительно скрыть
         *   - success: {function(finalText)} завершить успехом
         *   - fail: {function(errorTitle, errorText)} завершить ошибкой
         *   - promise: {Promise} промис, который резолвится при успехе или реджектится при ошибке
         *   - then/catch: методы промиса для удобства
         */
        showLoader(style = this.config.defaultStyle, title = this.config.defaultTitle, text = this.config.defaultText, period = null, element = null, finalText = this.config.defaultFinalText, showFinal = this.config.showFinal) {
            const id = `aes-loader-${++this.counter}`;
            const containers = this._getContainers(element);

            if (containers.length === 0) {
                containers = [document.body || document.documentElement];
            }

            const elements = [];
            containers.forEach(container => {
                const wrapper = document.createElement('div');
                const isBody = container === document.body || container === document.documentElement;
                wrapper.className = `aes-loader-wrapper aes-loader-${style}`;
                if (isBody) {
                    wrapper.classList.add('aes-loader-overlay');
                } else {
                    wrapper.classList.add('aes-loader-container');
                    const pos = window.getComputedStyle(container).position;
                    if (pos === 'static') {
                        container.style.position = 'relative';
                    }
                }
                wrapper.dataset.style = style;

                const content = document.createElement('div');
                content.className = 'aes-loader-content';
                content.innerHTML = this._buildContent(style, title, text);
                wrapper.appendChild(content);
                container.appendChild(wrapper);
                elements.push(wrapper);
            });

            const loaderObj = {
                id,
                elements,
                containers,
                timer: null,
                resolve: null,
                reject: null,
                hidden: false,
                finalShown: false,
                style,
                title,
                text,
                finalText,
                showFinal,
            };

            const promise = new Promise((resolve, reject) => {
                loaderObj.resolve = resolve;
                loaderObj.reject = reject;
            });

            if (period !== null && period > 0) {
                loaderObj.timer = setTimeout(() => {
                    if (!loaderObj.hidden) {
                        this.fail(id, 'Таймаут', `Превышено время ожидания (${period} мс)`);
                    }
                }, period);
            }

            this.loaders.set(id, loaderObj);

            return {
                id,
                hide: () => this.hideLoader(id),
                success: (finalTextOverride) => this.success(id, finalTextOverride),
                fail: (errorTitle, errorText) => this.fail(id, errorTitle, errorText),
                promise,
                then: promise.then.bind(promise),
                catch: promise.catch.bind(promise),
            };
        }

        /**
         * Завершает загрузчик успешным результатом.
         * @param {string} id - идентификатор загрузчика
         * @param {string} [finalText] - переопределяющий финальный текст
         */
        success(id, finalText) {
            const loader = this.loaders.get(id);
            if (!loader || loader.hidden) return;
            if (loader.timer) {
                clearTimeout(loader.timer);
                loader.timer = null;
            }
            this._completeLoader(id, 'success', { finalText: finalText || loader.finalText || 'Готово' });
        }

        /**
         * Завершает загрузчик ошибкой.
         * @param {string} id - идентификатор загрузчика
         * @param {string} [errorTitle] - заголовок ошибки
         * @param {string} [errorText] - описание ошибки
         */
        fail(id, errorTitle, errorText) {
            const loader = this.loaders.get(id);
            if (!loader || loader.hidden) return;
            if (loader.timer) {
                clearTimeout(loader.timer);
                loader.timer = null;
            }
            this._completeLoader(id, 'error', { errorTitle: errorTitle || 'Ошибка', errorText: errorText || 'Произошла ошибка' });
        }

        /**
         * Принудительно скрывает загрузчик без финальной анимации.
         * @param {string} id - идентификатор загрузчика
         */
        hideLoader(id) {
            const loader = this.loaders.get(id);
            if (!loader || loader.hidden) return;
            if (loader.timer) {
                clearTimeout(loader.timer);
                loader.timer = null;
            }
            this._completeLoader(id, 'force');
        }

        // ====================================================================
        // Внутренние вспомогательные методы завершения
        // ====================================================================

        /**
         * Завершает загрузчик (общая логика).
         * @param {string} id
         * @param {string} type - 'success', 'error' или 'force'
         * @param {Object} data - данные для финального экрана
         * @private
         */
        _completeLoader(id, type, data = {}) {
            const loader = this.loaders.get(id);
            if (!loader || loader.hidden) return;
            loader.hidden = true;

            const showFinal = loader.showFinal && type !== 'force';

            if (showFinal) {
                this._showFinal(loader, type, data);
                setTimeout(() => {
                    this._fadeOutAndRemove(loader);
                }, 2500);
            } else {
                this._fadeOutAndRemove(loader);
            }

            if (type === 'success' || type === 'force') {
                if (loader.resolve) loader.resolve();
            } else {
                const err = new Error(data.errorText || 'Loading failed');
                err.title = data.errorTitle || 'Ошибка';
                if (loader.reject) loader.reject(err);
            }
        }

        /**
         * Отображает финальное состояние (успех/ошибка).
         * @private
         */
        _showFinal(loader, type, data) {
            if (loader.finalShown) return;
            loader.finalShown = true;

            const isSuccess = type === 'success';
            const style = loader.style;

            loader.elements.forEach(wrapper => {
                const content = wrapper.querySelector('.aes-loader-content');
                if (!content) return;

                const finalHtml = this._buildFinalContent(style, isSuccess, data);
                content.innerHTML = finalHtml;
                content.classList.add('fade-in');
                content.classList.remove('fade-out');
            });
        }

        /**
         * Строит HTML для финального экрана.
         * @private
         */
        _buildFinalContent(style, isSuccess, data) {
            const esc = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };

            const title = isSuccess ? (data.finalText || 'Готово') : (data.errorTitle || 'Ошибка');
            const sub = isSuccess ? '' : (data.errorText || '');

            const svgCheck = `
                <svg viewBox="0 0 50 50">
                    <path class="check" d="M 10 25 L 22 37 L 42 13" stroke="currentColor" stroke-width="4" fill="none"/>
                </svg>
            `;
            const svgCross = `
                <svg viewBox="0 0 50 50">
                    <line class="cross" x1="10" y1="10" x2="40" y2="40" stroke="currentColor" stroke-width="4"/>
                    <line class="cross" x1="40" y1="10" x2="10" y2="40" stroke="currentColor" stroke-width="4"/>
                </svg>
            `;
            const svgIcon = isSuccess ? svgCheck : svgCross;

            let html = '';

            switch (style) {
                case 'cyber':
                    html = `
                        <div class="cyber-loader cyber-final">
                            <div class="cyber-ring"></div>
                            <div class="cyber-ring"></div>
                            <div class="cyber-ring"></div>
                            <div class="cyber-final-icon">${svgIcon}</div>
                            <div class="cyber-final-text">
                                <div class="cyber-title">${esc(title)}</div>
                                ${sub ? `<div class="cyber-sub">${esc(sub)}</div>` : ''}
                            </div>
                        </div>
                    `;
                    break;
                case 'glitch':
                    html = `
                        <div class="glitch-loader glitch-final">
                            <div class="glitch-box">
                                <div class="glitch-final-icon">${svgIcon}</div>
                                <div class="glitch-final-text">
                                    <div class="glitch-text" data-text="${esc(title)}">${esc(title)}</div>
                                    ${sub ? `<div class="glitch-sub">${esc(sub)}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'terminal':
                    html = `
                        <div class="terminal-loader terminal-final">
                            <div class="terminal-window">
                                <div class="terminal-header">
                                    <span class="terminal-dot red"></span>
                                    <span class="terminal-dot yellow"></span>
                                    <span class="terminal-dot green"></span>
                                    <span class="terminal-title">${isSuccess ? 'SUCCESS' : 'ERROR'}</span>
                                </div>
                                <div class="terminal-body">
                                    <div class="terminal-main-line">
                                        <span class="terminal-line">${esc(title)}</span>
                                        <span class="terminal-final-icon">${svgIcon}</span>
                                    </div>
                                    ${sub ? `<div class="terminal-final-text"><span class="terminal-line">${esc(sub)}</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'minimal':
                    html = `
                        <div class="minimal-loader minimal-final">
                            <div class="minimal-final-icon">${svgIcon}</div>
                            <div class="minimal-final-text">
                                <div class="minimal-title">${esc(title)}</div>
                                ${sub ? `<div class="minimal-sub">${esc(sub)}</div>` : ''}
                            </div>
                        </div>
                    `;
                    break;
                case 'logic3d':
                    html = `
                        <div class="logic3d-loader logic3d-final">
                            <div class="logic3d-grid"></div>
                            <div class="logic3d-overlay"></div>
                            <div class="logic3d-panel">
                                <div class="logic3d-status">${isSuccess ? 'SUCCESS' : 'ERROR'}</div>
                                <div class="logic3d-final-content">
                                    <div class="logic3d-final-box">${svgIcon}</div>
                                    <div class="logic3d-final-text ${isSuccess ? '' : 'error'}">
                                        <div class="logic3d-title">${esc(title)}</div>
                                        ${sub ? `<div class="logic3d-message">${esc(sub)}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    html = `<div>${esc(title)}</div>`;
            }

            return html;
        }

        /**
         * Плавно скрывает и удаляет загрузчик из DOM.
         * @private
         */
        _fadeOutAndRemove(loader) {
            loader.elements.forEach(wrapper => {
                wrapper.classList.add('fade-out');
            });
            setTimeout(() => {
                loader.elements.forEach(wrapper => {
                    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
                });
                this.loaders.delete(loader.id);
            }, 700);
        }

        /**
         * Строит HTML для начального состояния загрузчика.
         * @private
         */
        _buildContent(style, title, text) {
            const esc = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };
            const safeTitle = esc(title);
            const safeText = esc(text);

            switch (style) {
                case 'cyber':
                    return `
                        <div class="cyber-loader">
                            <div class="cyber-ring"></div>
                            <div class="cyber-ring"></div>
                            <div class="cyber-ring"></div>
                            <div class="cyber-text">
                                <div class="cyber-title">${safeTitle}</div>
                                <div class="cyber-sub">${safeText}</div>
                            </div>
                        </div>
                    `;
                case 'glitch':
                    return `
                        <div class="glitch-loader">
                            <div class="glitch-box">
                                <div class="glitch-text" data-text="${safeTitle}">${safeTitle}</div>
                                <div class="glitch-sub">${safeText}</div>
                                <div class="glitch-bar"></div>
                            </div>
                        </div>
                    `;
                case 'terminal':
                    return `
                        <div class="terminal-loader">
                            <div class="terminal-window">
                                <div class="terminal-header">
                                    <span class="terminal-dot red"></span>
                                    <span class="terminal-dot yellow"></span>
                                    <span class="terminal-dot green"></span>
                                    <span class="terminal-title">${safeTitle}</span>
                                </div>
                                <div class="terminal-body">
                                    <div class="terminal-main-line">
                                        <span class="terminal-line">${safeText}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                case 'minimal':
                    return `
                        <div class="minimal-loader">
                            <div class="minimal-spinner"></div>
                            <div class="minimal-text">
                                <div class="minimal-title">${safeTitle}</div>
                                <div class="minimal-sub">${safeText}</div>
                            </div>
                        </div>
                    `;
                case 'logic3d':
                    const logLines = [
                        'SYS_LOG: FETCHING DATA...',
                        'UID: 829-PX-00',
                        'LOC: UNKNOWN_SECTOR',
                        'DECRYPTING PACKET...',
                        'STATUS: STANDBY'
                    ];
                    const logHtml = logLines.map(line => `<div class="line">${esc(line)}</div>`).join('');
                    return `
                        <div class="logic3d-loader">
                            <div class="logic3d-grid"></div>
                            <div class="logic3d-overlay"></div>
                            <div class="logic3d-panel">
                                <div class="logic3d-status">Status: Loading</div>
                                <div class="logic3d-title" data-text="${safeTitle}">${safeTitle}</div>
                                <div class="logic3d-message">
                                    <span class="logic3d-typewriter">${safeText}</span>
                                </div>
                                <div class="logic3d-loader-bar"></div>
                                <div class="logic3d-log">${logHtml}</div>
                            </div>
                        </div>
                    `;
                default:
                    return this._buildContent('cyber', title, text);
            }
        }
    }

    // ========================================================================
    // Глобальная инициализация
    // ========================================================================

    global.AESLoader = AESLoader;

    let instance = null;
    const initFromConfig = (config) => {
        if (!global.__aesLoaderInstance) {
            global.__aesLoaderInstance = new AESLoader(config);
        }
        return global.__aesLoaderInstance;
    };

    if (global.AESLoaderConfig) {
        instance = initFromConfig(global.AESLoaderConfig);
    } else {
        const scripts = document.getElementsByTagName('script');
        let currentScript = scripts[scripts.length - 1];
        if (currentScript) {
            const mode = currentScript.getAttribute('data-mode') || 'default';
            const containersAttr = currentScript.getAttribute('data-containers');
            const containers = containersAttr ? containersAttr.split(',').map(s => s.trim()) : [];
            const defaultStyle = currentScript.getAttribute('data-default-style') || 'cyber';
            const autoStart = currentScript.getAttribute('data-auto-start') !== 'false';
            const showFinal = currentScript.getAttribute('data-show-final') !== 'false';
            const config = { mode, containers, defaultStyle, autoStart, showFinal };
            instance = initFromConfig(config);
        } else {
            instance = global.__aesLoaderInstance || new AESLoader();
        }
    }

    if (!global.AESLoaderInstance) {
        global.AESLoaderInstance = instance;
    } else {
        global.__aesLoaderInstance = global.__aesLoaderInstance || instance;
    }

})(window);
