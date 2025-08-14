const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 設定オブジェクト
const ParticleRingConfig = {
    // アニメーション設定
    rotationSpeed: 0.002,
    currentPattern: 0,
    paused: false,
    
    // 環の設定（画面サイズに対する比率）
    ringWidth: 15,
    innerRadius: 180,
    particleDensity: 2.0,
    ringGaps: [0, 12, 22, 35, 47, 62, 75, 90, 105],
    
    // 詳細な粒子数設定
    particleCount: {
        mode: 'density', // 'density' または 'absolute' または 'perRing'
        baseCount: 30,   // 各環の基本粒子数
        increment: 7,    // 外側の環ほど増える粒子数
        multiplier: 2.0, // 全体の倍率
        perRingCounts: null, // 環ごとの個別設定 [ring1, ring2, ring3, ...]
        maxParticles: 2000,  // 最大粒子数制限
        minParticles: 50     // 最小粒子数制限
    },
    
    // スケーリング設定
    scaling: {
        enabled: true,
        baseSize: 800, // 基準サイズ（この時の値が上記の設定値）
        innerRadiusRatio: 0.225, // 内径の比率（180/800 = 0.225）
        ringWidthRatio: 0.01875, // リング幅の比率（15/800 = 0.01875）
        ringGapRatios: [0, 0.015, 0.0275, 0.04375, 0.05875, 0.0775, 0.09375, 0.1125, 0.13125] // 各ギャップの比率
    },
    
    // 粒子設定
    particleSize: {
        min: 0.6,
        max: 3.0
    },
    colors: ['#ffffff', '#f0f8ff', '#e6f3ff', '#ddeeff', '#ccddff', '#bbccff', '#aabbff', '#99aaff'],
    
    // 接続線設定
    connections: {
        enabled: true,
        maxDistance: 40,
        opacity: 0.08,
        lineWidth: 0.2,
        strokeStyle: 'rgba(255, 255, 255, 0.05)'
    },
    
    // 文字設定
    text: {
        line1: '',
        line2: '',
        visible: false,
        fontSize1: 0.08, // 画面サイズの比率
        fontSize2: 0.05  // 画面サイズの比率
    },
    
    // キャンバス設定
    canvas: {
        width: 0,
        height: 0,
        autoResize: true // ウィンドウリサイズ時の自動調整
    }
};

// 変数
let particles = [];
let animationId;
let time = 0;
let fadeInProgress = 0; // fade in進行度 (0-1)

// 後方互換性のための変数（既存のコードとの互換性）
let paused = false;
let currentPattern = 0;
let rotationSpeed = 0.002;
let ringWidth = 15;
let innerRadius = 180;
let particleDensity = 2.0;
let centerText1 = '';
let centerText2 = '';
let showCenterText = false;

// キャンバスサイズ設定
function setCanvasSize(width, height) {
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        ParticleRingConfig.canvas.width = width;
        ParticleRingConfig.canvas.height = height;
    } else {
        // デフォルトサイズ
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.9;
        ParticleRingConfig.canvas.width = canvas.width;
        ParticleRingConfig.canvas.height = canvas.height;
    }
}

// 設定オブジェクトとの同期関数
function syncVariables() {
    paused = ParticleRingConfig.paused;
    currentPattern = ParticleRingConfig.currentPattern;
    rotationSpeed = ParticleRingConfig.rotationSpeed;
    ringWidth = ParticleRingConfig.ringWidth;
    innerRadius = ParticleRingConfig.innerRadius;
    particleDensity = ParticleRingConfig.particleDensity;
    centerText1 = ParticleRingConfig.text.line1;
    centerText2 = ParticleRingConfig.text.line2;
    showCenterText = ParticleRingConfig.text.visible;
}

// パーティクルクラス
class Particle {
    constructor(x, y, radius, color, angle, distance) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.color = color;
        this.angle = angle;
        this.distance = distance;
        this.opacity = Math.random() * 0.3 + 0.7;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.sizeVariation = Math.random() * 0.5 + 0.5;
        this.shape = Math.floor(Math.random() * 3); // 0:丸, 1:三角, 2:四角
        this.rotation = Math.random() * Math.PI * 2; // 初期回転角度
        this.rotationSpeed = (Math.random() - 0.5) * 0.2; // 個別回転速度
        
