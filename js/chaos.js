(() => {
    "use strict";

    const canvas = document.querySelector("#chaos-canvas");
    const stage = document.querySelector("#experiment");
    const status = document.querySelector("#status");
    const context = canvas.getContext("2d", { alpha: false });
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const colors = [
        "oklch(84% 0.22 131)",
        "oklch(72% 0.25 28)",
        "oklch(80% 0.19 210)",
        "oklch(78% 0.22 326)",
        "oklch(91% 0.16 97)"
    ];

    const background = "oklch(15% 0.045 273)";
    const armColor = "oklch(96% 0.015 105 / 0.55)";
    const pivotColor = "oklch(96% 0.015 105)";
    const startingDifference = 0.0008;
    const gravity = 1;
    const massOne = 10;
    const massTwo = 10;
    const fixedStep = 1 / 120;
    const maxTrailLength = 1500;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let armOne = 170;
    let armTwo = 170;
    let origin = { x: 0, y: 0 };
    let pendulums = [];
    let frameId = 0;
    let previousTime = 0;
    let accumulator = 0;
    let paused = false;

    class DoublePendulum {
        constructor(angleOne, angleTwo, color) {
            this.angleOne = angleOne;
            this.angleTwo = angleTwo;
            this.velocityOne = 0;
            this.velocityTwo = 0;
            this.color = color;
            this.trail = [];
        }

        update(deltaTime) {
            const angleDifference = this.angleOne - this.angleTwo;
            const sharedMass = 2 * massOne + massTwo;
            const denominatorOne =
                armOne *
                (sharedMass -
                    massTwo * Math.cos(2 * this.angleOne - 2 * this.angleTwo));
            const denominatorTwo =
                armTwo *
                (sharedMass -
                    massTwo * Math.cos(2 * this.angleOne - 2 * this.angleTwo));

            const accelerationOne =
                (-gravity * sharedMass * Math.sin(this.angleOne) -
                    massTwo *
                        gravity *
                        Math.sin(this.angleOne - 2 * this.angleTwo) -
                    2 *
                        Math.sin(angleDifference) *
                        massTwo *
                        (this.velocityTwo ** 2 * armTwo +
                            this.velocityOne ** 2 *
                                armOne *
                                Math.cos(angleDifference))) /
                denominatorOne;

            const accelerationTwo =
                (2 *
                    Math.sin(angleDifference) *
                    (this.velocityOne ** 2 *
                        armOne *
                        (massOne + massTwo) +
                        gravity *
                            (massOne + massTwo) *
                            Math.cos(this.angleOne) +
                        this.velocityTwo ** 2 *
                            armTwo *
                            massTwo *
                            Math.cos(angleDifference))) /
                denominatorTwo;

            this.velocityOne += accelerationOne * deltaTime * 60;
            this.velocityTwo += accelerationTwo * deltaTime * 60;
            this.angleOne += this.velocityOne * deltaTime * 60;
            this.angleTwo += this.velocityTwo * deltaTime * 60;

            const points = this.points();
            this.trail.push(points.end);

            if (this.trail.length > maxTrailLength) {
                this.trail.shift();
            }
        }

        points() {
            const middle = {
                x: origin.x + armOne * Math.sin(this.angleOne),
                y: origin.y + armOne * Math.cos(this.angleOne)
            };
            const end = {
                x: middle.x + armTwo * Math.sin(this.angleTwo),
                y: middle.y + armTwo * Math.cos(this.angleTwo)
            };

            return { middle, end };
        }
    }

    function resize() {
        const bounds = stage.getBoundingClientRect();
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.round(bounds.width);
        height = Math.round(bounds.height);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const shortestSide = Math.min(width, height);
        armOne = Math.max(70, Math.min(190, shortestSide * 0.24));
        armTwo = armOne * 0.92;
        origin = {
            x: width > 700 ? width * 0.72 : width * 0.66,
            y: height > 620 ? height * 0.26 : height * 0.22
        };

        draw();
    }

    function reset(angleOne = Math.PI * 0.68, angleTwo = Math.PI * 0.92) {
        pendulums = colors.map(
            (color, index) =>
                new DoublePendulum(
                    angleOne + index * startingDifference,
                    angleTwo - index * startingDifference,
                    color
                )
        );
        accumulator = 0;
        previousTime = 0;

        if (reducedMotion.matches) {
            renderStaticStudy();
            status.textContent = "Static chaos study";
        } else {
            paused = false;
            status.textContent = "System running";
            draw();
        }
    }

    function clearCanvas() {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
    }

    function drawTrail(pendulum, index) {
        if (pendulum.trail.length < 2) {
            return;
        }

        const start = Math.max(1, pendulum.trail.length - 950);
        context.lineWidth = index === 0 ? 1.8 : 1.15;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.globalAlpha = index === 0 ? 0.8 : 0.55;
        context.strokeStyle = pendulum.color;
        context.beginPath();
        context.moveTo(
            pendulum.trail[start - 1].x,
            pendulum.trail[start - 1].y
        );

        for (
            let pointIndex = start;
            pointIndex < pendulum.trail.length;
            pointIndex++
        ) {
            const to = pendulum.trail[pointIndex];
            context.lineTo(to.x, to.y);
        }

        context.stroke();
        context.globalAlpha = 1;
    }

    function drawPrimaryPendulum() {
        const primary = pendulums[0];

        if (!primary) {
            return;
        }

        const { middle, end } = primary.points();
        context.lineWidth = 1;
        context.strokeStyle = armColor;
        context.beginPath();
        context.moveTo(origin.x, origin.y);
        context.lineTo(middle.x, middle.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        context.fillStyle = pivotColor;
        context.beginPath();
        context.arc(origin.x, origin.y, 2.4, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = primary.color;
        context.beginPath();
        context.arc(middle.x, middle.y, 3.6, 0, Math.PI * 2);
        context.arc(end.x, end.y, 4.8, 0, Math.PI * 2);
        context.fill();
    }

    function draw() {
        clearCanvas();
        pendulums.forEach(drawTrail);
        drawPrimaryPendulum();
    }

    function renderStaticStudy() {
        for (let step = 0; step < 1100; step++) {
            pendulums.forEach((pendulum) => pendulum.update(fixedStep));
        }
        draw();
    }

    function animate(time) {
        if (!previousTime) {
            previousTime = time;
        }

        const frameTime = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;

        if (!paused && !reducedMotion.matches) {
            accumulator += frameTime;

            while (accumulator >= fixedStep) {
                pendulums.forEach((pendulum) =>
                    pendulum.update(fixedStep)
                );
                accumulator -= fixedStep;
            }

            draw();
        }

        frameId = window.requestAnimationFrame(animate);
    }

    function disturb(event) {
        if (event.target.closest("a")) {
            return;
        }

        const bounds = stage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        const angleOne = Math.PI * (0.25 + x * 1.25);
        const angleTwo = Math.PI * (0.35 + y * 1.3);

        reset(angleOne, angleTwo);
        stage.focus({ preventScroll: true });
    }

    function handleKeydown(event) {
        if (event.key.toLowerCase() === "r") {
            reset();
        }

        if (event.code === "Space" && !reducedMotion.matches) {
            event.preventDefault();
            paused = !paused;
            status.textContent = paused ? "System paused" : "System running";
        }
    }

    function handleMotionPreference() {
        reset();
    }

    window.addEventListener("resize", resize);
    stage.addEventListener("pointerdown", disturb);
    stage.addEventListener("keydown", handleKeydown);
    reducedMotion.addEventListener("change", handleMotionPreference);

    resize();
    reset();
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(animate);
})();
