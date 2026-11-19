// Standalone version of the Vice City theme preview game.
{
    const obstacles = [
        {kind: 'cone', width: 16, height: 18},
        {kind: 'barrels', width: 30, height: 28},
        {kind: 'barricade', width: 47, height: 21},
        {kind: 'spike-strip', width: 63, height: 10},
        {kind: 'air-crate', width: 34, height: 27},
        {kind: 'armor', width: 70, height: 25},
    ];
    const streets = [
        [0, 1, 2, 3],
        [4, 0, 2, 3, 4, 1],
        [5, 3, 4, 1, 5, 2],
    ];
    const pursuit = [
        {heat: 0, roadSpeed: 240, closingSpeed: 3.5, shotInterval: 6.0, obstacleGap: 120},
        {heat: 12, roadSpeed: 263, closingSpeed: 4.3, shotInterval: 5.3, obstacleGap: 100},
        {heat: 26, roadSpeed: 286, closingSpeed: 5.2, shotInterval: 4.6, obstacleGap: 82},
        {heat: 43, roadSpeed: 309, closingSpeed: 6.4, shotInterval: 4.0, obstacleGap: 64},
        {heat: 62, roadSpeed: 333, closingSpeed: 7.8, shotInterval: 3.4, obstacleGap: 50},
        {heat: 86, roadSpeed: 357, closingSpeed: 9.5, shotInterval: 2.8, obstacleGap: 36},
    ];
    const maxWanted = pursuit.length;
    const supplies = [
        {kind: 'star', symbol: '★'},
        {kind: 'shield', symbol: '⛨'},
        {kind: 'pulse', symbol: 'ϟ'},
    ];
    const carWidth = 54;
    const captureGap = 57;
    const maxGap = 150;

    function mountDriveControl() {
        const panel = document.querySelector('.vice-demo');
        const workspace = panel.querySelector('.vice-drive-workspace');

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'vice-drive-toggle';
        toggle.textContent = 'Play';
        toggle.setAttribute('aria-pressed', 'false');

        const game = document.createElement('div');
        game.className = 'vice-drive-game';
        game.hidden = true;

        const hud = document.createElement('span');
        hud.className = 'vice-drive-score';
        const stars = document.createElement('span');
        stars.className = 'vice-drive-stars';
        stars.setAttribute('role', 'img');
        const status = document.createElement('span');
        const heatMeter = document.createElement('progress');
        heatMeter.className = 'vice-drive-heat';
        heatMeter.setAttribute('aria-label', 'Heat toward the next wanted star');
        hud.append(stars, status, heatMeter);

        const announcement = document.createElement('span');
        announcement.className = 'sr-only vice-drive-announcement';
        announcement.setAttribute('role', 'status');

        const hazard = document.createElement('span');
        hazard.className = 'vice-drive-hazard';
        hazard.setAttribute('aria-hidden', 'true');
        const patrol = document.createElement('span');
        patrol.className = 'vice-drive-patrol';
        patrol.setAttribute('aria-hidden', 'true');
        const reinforcement = document.createElement('span');
        reinforcement.className = 'vice-drive-patrol vice-drive-reinforcement';
        reinforcement.setAttribute('aria-hidden', 'true');
        const helicopter = document.createElement('span');
        helicopter.className = 'vice-drive-helicopter';
        helicopter.setAttribute('aria-hidden', 'true');
        const result = document.createElement('span');
        result.className = 'vice-drive-result';
        result.setAttribute('aria-hidden', 'true');
        const resultTitle = document.createElement('strong');
        resultTitle.textContent = 'WASTED';
        result.append(resultTitle);
        const supply = document.createElement('span');
        supply.className = 'vice-drive-supply';
        supply.setAttribute('aria-hidden', 'true');

        const policeShot = document.createElement('span');
        policeShot.className = 'vice-drive-shot vice-drive-shot-police';
        policeShot.setAttribute('aria-hidden', 'true');
        const playerShot = document.createElement('span');
        playerShot.className = 'vice-drive-shot vice-drive-shot-player';
        playerShot.setAttribute('aria-hidden', 'true');
        game.append(helicopter, reinforcement, patrol, hazard, supply, policeShot, playerShot, hud, result);
        workspace.append(game, announcement, toggle);

        const held = new Set();
        let frame = 0;
        let lastTime = 0;
        let driving = false;
        let crashed = false;
        let carX = 0;
        let height = 0;
        let velocity = 0;
        let hazardX = 0;
        let hazardIndex = 0;
        let street = streets[0];
        let streetIndex = 1;
        let hazardHit = false;
        let hazardPassed = false;
        let passed = 0;
        let wanted = 1;
        let heat = 0;
        let gap = maxGap;
        let supplyIndex = 0;
        let supplyX = 0;
        let shield = false;
        let charges = 2;
        let policeShotX = null;
        let playerShotX = null;
        let shotDelay = 0;

        function setHazard(index, x) {
            hazardIndex = index;
            hazardX = x;
            hazardHit = hazardPassed = false;
            const {kind, width, height} = obstacles[index];
            hazard.dataset.kind = kind;
            hazard.style.width = width + 'px';
            hazard.style.height = height + 'px';
        }

        function spawnHazard() {
            const nextStreet = wanted === maxWanted ? streets[2] : wanted >= 4 ? streets[1] : streets[0];
            if (street !== nextStreet) {
                street = nextStreet;
                streetIndex = 0;
            }
            const spawnX = Math.max(game.clientWidth, 800) + pursuit[wanted - 1].obstacleGap + Math.random() * 55;
            setHazard(street[streetIndex % street.length], spawnX);
            streetIndex++;
            setSupply((supplyIndex + 1) % supplies.length, hazardX - 165);
        }

        function setSupply(index, x) {
            supplyIndex = index;
            supplyX = x;
            supply.dataset.kind = supplies[index].kind;
            supply.textContent = supplies[index].symbol;
        }

        function addHeat(amount) {
            heat += amount;
            const next = pursuit[wanted];
            if (next && heat >= next.heat) {
                wanted++;
                announcement.textContent = 'Wanted level ' + wanted + ' of ' + maxWanted + '.';
            }
        }

        function updateHud() {
            const score = String(passed).padStart(2, '0');
            stars.textContent = '★'.repeat(wanted) + '☆'.repeat(maxWanted - wanted);
            stars.setAttribute('aria-label', 'Wanted level ' + wanted + ' of ' + maxWanted);
            reinforcement.hidden = wanted < 2;
            helicopter.hidden = wanted < 4;
            const next = pursuit[wanted];
            heatMeter.hidden = !next;
            if (next) {
                const previousThreshold = pursuit[wanted - 1].heat;
                heatMeter.max = next.heat - previousThreshold;
                heatMeter.value = heat - previousThreshold;
            }
            status.textContent = ' · ' + score + ' · Shield ' + Number(shield) + ' · Pulse ' + charges;
        }

        function renderShot(element, x) {
            element.hidden = x === null;
            if (x !== null) element.style.transform = 'translateX(' + x + 'px)';
        }

        function render() {
            workspace.style.setProperty('--vice-car-x', carX + 'px');
            workspace.style.setProperty('--vice-car-y', height + 'px');
            hazard.style.transform = 'translateX(' + hazardX + 'px)';
            patrol.style.transform = 'translateX(' + (carX - gap) + 'px)';
            reinforcement.style.transform = 'translateX(' + (carX - gap - 61) + 'px)';
            game.classList.toggle('vice-drive-danger', gap < 86);
            patrol.classList.toggle('vice-drive-aiming', policeShotX === null && shotDelay < 0.36);
            supply.hidden = supplyX === null;
            if (supplyX !== null) supply.style.transform = 'translateX(' + supplyX + 'px)';
            renderShot(policeShot, policeShotX);
            renderShot(playerShot, playerShotX);
        }

        function hitPlayer(penalty, reason) {
            if (shield) {
                shield = false;
                announcement.textContent = 'Shield absorbed the hit.';
                updateHud();
            } else {
                gap -= penalty;
                announcement.textContent = reason;
            }
        }

        function overlapsPlayer(x, width) {
            return x < carX + carWidth - 8 && x + width > carX + 8;
        }

        function advanceSupply(distance) {
            if (supplyX === null) return;
            supplyX -= distance;
            if (overlapsPlayer(supplyX, 22) && height < 19) {
                const {kind} = supplies[supplyIndex];
                announcement.textContent = 'Collected ' + kind + '.';
                if (kind === 'star') addHeat(4);
                else if (kind === 'shield') shield = true;
                else charges = Math.min(9, charges + 3);
                supplyX = null;
                updateHud();
            } else if (supplyX < -22) supplyX = null;
        }

        function advanceShots(dt) {
            if (policeShotX === null) {
                shotDelay -= dt;
                if (shotDelay <= 0) {
                    policeShotX = carX - gap + carWidth;
                    shotDelay = pursuit[wanted - 1].shotInterval;
                }
            } else {
                policeShotX += (365 + wanted * 12) * dt;
                if (overlapsPlayer(policeShotX, 12) && height < 12) {
                    policeShotX = null;
                    hitPlayer(32, 'Patrol hit. It is gaining on you.');
                } else if (policeShotX > game.clientWidth) policeShotX = null;
            }

            if (playerShotX === null) return;
            playerShotX -= 480 * dt;
            if (playerShotX <= carX - gap + carWidth) {
                playerShotX = null;
                gap = Math.min(maxGap, gap + 43);
                announcement.textContent = 'Pulse hit. Patrol pushed back.';
            }
        }

        function tick(time) {
            if (!driving || !workspace.isConnected) return;
            const dt = Math.min((time - (lastTime || time)) / 1000, 0.04);
            lastTime = time;
            const direction = Number(held.has('ArrowRight')) - Number(held.has('ArrowLeft'));
            carX = Math.max(0, Math.min(game.clientWidth - carWidth, carX + direction * dt * 240));
            height = Math.max(0, height + velocity * dt);
            velocity = height > 0 || velocity > 0 ? velocity - 820 * dt : 0;
            const stage = pursuit[wanted - 1];
            const distance = stage.roadSpeed * dt;
            hazardX -= distance;
            gap -= stage.closingSpeed * dt;
            advanceSupply(distance);
            advanceShots(dt);

            const obstacle = obstacles[hazardIndex];
            if (!hazardHit && overlapsPlayer(hazardX, obstacle.width) && height < obstacle.height - 3) {
                hazardHit = true;
                hitPlayer(51, 'Obstacle hit. Patrol closing in.');
            }

            if (!hazardPassed && hazardX + obstacle.width <= carX + 8) {
                hazardPassed = true;
                if (!hazardHit) {
                    passed++;
                    addHeat(3);
                    gap = Math.min(maxGap, gap + 27);
                    updateHud();
                }
            }

            if (gap <= captureGap) {
                gap = captureGap;
                crashed = true;
                toggle.textContent = 'Retry';
                workspace.classList.add('vice-drive-finished');
                announcement.textContent = 'Wasted. Score ' + passed + '. Press Space or select Retry.';
                render();
                return;
            }

            if (hazardX < -obstacle.width) spawnHazard();

            render();
            frame = requestAnimationFrame(tick);
        }

        function start() {
            held.clear();
            driving = true;
            crashed = false;
            toggle.textContent = 'Stop';
            toggle.setAttribute('aria-pressed', 'true');
            workspace.classList.remove('vice-drive-finished');
            workspace.classList.add('vice-drive-active');
            game.hidden = false;
            carX = Math.max(85, game.clientWidth * 0.24);
            height = velocity = passed = lastTime = 0;
            wanted = 1;
            heat = 0;
            gap = maxGap;
            shield = false;
            charges = 2;
            policeShotX = playerShotX = null;
            shotDelay = pursuit[0].shotInterval;
            announcement.textContent = 'Chase started. Space to jump, X to fire, arrow keys to steer.';
            street = streets[0];
            streetIndex = 1;
            setHazard(street[0], game.clientWidth + 18);
            setSupply(0, hazardX - 165);
            updateHud();
            render();
            frame = requestAnimationFrame(tick);
        }

        function stop() {
            cancelAnimationFrame(frame);
            held.clear();
            driving = false;
            crashed = false;
            game.hidden = true;
            announcement.textContent = '';
            workspace.classList.remove('vice-drive-active', 'vice-drive-finished');
            toggle.textContent = 'Play';
            toggle.setAttribute('aria-pressed', 'false');
        }

        toggle.addEventListener('click', () => {
            if (!driving || crashed) start();
            else stop();
            toggle.focus();
        });
        function jumpOrRetry() {
            if (crashed) start();
            else if (height === 0) velocity = 280;
        }

        function firePulse() {
            if (crashed || charges === 0 || playerShotX !== null) return;
            charges--;
            playerShotX = carX;
            updateHud();
        }

        const actions = {ArrowUp: jumpOrRetry, x: firePulse};
        panel.addEventListener('focusout', event => {
            if (!panel.contains(event.relatedTarget)) stop();
            else held.clear();
        });
        window.addEventListener('blur', stop);
        panel.addEventListener('keyup', event => held.delete(event.key));
        panel.addEventListener('keydown', event => {
            const key = event.key.toLowerCase() === 'x' ? 'x' : event.key;
            if (!driving || !['Escape', ' ', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'x'].includes(key)) return;
            if (key === ' ' && event.target.closest('[data-drive]')) return;
            event.preventDefault();
            if (key === 'Escape') stop();
            else if (!event.repeat && (key === ' ' || actions[key])) (actions[key] ?? jumpOrRetry)();
            else if (key === 'ArrowLeft' || key === 'ArrowRight') held.add(key);
        });

        for (const control of panel.querySelectorAll('[data-drive]')) {
            const key = control.dataset.drive;
            if (actions[key]) {
                control.addEventListener('click', () => {
                    if (driving) actions[key]();
                });
            } else {
                control.addEventListener('pointerdown', event => {
                    if (!driving || crashed) return;
                    event.preventDefault();
                    control.setPointerCapture(event.pointerId);
                    held.add(key);
                });
                control.addEventListener('lostpointercapture', () => held.delete(key));
            }
        }
    }

    mountDriveControl();
}