        // ランダム動作用の変数
        this.randomOffsetX = 0;
        this.randomOffsetY = 0;
        this.randomAngleX = Math.random() * Math.PI * 2;
        this.randomAngleY = Math.random() * Math.PI * 2;
        this.randomSpeedX = Math.random() * 0.02 + 0.005; // よりゆっくりとした揺らぎ
        this.randomSpeedY = Math.random() * 0.02 + 0.005;
        this.randomAmplitudeX = Math.random() * 8 + 2; // 2-10の範囲（土星の環は比較的安定）
        this.randomAmplitudeY = Math.random() * 8 + 2; // 2-10の範囲（土星の環は比較的安定）
        
        // 軌道の歪み用パラメータ
        this.orbitDistortion = Math.random() * 0.4 + 0.3; // 0.3-0.7の範囲
        this.orbitPhase = Math.random() * Math.PI * 2;
        this.orbitFrequency = Math.random() * 3 + 1; // 1-4の範囲
    }
    
    update() {
        // 基本の円軌道計算
        let baseX, baseY;
        
        // 土星の環のような軌道計算（距離に応じて回転速度が変わる）
        const currentCanvasSize = Math.min(canvas.width, canvas.height);
        const currentInnerRadius = ParticleRingConfig.scaling.enabled ? 
            currentCanvasSize * ParticleRingConfig.scaling.innerRadiusRatio : innerRadius;
        const distanceSpeedFactor = 1 / Math.sqrt(this.distance / currentInnerRadius); // ケプラーの法則に近似
        this.angle += rotationSpeed * distanceSpeedFactor * (0.8 + Math.random() * 0.4);
        
        // 環の微細な歪み（土星の環の波動効果）
        const distortedDistance = this.distance * (1 + Math.sin(this.angle * this.orbitFrequency + this.orbitPhase) * this.orbitDistortion * 0.3);
        
        // 回転パターンに応じて基本位置を更新
        switch(currentPattern) {
            case 0: // 不規則な円形回転
                baseX = this.baseX + Math.cos(this.angle) * distortedDistance;
                baseY = this.baseY + Math.sin(this.angle) * distortedDistance;
                break;
                
            case 1: // 不規則な楕円回転
                baseX = this.baseX + Math.cos(this.angle) * distortedDistance;
                baseY = this.baseY + Math.sin(this.angle) * distortedDistance * (0.4 + Math.sin(time * 0.01) * 0.3);
                break;
                
            case 2: // 不規則ならせん回転
                const spiralRadius = distortedDistance + Math.sin(time * 0.008 + this.orbitPhase) * 50;
                baseX = this.baseX + Math.cos(this.angle) * spiralRadius;
                baseY = this.baseY + Math.sin(this.angle) * spiralRadius;
                break;
                
            case 3: // 複雑な多重軌道
                const multiAngle = this.angle * (1 + this.distance * 0.003);
                baseX = this.baseX + Math.cos(multiAngle) * distortedDistance + Math.cos(multiAngle * 2.3) * 30;
                baseY = this.baseY + Math.sin(multiAngle) * distortedDistance + Math.sin(multiAngle * 1.7) * 25;
                break;
        }
        
        // ランダムな揺らぎを追加
        this.randomAngleX += this.randomSpeedX;
        this.randomAngleY += this.randomSpeedY;
        this.randomOffsetX = Math.sin(this.randomAngleX) * this.randomAmplitudeX;
        this.randomOffsetY = Math.cos(this.randomAngleY) * this.randomAmplitudeY;
        
        // 最終位置 = 基本軌道 + ランダム揺らぎ
        this.x = baseX + this.randomOffsetX;
        this.y = baseY + this.randomOffsetY;
        
        // 土星の環の内径境界を不規則に維持
        const centerX = this.baseX;
        const centerY = this.baseY;
        const distanceFromCenter = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2);
        
        // 内径境界も不規則にする（スケーリング対応）
        const boundaryCanvasSize = Math.min(canvas.width, canvas.height);
        const boundaryInnerRadius = ParticleRingConfig.scaling.enabled ? 
            boundaryCanvasSize * ParticleRingConfig.scaling.innerRadiusRatio : innerRadius;
        
        const angleFromCenter = Math.atan2(this.y - centerY, this.x - centerX);
        const irregularInnerRadius = boundaryInnerRadius - 10 + Math.sin(angleFromCenter * 5 + time * 0.01) * 15 + Math.cos(angleFromCenter * 3 + time * 0.008) * 10;
        
        if (distanceFromCenter < irregularInnerRadius) {
            this.x = centerX + Math.cos(angleFromCenter) * irregularInnerRadius;
            this.y = centerY + Math.sin(angleFromCenter) * irregularInnerRadius;
        }
        
        // 透明度のパルス効果（より鮮明に）
        this.opacity = 0.6 + Math.sin(time * this.pulseSpeed) * 0.3;
        
        // サイズのランダム変動
        this.radius = this.baseRadius * (this.sizeVariation + Math.sin(time * this.pulseSpeed * 2) * 0.3);
        
        // 個別回転を更新
        this.rotation += this.rotationSpeed;
    }
    
    draw() {
        ctx.save();
        
        // 宇宙空間では影は不要（光源効果のみ）
        
        // メインの粒子を描画（fade in効果を適用）
        ctx.globalAlpha = this.opacity * fadeInProgress;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // より鮮明なグラデーション
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5; // より細い線で星らしく
        
        // メインの形状を描画
        this.drawShape(this.radius);
        
        ctx.restore();
    }
    
    drawShape(radius) {
        // 形状に応じて描画
        switch(this.shape) {
            case 0: // 丸
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                
                const currentAlpha = ctx.globalAlpha;
                ctx.globalAlpha = currentAlpha * 0.8;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = currentAlpha;
                break;
                
            case 1: // 三角
                ctx.beginPath();
                const height = radius * Math.sqrt(3);
                ctx.moveTo(0, -height * 0.6);
                ctx.lineTo(-radius, height * 0.4);
                ctx.lineTo(radius, height * 0.4);
                ctx.closePath();
                ctx.fill();
                
                const currentAlpha1 = ctx.globalAlpha;
                ctx.globalAlpha = currentAlpha1 * 0.9;
                ctx.stroke();
                ctx.globalAlpha = currentAlpha1;
                break;
                
            case 2: // 四角
                ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
                
                const currentAlpha2 = ctx.globalAlpha;
                ctx.globalAlpha = currentAlpha2 * 0.9;
                ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
                ctx.globalAlpha = currentAlpha2;
                break;
        }
    }
}

