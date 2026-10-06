// ========================================================
// JAVASCRIPT HỖ TRỢ GIAO DIỆN & TƯƠNG TÁC NGƯỜI DÙNG
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. CHỨC NĂNG ĐỔI GIAO DIỆN SÁNG / TỐI (THEME TOGGLE)
    // ----------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const rootHtml = document.documentElement;

    // Kiểm tra cài đặt theme đã lưu trong LocalStorage
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    if (savedTheme === 'dark') {
        rootHtml.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Sáng';
    } else {
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Tối';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootHtml.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                rootHtml.removeAttribute('data-theme');
                localStorage.setItem('app-theme', 'light');
                if (themeIcon) themeIcon.textContent = '🌙';
                if (themeText) themeText.textContent = 'Tối';
            } else {
                rootHtml.setAttribute('data-theme', 'dark');
                localStorage.setItem('app-theme', 'dark');
                if (themeIcon) themeIcon.textContent = '☀️';
                if (themeText) themeText.textContent = 'Sáng';
            }
        });
    }

    // ----------------------------------------------------
    // 2. CHỨC NĂNG CHẠY LẠI ANIMATION KỸ NĂNG (BÀI 6)
    // ----------------------------------------------------
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            const progressBars = document.querySelectorAll('.skill-progress');
            progressBars.forEach((bar) => {
                // Tạm thời gỡ animation
                bar.style.animation = 'none';
                // Trigger reflow (ép trình duyệt render lại frame)
                void bar.offsetWidth;
                // Khôi phục animation ban đầu
                bar.style.animation = '';
            });
        });
    }

    // ----------------------------------------------------
    // 3. TỰ ĐỘNG ĐÓNG MENU KHI CHỌN MỤC HOẶC BẤM RA NGOÀI
    // ----------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const drawerLinks = document.querySelectorAll('.drawer-nav a, .drawer-actions a, .acc-dropdown-list a');

    // Đóng drawer khi nhấp vào bất kỳ link nào
    drawerLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (menuToggle && menuToggle.checked) {
                menuToggle.checked = false;
            }
        });
    });

    // Đóng drawer khi bấm phím Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuToggle && menuToggle.checked) {
            menuToggle.checked = false;
        }
    });

    // Đóng drawer khi nhấp ra ngoài khu vực header / drawer
    document.addEventListener('click', (e) => {
        if (menuToggle && menuToggle.checked) {
            const clickedInside = e.target.closest('#main-header');
            if (!clickedInside) {
                menuToggle.checked = false;
            }
        }
    });

    // ----------------------------------------------------
    // 4. HIỆU ỨNG CUỘN MƯỢT CHO NÚT HÀNH ĐỘNG NỔI (FAB)
    // ----------------------------------------------------
    const fabButton = document.getElementById('fab-contact');
    if (fabButton) {
        fabButton.addEventListener('click', (e) => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                e.preventDefault();
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ----------------------------------------------------
    // 5. TRÒ CHƠI MINI GAME: FLAPPY BIRD
    // ----------------------------------------------------
    const canvas = document.getElementById('flappy-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const startOverlay = document.getElementById('start-overlay');
        const gameoverOverlay = document.getElementById('gameover-overlay');
        const startBtn = document.getElementById('start-game-btn');
        const restartBtn = document.getElementById('restart-game-btn');
        const currentScoreEl = document.getElementById('current-score');
        const bestScoreEl = document.getElementById('best-score');
        const finalScoreEl = document.getElementById('final-score');
        const finalBestEl = document.getElementById('final-best');

        // Âm thanh tổng hợp bằng Web Audio API
        let audioCtx = null;
        function getAudioContext() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playSound(type) {
            const ctxA = getAudioContext();
            if (!ctxA) return;
            try {
                const now = ctxA.currentTime;
                const osc = ctxA.createOscillator();
                const gain = ctxA.createGain();
                osc.connect(gain);
                gain.connect(ctxA.destination);

                if (type === 'jump') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(380, now);
                    osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                } else if (type === 'score') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(587.33, now); // D5
                    osc.frequency.setValueAtTime(880, now + 0.08); // A5
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
                    osc.start(now);
                    osc.stop(now + 0.22);
                } else if (type === 'hit') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.linearRampToValueAtTime(50, now + 0.18);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
                    osc.start(now);
                    osc.stop(now + 0.18);
                }
            } catch (err) {}
        }

        // Kỷ lục lưu trữ
        let bestScore = parseInt(localStorage.getItem('flappy_best_score') || '0', 10);
        if (bestScoreEl) bestScoreEl.textContent = bestScore;

        // Trạng thái game: 'IDLE', 'PLAYING', 'GAMEOVER'
        let gameState = 'IDLE';
        let score = 0;
        let frames = 0;
        let shake = 0;

        const groundHeight = 56;
        let groundOffset = 0;

        // Chú chim Flappy
        const bird = {
            x: 80,
            y: 220,
            radius: 14,
            velocity: 0,
            gravity: 0.35,
            jumpStrength: -6.6,
            rotation: 0,
            flapTimer: 0,
            reset() {
                this.x = 80;
                this.y = 220;
                this.velocity = 0;
                this.rotation = 0;
                this.flapTimer = 0;
            },
            jump() {
                this.velocity = this.jumpStrength;
                this.rotation = -0.4;
                playSound('jump');
                // Tạo hạt bụi/lông vũ khi đập cánh
                createFeathers(this.x - 8, this.y + 4);
            },
            update() {
                this.velocity += this.gravity;
                this.y += this.velocity;
                this.flapTimer += 0.2;

                // Xoay đầu chim theo vận tốc rơi
                if (this.velocity < 0) {
                    this.rotation = Math.max(-0.45, this.velocity * 0.08);
                } else {
                    this.rotation = Math.min(Math.PI / 2.2, this.velocity * 0.09);
                }

                // Chạm nóc
                if (this.y - this.radius <= 0) {
                    this.y = this.radius;
                    this.velocity = 0;
                }
            },
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Hiệu ứng tia lửa bốc cháy ở đuôi (đồng bộ với phong cách siêu cháy)
                const sparkSize = 4 + Math.sin(Date.now() * 0.02) * 2;
                ctx.beginPath();
                ctx.arc(-16, 2, sparkSize, 0, Math.PI * 2);
                ctx.fillStyle = '#ff4500';
                ctx.shadowColor = '#ff8c00';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Thân chim (Hình bầu dục vàng óng)
                ctx.beginPath();
                ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#facc15';
                ctx.strokeStyle = '#ca8a04';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();

                // Bụng chim trắng nhẹ
                ctx.beginPath();
                ctx.ellipse(-2, 4, 9, 6, 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#fef08a';
                ctx.fill();

                // Cánh chim vỗ nhịp
                const wingY = Math.sin(this.flapTimer) * 4;
                ctx.beginPath();
                ctx.ellipse(-5, wingY, 8, 5, -0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#eab308';
                ctx.strokeStyle = '#a16207';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();

                // Mắt chim to tròn
                ctx.beginPath();
                ctx.arc(6, -5, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();

                // Tròng đen
                ctx.beginPath();
                ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();

                // Điểm sáng trong mắt
                ctx.beginPath();
                ctx.arc(7.2, -6, 0.9, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                // Mỏ chim màu cam
                ctx.beginPath();
                ctx.moveTo(10, -2);
                ctx.lineTo(20, 2);
                ctx.lineTo(10, 6);
                ctx.closePath();
                ctx.fillStyle = '#f97316';
                ctx.strokeStyle = '#c2410c';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        };

        // Danh sách chướng ngại vật (Cột / Ống nước)
        let pipes = [];
        const pipeWidth = 58;
        const pipeGap = 138;
        const pipeSpeed = 2.1;

        function createPipe() {
            const minHeight = 50;
            const maxHeight = canvas.height - groundHeight - pipeGap - 50;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            pipes.push({
                x: canvas.width,
                top: topHeight,
                bottom: canvas.height - groundHeight - topHeight - pipeGap,
                passed: false
            });
        }

        // Hạt hiệu ứng (Feathers & Stars)
        let particles = [];
        function createFeathers(x, y) {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: -(Math.random() * 2 + 1),
                    vy: (Math.random() * 2 - 1),
                    radius: Math.random() * 2.5 + 1.5,
                    color: Math.random() > 0.5 ? '#facc15' : '#ffedd5',
                    alpha: 1,
                    life: 0.04
                });
            }
        }

        function createScoreStars(x, y) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const speed = Math.random() * 3 + 2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 3 + 2,
                    color: '#facc15',
                    alpha: 1,
                    life: 0.03
                });
            }
        }

        function updateAndDrawParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.life;
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Đám mây trôi
        const clouds = [
            { x: 30, y: 50, speed: 0.35, r: 18 },
            { x: 180, y: 90, speed: 0.5, r: 24 },
            { x: 320, y: 40, speed: 0.4, r: 16 }
        ];

        // Ngôi sao ban đêm (khi bật dark mode)
        const stars = [];
        for (let i = 0; i < 30; i++) {
            stars.push({
                x: Math.random() * 400,
                y: Math.random() * 300,
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.7 + 0.3
            });
        }

        function drawBackground() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            // Bầu trời
            if (isDark) {
                const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - groundHeight);
                skyGrad.addColorStop(0, '#0b132b');
                skyGrad.addColorStop(1, '#1c2541');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Mặt trăng
                ctx.beginPath();
                ctx.arc(330, 70, 22, 0, Math.PI * 2);
                ctx.fillStyle = '#fef08a';
                ctx.shadowColor = '#fef08a';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Sao lấp lánh
                ctx.fillStyle = '#ffffff';
                stars.forEach(s => {
                    ctx.globalAlpha = s.alpha * (0.6 + Math.sin(Date.now() * 0.003 + s.x) * 0.4);
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            } else {
                const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - groundHeight);
                skyGrad.addColorStop(0, '#67e8f9');
                skyGrad.addColorStop(1, '#e0f2fe');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Mặt trời ấm áp
                ctx.beginPath();
                ctx.arc(340, 60, 26, 0, Math.PI * 2);
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Đám mây trôi
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)';
            clouds.forEach(c => {
                c.x -= c.speed;
                if (c.x + c.r * 3 < 0) c.x = canvas.width + c.r;

                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.arc(c.x + c.r * 0.7, c.y - c.r * 0.3, c.r * 0.8, 0, Math.PI * 2);
                ctx.arc(c.x + c.r * 1.4, c.y, c.r * 0.9, 0, Math.PI * 2);
                ctx.fill();
            });

            // Đồi xa tạo chiều sâu
            ctx.fillStyle = isDark ? '#1e293b' : '#a7f3d0';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - groundHeight);
            ctx.quadraticCurveTo(100, canvas.height - groundHeight - 40, 200, canvas.height - groundHeight);
            ctx.quadraticCurveTo(300, canvas.height - groundHeight - 50, 400, canvas.height - groundHeight);
            ctx.lineTo(400, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.fill();
        }

        function drawPipes() {
            pipes.forEach(p => {
                const pipeTopY = 0;
                const pipeTopHeight = p.top;
                const pipeBottomY = canvas.height - groundHeight - p.bottom;
                const pipeBottomHeight = p.bottom;

                // Ống trên
                drawSinglePipe(p.x, pipeTopY, pipeWidth, pipeTopHeight, true);
                // Ống dưới
                drawSinglePipe(p.x, pipeBottomY, pipeWidth, pipeBottomHeight, false);
            });
        }

        function drawSinglePipe(x, y, width, height, isTop) {
            // Thân ống với gradient 3D xanh lá
            const pipeGrad = ctx.createLinearGradient(x, 0, x + width, 0);
            pipeGrad.addColorStop(0, '#22c55e');
            pipeGrad.addColorStop(0.3, '#4ade80');
            pipeGrad.addColorStop(0.7, '#16a34a');
            pipeGrad.addColorStop(1, '#15803d');

            ctx.fillStyle = pipeGrad;
            ctx.strokeStyle = '#052e16';
            ctx.lineWidth = 2.5;

            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);

            // Vành miệng ống
            const capHeight = 22;
            const capOverflow = 5;
            const capX = x - capOverflow;
            const capWidth = width + capOverflow * 2;
            const capY = isTop ? y + height - capHeight : y;

            const capGrad = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
            capGrad.addColorStop(0, '#22c55e');
            capGrad.addColorStop(0.3, '#4ade80');
            capGrad.addColorStop(0.7, '#16a34a');
            capGrad.addColorStop(1, '#14532d');

            ctx.fillStyle = capGrad;
            ctx.fillRect(capX, capY, capWidth, capHeight);
            ctx.strokeRect(capX, capY, capWidth, capHeight);
        }

        function drawGround() {
            const groundY = canvas.height - groundHeight;

            // Mặt cỏ trên cùng
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(0, groundY, canvas.width, 10);
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(0, groundY, canvas.width, 10);

            // Lòng đất bên dưới
            const groundGrad = ctx.createLinearGradient(0, groundY + 10, 0, canvas.height);
            groundGrad.addColorStop(0, '#d97706');
            groundGrad.addColorStop(1, '#92400e');
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, groundY + 10, canvas.width, groundHeight - 10);

            // Các sọc đất di chuyển tạo cảm giác mặt đất trượt liên tục
            groundOffset = (groundOffset + pipeSpeed) % 24;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            for (let x = -groundOffset; x < canvas.width; x += 24) {
                ctx.beginPath();
                ctx.moveTo(x + 12, groundY + 10);
                ctx.lineTo(x + 6, canvas.height);
                ctx.lineTo(x + 12, canvas.height);
                ctx.lineTo(x + 18, groundY + 10);
                ctx.fill();
            }
        }

        function checkCollision() {
            // Chạm đất
            if (bird.y + bird.radius >= canvas.height - groundHeight) {
                return true;
            }

            // Kiểm tra va chạm với các ống
            for (let i = 0; i < pipes.length; i++) {
                const p = pipes[i];
                const pipeRight = p.x + pipeWidth;
                const bottomPipeY = canvas.height - groundHeight - p.bottom;

                // Kiểm tra phạm vi trục X
                if (bird.x + bird.radius - 3 > p.x && bird.x - bird.radius + 3 < pipeRight) {
                    // Va chạm ống trên
                    if (bird.y - bird.radius + 3 < p.top) {
                        return true;
                    }
                    // Va chạm ống dưới
                    if (bird.y + bird.radius - 3 > bottomPipeY) {
                        return true;
                    }
                }
            }
            return false;
        }

        function triggerGameOver() {
            gameState = 'GAMEOVER';
            shake = 14;
            playSound('hit');

            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('flappy_best_score', bestScore.toString());
                if (bestScoreEl) bestScoreEl.textContent = bestScore;
            }

            if (finalScoreEl) finalScoreEl.textContent = score;
            if (finalBestEl) finalBestEl.textContent = bestScore;
            if (gameoverOverlay) gameoverOverlay.classList.remove('hidden');
        }

        function startGame() {
            gameState = 'PLAYING';
            score = 0;
            frames = 0;
            pipes = [];
            particles = [];
            bird.reset();
            bird.jump();

            if (currentScoreEl) currentScoreEl.textContent = score;
            if (startOverlay) startOverlay.classList.add('hidden');
            if (gameoverOverlay) gameoverOverlay.classList.add('hidden');
        }

        // Xử lý hành động nhảy
        function handleAction(e) {
            if (e) {
                // Tránh scroll trang khi bấm Space
                if (e.type === 'keydown' && (e.code === 'Space' || e.code === 'ArrowUp')) {
                    const rect = canvas.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    if (isVisible) {
                        e.preventDefault();
                    }
                }
            }

            if (gameState === 'IDLE') {
                startGame();
            } else if (gameState === 'PLAYING') {
                bird.jump();
            } else if (gameState === 'GAMEOVER') {
                startGame();
            }
        }

        // Lắng nghe sự kiện
        if (startBtn) startBtn.addEventListener('click', (e) => { e.stopPropagation(); startGame(); });
        if (restartBtn) restartBtn.addEventListener('click', (e) => { e.stopPropagation(); startGame(); });

        canvas.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAction(e);
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAction(e);
        }, { passive: false });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                const rect = canvas.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                if (isVisible) {
                    handleAction(e);
                }
            }
        });

        // Vòng lặp chính của trò chơi (Main Game Loop)
        function gameLoop() {
            ctx.save();

            // Hiệu ứng rung màn hình khi va chạm
            if (shake > 0) {
                const dx = (Math.random() - 0.5) * shake;
                const dy = (Math.random() - 0.5) * shake;
                ctx.translate(dx, dy);
                shake *= 0.85;
                if (shake < 0.5) shake = 0;
            }

            // 1. Vẽ nền
            drawBackground();

            // 2. Logic theo trạng thái
            if (gameState === 'PLAYING') {
                frames++;

                // Sinh ống chướng ngại vật định kỳ
                if (frames % 105 === 0) {
                    createPipe();
                }

                // Cập nhật và kiểm tra ống
                for (let i = pipes.length - 1; i >= 0; i--) {
                    const p = pipes[i];
                    p.x -= pipeSpeed;

                    // Tính điểm khi vượt qua ống thành công
                    if (!p.passed && p.x + pipeWidth < bird.x) {
                        p.passed = true;
                        score++;
                        if (currentScoreEl) currentScoreEl.textContent = score;
                        playSound('score');
                        createScoreStars(bird.x, bird.y);
                    }

                    // Xóa ống đã đi qua màn hình
                    if (p.x + pipeWidth < -20) {
                        pipes.splice(i, 1);
                    }
                }

                // Cập nhật chim
                bird.update();

                // Kiểm tra va chạm
                if (checkCollision()) {
                    triggerGameOver();
                }
            } else if (gameState === 'IDLE') {
                // Nhấp nhô chú chim nhẹ nhàng khi đang ở màn hình chờ
                bird.y = 220 + Math.sin(Date.now() * 0.005) * 8;
                bird.flapTimer += 0.15;
            }

            // 3. Vẽ ống nước
            drawPipes();

            // 4. Vẽ mặt đất
            drawGround();

            // 5. Vẽ hiệu ứng hạt
            updateAndDrawParticles();

            // 6. Vẽ chú chim
            bird.draw();

            // 7. Vẽ điểm số lớn trực tiếp trên canvas khi đang chơi
            if (gameState === 'PLAYING') {
                ctx.save();
                ctx.font = '800 36px monospace';
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.lineWidth = 4;
                ctx.textAlign = 'center';
                ctx.strokeText(score.toString(), canvas.width / 2, 60);
                ctx.fillText(score.toString(), canvas.width / 2, 60);
                ctx.restore();
            }

            ctx.restore();
            requestAnimationFrame(gameLoop);
        }

        // Bắt đầu vòng lặp game
        requestAnimationFrame(gameLoop);
    }

    // ----------------------------------------------------
    // 6. BÀI TẬP LẬP TRÌNH: PYTHON & C++ (CÁC PHÉP TOÁN + - * /)
    // ----------------------------------------------------
    const codeEditor = document.getElementById('code-editor');
    if (codeEditor) {
        const lineNumbers = document.getElementById('line-numbers');
        const probTag = document.getElementById('prob-tag');
        const probTitle = document.getElementById('prob-title');
        const probDesc = document.getElementById('prob-desc');
        const probInput = document.getElementById('prob-input');
        const probOutput = document.getElementById('prob-output');
        const probNoteText = document.getElementById('prob-note-text');
        const fileIcon = document.getElementById('file-icon');
        const fileName = document.getElementById('file-name');
        const terminalOutput = document.getElementById('terminal-output');
        const btnRunCode = document.getElementById('btn-run-code');
        const btnSolution = document.getElementById('btn-solution');
        const btnReset = document.getElementById('btn-reset');
        const btnClearTerm = document.getElementById('btn-clear-term');
        const langTabs = document.querySelectorAll('.lang-tab');
        const exPills = document.querySelectorAll('.ex-pill');

        let currentLang = 'python'; // 'python' hoặc 'cpp'
        let currentEx = 'add';      // 'add', 'sub', 'mul', 'div', 'mix'

        // Dữ liệu chi tiết các bài tập
        const exercisesData = {
            add: {
                tag: 'Bài 1: Phép Cộng (+)',
                title: 'Tính Tổng Hai Số Nguyên',
                desc: 'Cho hai số nguyên a = 15 và b = 27. Hãy sử dụng toán tử cộng + để tính tổng của chúng và in ra màn hình.',
                input: 'a = 15, b = 27',
                output: 'Tong = 42',
                note: 'Toán tử + trong Python và C++ dùng để tính tổng hai giá trị số học. Trong biểu thức a + b, hai toán hạng sẽ được cộng lại với nhau.',
                testCases: [
                    { inputs: { a: 15, b: 27 }, expected: 42, label: 'a = 15, b = 27' },
                    { inputs: { a: 100, b: 250 }, expected: 350, label: 'a = 100, b = 250' },
                    { inputs: { a: -8, b: 20 }, expected: 12, label: 'a = -8, b = 20' }
                ],
                python: {
                    template: `# Bài 1: Tính tổng 2 số nguyên bằng phép cộng (+)
a = 15
b = 27

# TODO: Viết phép tính tổng tại đây
tong = a + b

# In kết quả ra màn hình
print(f"Tong = {tong}")`,
                    solution: `# Lời giải mẫu (Python 3):
a = 15
b = 27

# Áp dụng toán tử + để tính tổng
tong = a + b

print(f"Tong = {tong}")`
                },
                cpp: {
                    template: `// Bài 1: Tính tổng 2 số nguyên bằng phép cộng (+)
#include <iostream>
using namespace std;

int main() {
    int a = 15;
    int b = 27;

    // TODO: Viết phép tính tổng tại đây
    int tong = a + b;

    cout << "Tong = " << tong << endl;
    return 0;
}`,
                    solution: `// Lời giải mẫu (C++ 17):
#include <iostream>
using namespace std;

int main() {
    int a = 15;
    int b = 27;

    // Sử dụng toán tử + tính tổng
    int tong = a + b;

    cout << "Tong = " << tong << endl;
    return 0;
}`
                }
            },
            sub: {
                tag: 'Bài 2: Phép Trừ (-)',
                title: 'Tính Số Dư Còn Lại Sau Chi Tiêu',
                desc: 'Cho số tiền gốc ban đầu tien_goc = 500000 VNĐ và số tiền chi tiêu chi_tieu = 185000 VNĐ. Hãy dùng toán tử trừ - để tính số dư còn lại: so_du = tien_goc - chi_tieu.',
                input: 'tien_goc = 500000, chi_tieu = 185000',
                output: 'So du con lai = 315000',
                note: 'Toán tử - dùng để lấy hiệu của 2 số. Nếu số bị trừ nhỏ hơn số trừ, kết quả sẽ là một số âm hợp lệ trong cả Python và C++.',
                testCases: [
                    { inputs: { a: 500000, b: 185000 }, expected: 315000, label: 'tien_goc = 500000, chi_tieu = 185000' },
                    { inputs: { a: 1000000, b: 450000 }, expected: 550000, label: 'tien_goc = 1000000, chi_tieu = 450000' },
                    { inputs: { a: 200000, b: 200000 }, expected: 0, label: 'tien_goc = 200000, chi_tieu = 200000' }
                ],
                python: {
                    template: `# Bài 2: Tính số dư bằng phép trừ (-)
tien_goc = 500000
chi_tieu = 185000

# TODO: Viết phép trừ tính số dư
so_du = tien_goc - chi_tieu

print(f"So du con lai = {so_du}")`,
                    solution: `# Lời giải mẫu (Python 3):
tien_goc = 500000
chi_tieu = 185000

# Sử dụng toán tử - để tính hiệu số
so_du = tien_goc - chi_tieu

print(f"So du con lai = {so_du}")`
                },
                cpp: {
                    template: `// Bài 2: Tính số dư bằng phép trừ (-)
#include <iostream>
using namespace std;

int main() {
    long long tien_goc = 500000;
    long long chi_tieu = 185000;

    // TODO: Viết phép trừ tính số dư
    long long so_du = tien_goc - chi_tieu;

    cout << "So du con lai = " << so_du << endl;
    return 0;
}`,
                    solution: `// Lời giải mẫu (C++ 17):
#include <iostream>
using namespace std;

int main() {
    long long tien_goc = 500000;
    long long chi_tieu = 185000;

    // Phép trừ số tiền
    long long so_du = tien_goc - chi_tieu;

    cout << "So du con lai = " << so_du << endl;
    return 0;
}`
                }
            },
            mul: {
                tag: 'Bài 3: Phép Nhân (*)',
                title: 'Tính Diện Tích Mảnh Đất Hình Chữ Nhật',
                desc: 'Cho chiều dài dai = 12 mét và chiều rộng rong = 8 mét. Hãy dùng toán tử nhân * để tính diện tích mảnh đất: dien_tich = dai * rong.',
                input: 'dai = 12, rong = 8',
                output: 'Dien tich = 96',
                note: 'Toán tử * dùng để nhân hai số học. Trong Python, toán tử ** là phép nâng lên lũy thừa, còn toán tử * đơn lẻ là phép nhân.',
                testCases: [
                    { inputs: { a: 12, b: 8 }, expected: 96, label: 'dai = 12, rong = 8' },
                    { inputs: { a: 25, b: 4 }, expected: 100, label: 'dai = 25, rong = 4' },
                    { inputs: { a: 15, b: 10 }, expected: 150, label: 'dai = 15, rong = 10' }
                ],
                python: {
                    template: `# Bài 3: Tính diện tích bằng phép nhân (*)
chieu_dai = 12
chieu_rong = 8

# TODO: Viết phép tính diện tích hình chữ nhật
dien_tich = chieu_dai * chieu_rong

print(f"Dien tich = {dien_tich}")`,
                    solution: `# Lời giải mẫu (Python 3):
chieu_dai = 12
chieu_rong = 8

# Áp dụng toán tử * để tính diện tích
dien_tich = chieu_dai * chieu_rong

print(f"Dien tich = {dien_tich}")`
                },
                cpp: {
                    template: `// Bài 3: Tính diện tích bằng phép nhân (*)
#include <iostream>
using namespace std;

int main() {
    int chieu_dai = 12;
    int chieu_rong = 8;

    // TODO: Viết phép tính diện tích
    int dien_tich = chieu_dai * chieu_rong;

    cout << "Dien tich = " << dien_tich << endl;
    return 0;
}`,
                    solution: `// Lời giải mẫu (C++ 17):
#include <iostream>
using namespace std;

int main() {
    int chieu_dai = 12;
    int chieu_rong = 8;

    // Phép nhân chiều dài và chiều rộng
    int dien_tich = chieu_dai * chieu_rong;

    cout << "Dien tich = " << dien_tich << endl;
    return 0;
}`
                }
            },
            div: {
                tag: 'Bài 4: Phép Chia (/)',
                title: 'Phép Chia Lấy Số Thực Chính Xác',
                desc: 'Cho hai số nguyên a = 15 và b = 4. Hãy tính thương của phép chia a / b với kết quả là số thực (3.75). Lưu ý phân biệt giữa chia nguyên và chia thực.',
                input: 'a = 15, b = 4',
                output: 'Thuong = 3.75',
                note: 'Trong Python, toán tử / luôn trả về số thực float (15 / 4 = 3.75). Trong C++, nếu hai toán hạng đều là int thì a / b sẽ ra 3 (cắt phần thập phân); bạn cần ép kiểu (double)a / b để nhận được kết quả số thực chính xác!',
                testCases: [
                    { inputs: { a: 15, b: 4 }, expected: 3.75, label: 'a = 15, b = 4' },
                    { inputs: { a: 20, b: 8 }, expected: 2.5, label: 'a = 20, b = 8' },
                    { inputs: { a: 9, b: 2 }, expected: 4.5, label: 'a = 9, b = 2' }
                ],
                python: {
                    template: `# Bài 4: Phép chia lấy số thực (/)
a = 15
b = 4

# TODO: Thực hiện phép chia lấy số thực
# Trong Python, toán tử / luôn cho kết quả float
thuong = a / b

print(f"Thuong = {thuong}")`,
                    solution: `# Lời giải mẫu (Python 3):
a = 15
b = 4

# Phép chia số thực trong Python
thuong = a / b

print(f"Thuong = {thuong}")`
                },
                cpp: {
                    template: `// Bài 4: Phép chia lấy số thực (/)
#include <iostream>
using namespace std;

int main() {
    int a = 15;
    int b = 4;

    // TODO: Ép kiểu sang double để không bị làm tròn thành số nguyên
    double thuong = (double)a / b;

    cout << "Thuong = " << thuong << endl;
    return 0;
}`,
                    solution: `// Lời giải mẫu (C++ 17):
#include <iostream>
using namespace std;

int main() {
    int a = 15;
    int b = 4;

    // Ép kiểu (double) trước khi chia
    double thuong = (double)a / b;

    cout << "Thuong = " << thuong << endl;
    return 0;
}`
                }
            },
            mix: {
                tag: 'Bài 5: Tổng Hợp (+ - * /)',
                title: 'Tính Biểu Thức Kết Hợp 4 Phép Toán',
                desc: 'Cho các số a = 20, b = 10, c = 5, d = 2. Hãy tính giá trị của biểu thức: ket_qua = (a + b) * c - (a / d). Chú ý quy tắc ưu tiên toán tử và dấu ngoặc tròn.',
                input: 'a = 20, b = 10, c = 5, d = 2',
                output: 'Ket qua bieu thuc = 140',
                note: 'Thứ tự ưu tiên: biểu thức trong ngoặc đơn () được tính trước, sau đó đến nhân (*) và chia (/), cuối cùng là cộng (+) và trừ (-).',
                testCases: [
                    { inputs: { a: 20, b: 10, c: 5, d: 2 }, expected: 140, label: 'a = 20, b = 10, c = 5, d = 2' },
                    { inputs: { a: 10, b: 5, c: 4, d: 2 }, expected: 55, label: 'a = 10, b = 5, c = 4, d = 2' },
                    { inputs: { a: 30, b: 20, c: 2, d: 5 }, expected: 94, label: 'a = 30, b = 20, c = 2, d = 5' }
                ],
                python: {
                    template: `# Bài 5: Biểu thức kết hợp 4 phép toán (+, -, *, /)
a = 20
b = 10
c = 5
d = 2

# TODO: Tính (a + b) * c - (a / d)
ket_qua = (a + b) * c - (a / d)

print(f"Ket qua bieu thuc = {ket_qua}")`,
                    solution: `# Lời giải mẫu (Python 3):
a = 20
b = 10
c = 5
d = 2

# Kết hợp cả 4 phép tính: +, -, *, /
ket_qua = (a + b) * c - (a / d)

print(f"Ket qua bieu thuc = {ket_qua}")`
                },
                cpp: {
                    template: `// Bài 5: Biểu thức kết hợp 4 phép toán (+, -, *, /)
#include <iostream>
using namespace std;

int main() {
    double a = 20;
    double b = 10;
    double c = 5;
    double d = 2;

    // TODO: Tính (a + b) * c - (a / d)
    double ket_qua = (a + b) * c - (a / d);

    cout << "Ket qua bieu thuc = " << ket_qua << endl;
    return 0;
}`,
                    solution: `// Lời giải mẫu (C++ 17):
#include <iostream>
using namespace std;

int main() {
    double a = 20;
    double b = 10;
    double c = 5;
    double d = 2;

    // Tính biểu thức kết hợp 4 phép toán
    double ket_qua = (a + b) * c - (a / d);

    cout << "Ket qua bieu thuc = " << ket_qua << endl;
    return 0;
}`
                }
            }
        };

        // Cập nhật số dòng trong Line Numbers
        function updateLineNumbers() {
            const lines = codeEditor.value.split('\n').length;
            let lineStr = '';
            for (let i = 1; i <= Math.max(lines, 8); i++) {
                lineStr += `<span>${i}</span>`;
            }
            lineNumbers.innerHTML = lineStr;
        }

        // Đồng bộ cuộn giữa Editor và Line Numbers
        codeEditor.addEventListener('scroll', () => {
            lineNumbers.scrollTop = codeEditor.scrollTop;
        });

        // Xử lý phím Tab trong Textarea (Thêm 4 dấu cách thay vì nhảy focus)
        codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditor.selectionStart;
                const end = codeEditor.selectionEnd;
                codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
                codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });

        codeEditor.addEventListener('input', updateLineNumbers);

        // Hiển thị nội dung bài tập hiện tại
        function renderExercise() {
            const exData = exercisesData[currentEx];
            if (!exData) return;

            // Cập nhật thông tin đề bài
            probTag.textContent = exData.tag;
            probTitle.textContent = exData.title;
            probDesc.textContent = exData.desc;
            probInput.textContent = exData.input;
            probOutput.textContent = exData.output;
            probNoteText.textContent = exData.note;

            // Cập nhật tab file
            if (currentLang === 'python') {
                fileIcon.textContent = '🐍';
                fileName.textContent = 'main.py';
                codeEditor.value = exData.python.template;
            } else {
                fileIcon.textContent = '⚙️';
                fileName.textContent = 'main.cpp';
                codeEditor.value = exData.cpp.template;
            }

            updateLineNumbers();
        }

        // Chuyển ngôn ngữ
        langTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                langTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentLang = tab.getAttribute('data-lang');
                renderExercise();

                printTermLine(`$ Đã chuyển sang môi trường [${currentLang.toUpperCase()}]. Code mẫu đã được nạp.`, 'cmd');
            });
        });

        // Chuyển bài tập
        exPills.forEach((pill) => {
            pill.addEventListener('click', () => {
                exPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentEx = pill.getAttribute('data-ex');
                renderExercise();

                printTermLine(`$ Đã chọn bài tập: [${exercisesData[currentEx].tag}].`, 'cmd');
            });
        });

        // Nút Xem lời giải
        btnSolution.addEventListener('click', () => {
            const exData = exercisesData[currentEx];
            if (currentLang === 'python') {
                codeEditor.value = exData.python.solution;
            } else {
                codeEditor.value = exData.cpp.solution;
            }
            updateLineNumbers();
            printTermLine(`💡 Đã nạp code lời giải mẫu chuẩn cho [${exData.tag}] (${currentLang.toUpperCase()}). Nhấn "▶ Chạy Code" để kiểm tra!`, 'success');
        });

        // Nút Đặt lại code ban đầu
        btnReset.addEventListener('click', () => {
            renderExercise();
            printTermLine(`🔄 Đã khôi phục code bài tập về trạng thái mặc định ban đầu.`, 'prompt');
        });

        // Nút Xóa terminal
        btnClearTerm.addEventListener('click', () => {
            terminalOutput.innerHTML = '<div class="term-line prompt">$ Màn hình console đã được làm sạch.</div>';
        });

        function printTermLine(text, type = 'output') {
            const line = document.createElement('div');
            line.className = `term-line ${type}`;
            line.textContent = text;
            terminalOutput.appendChild(line);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }

        // Trình giả lập thực thi code và kiểm thử tự động
        function executeCode() {
            const code = codeEditor.value;
            const exData = exercisesData[currentEx];

            // Thông báo bắt đầu chạy
            const cmdText = currentLang === 'python' ? '$ python3 main.py' : '$ g++ -O2 -std=c++17 main.cpp && ./a.out';
            printTermLine(cmdText, 'cmd');

            // Kiểm tra sơ bộ cú pháp cơ bản
            if (currentLang === 'cpp' && (!code.includes('main') || !code.includes('cout'))) {
                printTermLine('❌ Lỗi biên dịch (Compilation Error): Chương trình C++ cần có hàm int main() và lệnh cout.', 'error');
                return;
            }

            // Kiểm tra xem người dùng đã dùng đúng toán tử tương ứng chưa
            const opMap = { add: '+', sub: '-', mul: '*', div: '/' };
            if (opMap[currentEx] && !code.includes(opMap[currentEx])) {
                printTermLine(`⚠️ Cảnh báo: Bài tập này yêu cầu sử dụng toán tử '${opMap[currentEx]}', hãy kiểm tra lại code nhé!`, 'error');
            }

            printTermLine('>>> Biên dịch và thực thi chương trình...', 'prompt');
            printTermLine(`>>> [Đầu ra chương trình]: ${exData.output}`, 'output');

            // Tính toán theo logic bài tập
            let allPassed = true;
            printTermLine('=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST CASES) ===', 'divider');

            exData.testCases.forEach((tc, idx) => {
                let actualResult = null;
                const { a, b, c, d } = tc.inputs;

                if (currentEx === 'add') {
                    actualResult = a + b;
                } else if (currentEx === 'sub') {
                    actualResult = a - b;
                } else if (currentEx === 'mul') {
                    actualResult = a * b;
                } else if (currentEx === 'div') {
                    if (b === 0) {
                        actualResult = 'Lỗi chia cho 0';
                    } else {
                        actualResult = a / b;
                    }
                } else if (currentEx === 'mix') {
                    actualResult = (a + b) * c - (a / d);
                }

                // Kiểm tra xem kết quả có khớp với expected không
                const isMatch = Math.abs(actualResult - tc.expected) < 0.0001;

                if (isMatch) {
                    printTermLine(`[Test ${idx + 1}] Đầu vào: (${tc.label}) => Kết quả: ${actualResult} -> ✅ ĐẠT (Passed)`, 'test-pass');
                } else {
                    allPassed = false;
                    printTermLine(`[Test ${idx + 1}] Đầu vào: (${tc.label}) => Kết quả: ${actualResult} | Mong đợi: ${tc.expected} -> ❌ CHƯA ĐÚNG`, 'test-fail');
                }
            });

            printTermLine('------------------------------------------------------------', 'divider');
            if (allPassed) {
                printTermLine(`🎉 XUẤT SẮC! Tất cả 3/3 test cases đều ĐẠT chuẩn xác với toán tử [${exData.tag}]!`, 'success');
            } else {
                printTermLine(`⚠️ Có test case chưa đạt. Hãy kiểm tra lại công thức tính toán hoặc bấm "💡 Xem Lời Giải" để tham khảo nhé!`, 'error');
            }
        }

        btnRunCode.addEventListener('click', executeCode);

        // Khởi tạo bài tập đầu tiên
        renderExercise();
    }
});