(function () {
    'use strict';

    var PER_ROW = 5;

    function drawTitle() {
        var canvas = document.getElementById('title-canvas');
        if (!canvas) return;

        var text = canvas.getAttribute('data-text') || '';
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#ff6600');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#66ff66');
        ctx.font = 'bold 60px sans-serif';
        ctx.fillStyle = gradient;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 30;
        ctx.fillText(text, canvas.width / 2, 70);
    }

    function layout() {
        var gallery = document.getElementById('gallery');
        if (!gallery) return;

        var base = Math.min(window.innerWidth, window.innerHeight);
        var gap = Math.max(4, Math.round(base * 0.012));
        var size = Math.floor((base - gap * (PER_ROW + 1)) / PER_ROW);
        gallery.style.setProperty('--icon-size', size + 'px');
        gallery.style.setProperty('--icon-gap', gap + 'px');
    }

    drawTitle();
    layout();

    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', layout);
})();