// 初期化
function init() {
    particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const colors = ParticleRingConfig.colors;
    
    // キャンバスサイズに応じたスケーリング計算
    const canvasSize = Math.min(canvas.width, canvas.height);
    let scaledInnerRadius, scaledRingGaps;
    
    if (ParticleRingConfig.scaling.enabled) {
        const scale = canvasSize / ParticleRingConfig.scaling.baseSize;
        scaledInnerRadius = canvasSize * ParticleRingConfig.scaling.innerRadiusRatio;
        scaledRingGaps = ParticleRingConfig.scaling.ringGapRatios.map(ratio => ratio * canvasSize);
        
        // グローバル変数も更新
        innerRadius = scaledInnerRadius;
        ringWidth = canvasSize * ParticleRingConfig.scaling.ringWidthRatio;
    } else {
        scaledInnerRadius = ParticleRingConfig.innerRadius;
        scaledRingGaps = ParticleRingConfig.ringGaps;
    }
    
    // 土星の環のような層状構造で粒子を配置
    const ringGaps = scaledRingGaps;
    
    for (let ringIndex = 0; ringIndex < ringGaps.length - 1; ringIndex++) {
        const ringStart = scaledInnerRadius + ringGaps[ringIndex];
        const ringEnd = scaledInnerRadius + ringGaps[ringIndex + 1];
        const ringDistance = (ringStart + ringEnd) / 2;
        const ringThickness = ringEnd - ringStart;
        
        // 粒子数計算（設定モードに応じて）
        let particleCount;
        
        switch (ParticleRingConfig.particleCount.mode) {
            case 'absolute':
                // 絶対数指定モード
                particleCount = Math.floor(ParticleRingConfig.particleCount.baseCount + ringIndex * ParticleRingConfig.particleCount.increment);
                break;
                
            case 'perRing':
                // 環ごと個別指定モード
                if (ParticleRingConfig.particleCount.perRingCounts && ParticleRingConfig.particleCount.perRingCounts[ringIndex]) {
                    particleCount = ParticleRingConfig.particleCount.perRingCounts[ringIndex];
                } else {
                    particleCount = Math.floor(ParticleRingConfig.particleCount.baseCount + ringIndex * ParticleRingConfig.particleCount.increment);
                }
                break;
                
            case 'density':
            default:
                // 密度ベースモード（従来の方式）
                const baseParticleCount = Math.floor(ParticleRingConfig.particleCount.baseCount + ringIndex * ParticleRingConfig.particleCount.increment);
                particleCount = Math.floor(baseParticleCount * ParticleRingConfig.particleCount.multiplier);
                break;
        }
        
        // 最大・最小制限を適用
        particleCount = Math.max(ParticleRingConfig.particleCount.minParticles / ringGaps.length, 
                                Math.min(particleCount, ParticleRingConfig.particleCount.maxParticles / ringGaps.length));
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.3;
            let distance = ringDistance + (Math.random() - 0.5) * ringThickness * 0.8;
            
            // 土星の環の粒子サイズ
            const radius = ParticleRingConfig.particleSize.min + Math.random() * (ParticleRingConfig.particleSize.max - ParticleRingConfig.particleSize.min);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particles.push(new Particle(
                centerX,
                centerY,
                radius,
                color,
                angle,
                distance
            ));
        }
    }
}

