var easterEgg1 = {
    // Boring variables
    internal: {
        particles: [],
        animationTimer: null,
        previousTime: null,
        lastParticleTime: null,
        particlesWaiting: 0,
        preloadedImages: []
    },

    // Interesting variables
    options: {
        magicSearchTerms: ["rebel", "rebellious rose", "karlie", "karlie kloss"],
        imageUrl: "easteregg1/lipglosstranslucent-50.png",
        imageCount: 100,
        imagesPerSecond: 10,
        imageSizeMin: 176,
        imageSizeMax: 176,
        gravity: 9.807,
        wind: 0,
        spinMin: -90,
        spinMax: 90,
        animationFramesPerSecond: 40
    },

    // Initialize the easter egg
    init: function() {
        easterEgg1.startWatchingForSearchTerm();

        // Pre-load the image
        easterEgg1.internal.preloadedImages[easterEgg1.options.imageUrl] = $('<img />').attr('src', easterEgg1.options.imageUrl);
        easterEgg1.internal.preloadedImages[easterEgg1.options.imageUrl].appendTo('body').css({
            position: 'absolute',
            left: "15000px"
        });
    },

    // Begin monitoring the search input box and watching for the magic text
    startWatchingForSearchTerm: function(event) {
        var searchInput = $("#search");
        searchInput.on("input", function() {
            var searchText = (searchInput.val() || "").toLowerCase();
            if (easterEgg1.options.magicSearchTerms.includes(searchText)) {
                console.log("Trigger easter egg for search="+ searchText);
                easterEgg1.trigger();
            } else {
                easterEgg1.stop();
            }
        });
    },

    // Trigger the effect
    trigger: function() {
        // First animation frame
        if (easterEgg1.internal.animationTimer == null) {
            easterEgg1.internal.particlesWaiting = easterEgg1.options.imageCount;
            window.requestAnimationFrame(easterEgg1.animate);
        }
    },

    // Stop the effect
    stop: function() {
        if (easterEgg1.internal.animationTimer) {
            clearTimeout(easterEgg1.internal.animationTimer);
            easterEgg1.internal.animationTimer = null;
            easterEgg1.internal.previousTime = null;

            for(var i = easterEgg1.internal.particles.length - 1 ; i >= 0 ; i--) {
                var particle = easterEgg1.internal.particles[i];
                particle.element.remove();
            }
            easterEgg1.internal.particles = [];
        }
    },

    // Move along the animation
    animate: function(time) {

        // Measure the window so we can tell when the particles go below the bottom
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();

        // How much time has passed since the previous animation frame?
        if (easterEgg1.internal.previousTime == null) {
            easterEgg1.internal.previousTime = time - ((1 / easterEgg1.options.imagesPerSecond) * 2000);
            easterEgg1.internal.lastParticleTime = easterEgg1.internal.previousTime;
        }
        var elapsedSeconds = (time - easterEgg1.internal.previousTime) / 1000;   // Convert from milliseconds

        // Add particles
        var particlesToAdd = Math.round(((time - easterEgg1.internal.lastParticleTime) / 1000) * easterEgg1.options.imagesPerSecond);
        particlesToAdd = Math.min(particlesToAdd, easterEgg1.internal.particlesWaiting);
        if (particlesToAdd > 0) {
            if (easterEgg1.internal.preloadedImages[easterEgg1.options.imageUrl] == null) {
                easterEgg1.internal.preloadedImages[easterEgg1.options.imageUrl] = $('<img />').attr('src', easterEgg1.options.imageUrl);
            }
            easterEgg1.internal.particlesWaiting = Math.max(0, easterEgg1.internal.particlesWaiting - particlesToAdd);
            easterEgg1.internal.lastParticleTime = time;
            for (var i = 0 ; i < particlesToAdd ; i++) {
                // Generate a random position, rotation, and size
                var size = easterEgg1.options.imageSizeMin + (Math.random() * (easterEgg1.options.imageSizeMax - easterEgg1.options.imageSizeMin));
                var minX = easterEgg1.options.wind > 0 ? (0 - easterEgg1.options.wind * 20) : 0;
                var maxX = easterEgg1.options.wind < 0 ? (windowWidth + easterEgg1.options.wind * 20) : windowWidth;
                var newParticle = {
                    x: minX + (Math.random() * (maxX - minX)),
                    y: easterEgg1.options.gravity >= 0 ? -size : windowHeight + size,
                    size: size,
                    rotation: Math.random() * 360,
                    velocityY: 0,
                    spin: easterEgg1.options.spinMin + (Math.random() * (easterEgg1.options.spinMax - easterEgg1.options.spinMin))
                };

                // Create a visible element
                newParticle.element = easterEgg1.internal.preloadedImages[easterEgg1.options.imageUrl].clone();
                $("body").append(newParticle.element);
                easterEgg1.internal.particles.push(newParticle);
            }
        }

        // Move particles
        for (var i = 0 ; i < easterEgg1.internal.particles.length ; i++) {
             // Calculate a new position and rotation
            var particle = easterEgg1.internal.particles[i];
            particle.x += easterEgg1.options.wind * 10 * elapsedSeconds;
            particle.velocityY += easterEgg1.options.gravity * elapsedSeconds;
            particle.y += particle.velocityY;
            particle.rotation += particle.spin * elapsedSeconds;

            // Update the visible image
            particle.element.attr("style", "display:block !important; position:fixed; width:auto; z-index:100000; left:" + particle.x + "px;top:" + particle.y + "px;transform:translate(-50%,-50%) rotate(" + particle.rotation + "deg);height:" + particle.size + "px;backface-visibility:hidden;");
        }

        // Remove particles that go off the bottom
        for(var i = easterEgg1.internal.particles.length - 1 ; i >= 0 ; i--) {
            var particle = easterEgg1.internal.particles[i];
            var isBelowTheBottom = easterEgg1.options.gravity >= 0 ? (particle.y - particle.size) > windowHeight : (particle.y + particle.size) < 0;
            if (isBelowTheBottom) {
                particle.element.remove();
                easterEgg1.internal.particles.splice(i, 1);
            }
        }

        // We are done when there are no particles left
        var stillAnimating = easterEgg1.internal.particles.length > 0;
        if (stillAnimating && easterEgg1.options.animationFramesPerSecond > 0) {
            // Schedule the next animation frame
            easterEgg1.internal.previousTime = time;
            easterEgg1.internal.animationTimer = setTimeout(function() {
                window.requestAnimationFrame(easterEgg1.animate);
            }, Math.max(1, 1000 / easterEgg1.options.animationFramesPerSecond));
        } else {
            // Done, don't waste time animating
            easterEgg1.internal.previousTime = null;
            easterEgg1.internal.animationTimer = null;
        }
    }
};


// Start initializing the easter egg when jQuery is ready
$(function(){
    easterEgg1.init();
});