// 粒子間の線を描画（N対N接続）
function drawConnections() {
    if (!ParticleRingConfig.connections.enabled) return;
    
    ctx.save();
    ctx.strokeStyle = ParticleRingConfig.connections.strokeStyle;
    ctx.lineWidth = ParticleRingConfig.connections.lineWidth;
    
    // 全ての粒子ペアをチェック
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 設定された距離内での接続
            if (distance < ParticleRingConfig.connections.maxDistance) {
                const opacity = (1 - distance / ParticleRingConfig.connections.maxDistance) * ParticleRingConfig.connections.opacity * fadeInProgress;
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    ctx.restore();
}

// 中央のエフェクト
function drawCenter() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    // 中央の空洞を強調するリング
    const borderRadius = innerRadius - 20;
    
    // 内側のリング（空洞の境界）
    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = time * 0.05;
    ctx.beginPath();
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 中央の小さなパルス
    const pulseRadius = 10 + Math.sin(time * 0.03) * 5;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, '#00ff64');
    gradient.addColorStop(1, 'transparent');
    
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.setLineDash([]);
    
    ctx.restore();
}

// アニメーションループ
function animate() {
    if (!paused) {
        // 背景をクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 時間を更新
        time++;
        
        // fade in効果を更新
        if (fadeInProgress < 1) {
            fadeInProgress = Math.min(1, fadeInProgress + 0.02); // 約1.5秒でfade in完了
        }
        
        // 粒子を更新・描画
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // 接続線を描画
        drawConnections();
        
        // 中央エフェクトは表示しない
        // drawCenter();
        
        // 中央文字を描画
        if (showCenterText && (centerText1 || centerText2)) {
            drawCenterText();
        }
    }
    
    animationId = requestAnimationFrame(animate);
}

// コントロール関数
function changePattern() {
    currentPattern = (currentPattern + 1) % 4;
}

function togglePause() {
    paused = !paused;
}

function changeSpeed() {
    if (rotationSpeed === 0.002) {
        rotationSpeed = 0.005;
    } else if (rotationSpeed === 0.005) {
        rotationSpeed = 0.001;
    } else {
        rotationSpeed = 0.002;
    }
}

function adjustRingWidth() {
    if (ringWidth === 30) {
        ringWidth = 20; // より細い
    } else if (ringWidth === 20) {
        ringWidth = 40; // 太い
    } else {
        ringWidth = 30; // 標準（新しいデフォルト）
    }
    // 粒子を再配置
    init();
}

function adjustParticleCount() {
    if (particleDensity === 3.0) {
        particleDensity = 1.5; // 少ない
    } else if (particleDensity === 1.5) {
        particleDensity = 5.0; // 非常に多い
    } else {
        particleDensity = 3.0; // 標準（宇宙空間）
    }
    // 粒子を再配置
    init();
}

// リサイズ対応
window.addEventListener('resize', () => {
    if (ParticleRingConfig.canvas.autoResize) {
        setCanvasSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
        init();
    }
});

// 中央文字描画関数（2行対応）
function drawCenterText() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.textAlign = 'center';
    
    // 1行目（中サイズ）
    if (centerText1) {
        const fontSize1 = Math.min(canvas.width, canvas.height) * ParticleRingConfig.text.fontSize1; // 中サイズ
        const yOffset1 = centerText2 ? -fontSize1 * 0.6 : 0; // 2行目がある場合は上にずらす
        
        ctx.font = `bold ${fontSize1}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        
        // 1行目の影
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(centerText1, centerX + 2, centerY + yOffset1 + 2);
        
        // 1行目のメイン文字（グラデーション）
        const gradient1 = ctx.createLinearGradient(centerX - fontSize1, centerY + yOffset1 - fontSize1/2, centerX + fontSize1, centerY + yOffset1 + fontSize1/2);
        gradient1.addColorStop(0, '#ffffff');
        gradient1.addColorStop(0.3, '#aaccff');
        gradient1.addColorStop(0.7, '#ccddff');
        gradient1.addColorStop(1, '#ffffff');
        
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = gradient1;
        ctx.fillText(centerText1, centerX, centerY + yOffset1);
        
        // 1行目の輪郭
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText(centerText1, centerX, centerY + yOffset1);
    }
    
    // 2行目（小サイズ）
    if (centerText2) {
        const fontSize2 = Math.min(canvas.width, canvas.height) * ParticleRingConfig.text.fontSize2; // 小サイズ
        const yOffset2 = centerText1 ? fontSize2 * 1.2 : 0; // 1行目がある場合は下にずらす
        
        ctx.font = `${fontSize2}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        
        // 2行目の影
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(centerText2, centerX + 1, centerY + yOffset2 + 1);
        
        // 2行目のメイン文字（グラデーション）
        const gradient2 = ctx.createLinearGradient(centerX - fontSize2, centerY + yOffset2 - fontSize2/2, centerX + fontSize2, centerY + yOffset2 + fontSize2/2);
        gradient2.addColorStop(0, '#ffffff');
        gradient2.addColorStop(0.3, '#ddddff');
        gradient2.addColorStop(0.7, '#eeeeff');
        gradient2.addColorStop(1, '#ffffff');
        
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = gradient2;
        ctx.fillText(centerText2, centerX, centerY + yOffset2);
        
        // 2行目の輪郭
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.strokeText(centerText2, centerX, centerY + yOffset2);
    }
    
    ctx.restore();
}

// 中央文字更新関数
function updateCenterText() {
    const input1 = document.getElementById('centerText1');
    const input2 = document.getElementById('centerText2');
    centerText1 = input1.value.trim();
    centerText2 = input2.value.trim();
    if (centerText1 || centerText2) {
        showCenterText = true;
    }
}

// 文字表示切替関数
function toggleTextVisibility() {
    showCenterText = !showCenterText;
}

// パブリックAPI
const ParticleRingAPI = {
    // 基本制御
    start() {
        init();
        animate();
    },
    
    stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    },
    
    pause() {
        ParticleRingConfig.paused = true;
        paused = true;
    },
    
    resume() {
        ParticleRingConfig.paused = false;
        paused = false;
    },
    
    togglePause() {
        ParticleRingConfig.paused = !ParticleRingConfig.paused;
        paused = ParticleRingConfig.paused;
    },
    
    // 設定変更
    setRotationSpeed(speed) {
        ParticleRingConfig.rotationSpeed = speed;
        rotationSpeed = speed;
    },
    
    setPattern(patternIndex) {
        ParticleRingConfig.currentPattern = patternIndex % 4;
        currentPattern = ParticleRingConfig.currentPattern;
    },
    
    setRingWidth(width) {
        ParticleRingConfig.ringWidth = width;
        ringWidth = width;
        this.reinitialize();
    },
    
    setInnerRadius(radius) {
        ParticleRingConfig.innerRadius = radius;
        innerRadius = radius;
        this.reinitialize();
    },
    
    setParticleDensity(density) {
        ParticleRingConfig.particleDensity = density;
        ParticleRingConfig.particleCount.multiplier = density;
        particleDensity = density;
        this.reinitialize();
    },
    
    // 詳細な粒子数制御
    setParticleCountMode(mode) {
        ParticleRingConfig.particleCount.mode = mode;
        this.reinitialize();
    },
    
    setBaseParticleCount(baseCount, increment = null) {
        ParticleRingConfig.particleCount.baseCount = baseCount;
        if (increment !== null) {
            ParticleRingConfig.particleCount.increment = increment;
        }
        this.reinitialize();
    },
    
    setParticleMultiplier(multiplier) {
        ParticleRingConfig.particleCount.multiplier = multiplier;
        this.reinitialize();
    },
    
    setParticleCountPerRing(countsArray) {
        ParticleRingConfig.particleCount.mode = 'perRing';
        ParticleRingConfig.particleCount.perRingCounts = countsArray;
        this.reinitialize();
    },
    
    setParticleCountLimits(min, max) {
        ParticleRingConfig.particleCount.minParticles = min;
        ParticleRingConfig.particleCount.maxParticles = max;
        this.reinitialize();
    },
    
    // 絶対数で粒子数を設定
    setAbsoluteParticleCount(totalCount) {
        const ringCount = ParticleRingConfig.ringGaps.length - 1;
        const avgPerRing = Math.floor(totalCount / ringCount);
        ParticleRingConfig.particleCount.mode = 'absolute';
        ParticleRingConfig.particleCount.baseCount = avgPerRing;
        ParticleRingConfig.particleCount.increment = 0;
        this.reinitialize();
    },
    
    // 現在の粒子数を取得
    getCurrentParticleCount() {
        return particles.length;
    },
    
    // 環ごとの粒子数を取得
    getParticleCountPerRing() {
        const ringCounts = {};
        particles.forEach((particle, index) => {
            const ringIndex = Math.floor(particle.distance / 50); // 概算
            ringCounts[ringIndex] = (ringCounts[ringIndex] || 0) + 1;
        });
        return ringCounts;
    },
    
    setParticleSize(min, max) {
        ParticleRingConfig.particleSize.min = min;
        ParticleRingConfig.particleSize.max = max;
        this.reinitialize();
    },
    
    setColors(colorArray) {
        ParticleRingConfig.colors = colorArray;
        this.reinitialize();
    },
    
    // 接続線設定
    setConnections(enabled, maxDistance = 40, opacity = 0.08) {
        ParticleRingConfig.connections.enabled = enabled;
        ParticleRingConfig.connections.maxDistance = maxDistance;
        ParticleRingConfig.connections.opacity = opacity;
    },
    
    // 文字設定
    setText(line1 = '', line2 = '') {
        ParticleRingConfig.text.line1 = line1;
        ParticleRingConfig.text.line2 = line2;
        centerText1 = line1;
        centerText2 = line2;
        if (line1 || line2) {
            this.showText();
        }
    },
    
    showText() {
        ParticleRingConfig.text.visible = true;
        showCenterText = true;
    },
    
    hideText() {
        ParticleRingConfig.text.visible = false;
        showCenterText = false;
    },
    
    setTextSize(fontSize1, fontSize2) {
        ParticleRingConfig.text.fontSize1 = fontSize1;
        ParticleRingConfig.text.fontSize2 = fontSize2;
    },
    
    // 環の構造設定
    setRingGaps(gapsArray) {
        ParticleRingConfig.ringGaps = gapsArray;
        this.reinitialize();
    },
    
    // 再初期化
    reinitialize() {
        fadeInProgress = 0; // fade inをリセット
        init();
    },
    
    // キャンバスサイズ設定
    setCanvasSize(width, height) {
        setCanvasSize(width, height);
        this.reinitialize();
    },
    
    setCanvasWidth(width) {
        setCanvasSize(width, ParticleRingConfig.canvas.height);
        this.reinitialize();
    },
    
    setCanvasHeight(height) {
        setCanvasSize(ParticleRingConfig.canvas.width, height);
        this.reinitialize();
    },
    
    // キャンバスサイズを画面サイズの比率で設定
    setCanvasSizeRatio(widthRatio = 0.9, heightRatio = 0.9) {
        const width = window.innerWidth * widthRatio;
        const height = window.innerHeight * heightRatio;
        this.setCanvasSize(width, height);
    },
    
    // キャンバスサイズを固定値で設定
    setCanvasSizeFixed(width, height) {
        ParticleRingConfig.canvas.autoResize = false;
        this.setCanvasSize(width, height);
    },
    
    // 自動リサイズの有効/無効
    setAutoResize(enabled) {
        ParticleRingConfig.canvas.autoResize = enabled;
    },
    
    // スケーリングの有効/無効
    setScaling(enabled) {
        ParticleRingConfig.scaling.enabled = enabled;
        this.reinitialize();
    },
    
    // 基準サイズの設定
    setBaseSize(size) {
        ParticleRingConfig.scaling.baseSize = size;
        this.reinitialize();
    },
    
    // キャンバスサイズ取得
    getCanvasSize() {
        return {
            width: canvas.width,
            height: canvas.height
        };
    },
    
    // フルスクリーンサイズに設定
    setFullscreen() {
        this.setCanvasSize(window.innerWidth, window.innerHeight);
    },
    
    // 正方形キャンバスに設定
    setSquare(size) {
        this.setCanvasSize(size, size);
    },
    
    // アスペクト比を維持してサイズ設定
    setCanvasSizeWithAspectRatio(width, aspectRatio = 1) {
        const height = width / aspectRatio;
        this.setCanvasSize(width, height);
    },
    
    // 設定取得
    getConfig() {
        return { ...ParticleRingConfig };
    },
    
    // 設定一括更新
    updateConfig(newConfig) {
        Object.assign(ParticleRingConfig, newConfig);
        syncVariables();
        this.reinitialize();
    },
    
    // プリセット
    presets: {
        saturn() {
            return {
                rotationSpeed: 0.002,
                ringWidth: 15,
                innerRadius: 180,
                particleDensity: 2.0,
                particleCount: {
                    mode: 'density',
                    baseCount: 30,
                    increment: 7,
                    multiplier: 2.0
                },
                colors: ['#ffffff', '#f0f8ff', '#e6f3ff', '#ddeeff', '#ccddff', '#bbccff', '#aabbff', '#99aaff']
            };
        },
        
        galaxy() {
            return {
                rotationSpeed: 0.001,
                ringWidth: 25,
                innerRadius: 100,
                particleDensity: 3.0,
                particleCount: {
                    mode: 'density',
                    baseCount: 40,
                    increment: 10,
                    multiplier: 3.0
                },
                colors: ['#ffffff', '#ffddaa', '#ffccdd', '#ddccff', '#ccffcc', '#ffffcc']
            };
        },
        
        nebula() {
            return {
                rotationSpeed: 0.003,
                ringWidth: 20,
                innerRadius: 150,
                particleDensity: 1.5,
                particleCount: {
                    mode: 'density',
                    baseCount: 20,
                    increment: 5,
                    multiplier: 1.5
                },
                colors: ['#ff6b9d', '#c44569', '#f8b500', '#feca57', '#ff9ff3', '#54a0ff']
            };
        },
        
        // 新しいプリセット
        minimal() {
            return {
                particleCount: {
                    mode: 'absolute',
                    baseCount: 15,
                    increment: 3,
                    multiplier: 1.0
                }
            };
        },
        
        dense() {
            return {
                particleCount: {
                    mode: 'density',
                    baseCount: 50,
                    increment: 15,
                    multiplier: 4.0
                }
            };
        },
        
        custom(ringCounts) {
            return {
                particleCount: {
                    mode: 'perRing',
                    perRingCounts: ringCounts
                }
            };
        }
    }
};

// グローバルに公開
window.ParticleRingAPI = ParticleRingAPI;
window.ParticleRingConfig = ParticleRingConfig;

// 後方互換性のための関数
function changePattern() {
    ParticleRingAPI.setPattern((ParticleRingConfig.currentPattern + 1) % 4);
}

function togglePause() {
    ParticleRingAPI.togglePause();
}

function changeSpeed() {
    if (rotationSpeed === 0.002) {
        ParticleRingAPI.setRotationSpeed(0.005);
    } else if (rotationSpeed === 0.005) {
        ParticleRingAPI.setRotationSpeed(0.001);
    } else {
        ParticleRingAPI.setRotationSpeed(0.002);
    }
}

function adjustRingWidth() {
    if (ringWidth === 30) {
        ParticleRingAPI.setRingWidth(20);
    } else if (ringWidth === 20) {
        ParticleRingAPI.setRingWidth(40);
    } else {
        ParticleRingAPI.setRingWidth(30);
    }
}

function adjustParticleCount() {
    if (particleDensity === 3.0) {
        ParticleRingAPI.setParticleDensity(1.5);
    } else if (particleDensity === 1.5) {
        ParticleRingAPI.setParticleDensity(5.0);
    } else {
        ParticleRingAPI.setParticleDensity(3.0);
    }
}

function updateCenterText() {
    const input1 = document.getElementById('centerText1');
    const input2 = document.getElementById('centerText2');
    ParticleRingAPI.setText(input1.value.trim(), input2.value.trim());
}

function toggleTextVisibility() {
    if (showCenterText) {
        ParticleRingAPI.hideText();
    } else {
        ParticleRingAPI.showText();
    }
}

// 初期化時に変数を同期
syncVariables();

// 初期サイズ設定
setCanvasSize();

// 開始
init();
animate();