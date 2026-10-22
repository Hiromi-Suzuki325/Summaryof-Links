// ライダースジャケットのアヒルが地面の上で気まぐれに動くドット絵
(() => {
  const PALETTE = {
    K: "#2b2620", // 輪郭
    W: "#f4efe6", // 体
    E: "#111111", // 目
    O: "#f0a01c", // くちばし・足
    B: "#1f1f1f", // ジャケット
    S: "#a8a8a8", // スタッズ・ジッパー
  };

  const BODY = [
    ".....KKKKKK.....",
    "....KWWWWWWK....",
    "....KWWWWWWK....",
    "....KWEWWEWK....",
    "....KWWWWWWK....",
    "...KOOOOOOOOK...",
    "....KOOOOOOK....",
    ".....KWWWWK.....",
    ".....KWWWWK.....",
    "...KBBWWWWBBK...",
    "..KBSBWWWWBSBK..",
    ".KBBBBWWWWBBBBK.",
    ".KBBBSWWWWBBBBK.",
    ".KBBBSWWWWWBBBK.",
    ".KBBBBWWWWWBBBK.",
    "KWKBBWWWWWWBBKWK",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    "..KWWWWWWWWWWK..",
    "...KKKKKKKKKK...",
  ];

  // BODY の一部の行だけを差し替える表情・ポーズ（キーは行番号）
  const EYES = {
    front: { 3: "....KWEWWEWK...." },
    left: { 3: "....KEWWEWWK...." },
    right: { 3: "....KWWEWWEK...." },
    closed: { 3: "....KWWWWWWK....", 4: "....KWKWWKWK...." },
  };
  const WINGS_UP = {
    12: "KKBBBSWWWWBBBBKK",
    13: "KWKBBSWWWWWBBKWK",
    14: "KWKBBBWWWWWBBKWK",
    15: ".KKBBWWWWWWBBKK.",
  };

  const FEET = {
    stand: ["....OO....OO....", "...OOO....OOO..."],
    walk: [
      ["....OO....OOO...", "...OOO.........."],
      ["...OOO....OO....", "..........OOO..."],
    ],
  };

  const SPRITE_WIDTH = 16;
  const SPRITE_HEIGHT = BODY.length + 2;
  const PIXEL = 4; // ドット1つの表示サイズ(px)
  const HEADROOM = 7; // ジャンプと吹き出しのための頭上の余白(ドット数)
  const BLINK_DURATION = 140; // まばたき1回の長さ(ms)

  // 動きの種類。weight が大きいほど選ばれやすい
  const ACTIONS = {
    walk: { weight: 5, duration: [2000, 5000], speed: 28, stepInterval: 220 },
    run: { weight: 1, duration: [1000, 2000], speed: 72, stepInterval: 110 },
    idle: { weight: 3, duration: [1500, 3500] },
    quack: { weight: 1, duration: [1200, 1200] },
    hop: { weight: 1, duration: [600, 600], height: 4 },
    flap: { weight: 1, duration: [1200, 1200], flapInterval: 120 },
  };
  const QUACK_TEXT = "ガァ!"; // ひとりで鳴くとき
  const TAP_QUACK_TEXT = "Ghaa!"; // タップされて名乗るとき

  Object.values({ BODY, ...EYES, WINGS_UP, ...FEET }).forEach((rows) => {
    Object.values(rows)
      .flat()
      .forEach((row) => {
        if (row.length !== SPRITE_WIDTH) {
          throw new Error(`ドット絵の行幅が ${SPRITE_WIDTH} ではありません: ${row}`);
        }
      });
  });

  const stage = document.getElementById("duck-stage");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "ライダースジャケットを着たアヒルが歩いたり跳ねたりしている"
  );
  stage.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const spriteWidthPx = SPRITE_WIDTH * PIXEL;
  const groundY = (HEADROOM + SPRITE_HEIGHT) * PIXEL;
  const stageHeight = groundY + PIXEL * 2;
  const groundColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--border")
    .trim();

  let stageWidth = 0;
  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const style = getComputedStyle(stage);
    stageWidth =
      stage.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    canvas.width = stageWidth * ratio;
    canvas.height = stageHeight * ratio;
    canvas.style.width = `${stageWidth}px`;
    canvas.style.height = `${stageHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const snap = (value) => Math.round(value / PIXEL) * PIXEL;

  const drawRows = (rows, originX, originY) => {
    rows.forEach((row, y) => {
      [...row].forEach((key, x) => {
        if (key === ".") return;
        ctx.fillStyle = PALETTE[key];
        ctx.fillRect(originX + x * PIXEL, originY + y * PIXEL, PIXEL, PIXEL);
      });
    });
  };

  const drawBubble = (text, duckX, duckTop) => {
    ctx.font = "bold 12px ui-monospace, Menlo, monospace";
    const width = snap(ctx.measureText(text).width + PIXEL * 3);
    const height = PIXEL * 5;
    // 頭の右に出し、はみ出すなら左に出す
    let x = duckX + PIXEL * 12;
    if (x + width > stageWidth) x = duckX + PIXEL * 4 - width;
    const y = duckTop - PIXEL * 2;
    ctx.fillStyle = PALETTE.K;
    ctx.fillRect(x - PIXEL / 2, y - PIXEL / 2, width + PIXEL, height + PIXEL);
    ctx.fillStyle = PALETTE.W;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = PALETTE.K;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + width / 2, y + height / 2 + 1);
  };

  // pose: { x, lift, eyes, wingsUp, feet, bubble }
  const draw = (pose) => {
    ctx.clearRect(0, 0, stageWidth, stageHeight);

    // 点線の地面
    ctx.fillStyle = groundColor;
    for (let gx = 0; gx < stageWidth; gx += PIXEL * 3) {
      ctx.fillRect(gx, groundY, PIXEL * 2, PIXEL / 2);
    }

    // ドットの格子に合わせて位置を丸め、カクカク感を出す
    const x = snap(pose.x);
    const top = groundY - SPRITE_HEIGHT * PIXEL - snap(pose.lift);
    const overrides = { ...EYES[pose.eyes], ...(pose.wingsUp ? WINGS_UP : {}) };
    const body = BODY.map((row, i) => overrides[i] ?? row);
    drawRows([...body, ...pose.feet], x, top);
    if (pose.bubble) drawBubble(pose.bubble, x, top);
  };

  // ステージは script.js でリンク列の中へ移されることもあるため、
  // ウィンドウではなくステージ自体の幅の変化を見る
  let afterResize = () => {};
  resize();
  new ResizeObserver(() => {
    resize();
    afterResize();
  }).observe(stage);

  // 動きを減らす設定の人には、中央で立ち止まった姿だけを見せる
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    afterResize = () =>
      draw({
        x: (stageWidth - spriteWidthPx) / 2,
        lift: 0,
        eyes: "front",
        wingsUp: false,
        feet: FEET.stand,
        bubble: null,
      });
    afterResize();
    return;
  }

  const randomBetween = ([min, max]) => min + Math.random() * (max - min);

  const pickAction = () => {
    const entries = Object.entries(ACTIONS);
    const total = entries.reduce((sum, [, a]) => sum + a.weight, 0);
    let roll = Math.random() * total;
    for (const [name, action] of entries) {
      roll -= action.weight;
      if (roll < 0) return name;
    }
    return entries[entries.length - 1][0];
  };

  let x = 0;
  let direction = 1;
  let current = null;

  const startAction = (name, now, { tapped = false } = {}) => {
    const action = ACTIONS[name];
    if (name === "walk" || name === "run") {
      if (Math.random() < 0.3) direction *= -1;
    }
    current = {
      name,
      startedAt: now,
      endsAt: now + randomBetween(action.duration),
      tapped,
    };
  };

  // タップすると、その場で跳ねて名乗る
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => {
    startAction("quack", performance.now(), { tapped: true });
  });

  let nextBlinkAt = performance.now() + 2000;
  let last = performance.now();
  startAction("walk", last);

  const tick = (now) => {
    const elapsed = Math.min(now - last, 100); // タブ復帰時のワープを防ぐ
    last = now;
    if (now >= current.endsAt) startAction(pickAction(), now);

    const action = ACTIONS[current.name];
    const sinceStart = now - current.startedAt;
    const maxX = Math.max(stageWidth - spriteWidthPx, 0);
    const pose = {
      lift: 0,
      eyes: "front",
      wingsUp: false,
      feet: FEET.stand,
      bubble: null,
    };

    switch (current.name) {
      case "walk":
      case "run": {
        x += direction * action.speed * (elapsed / 1000);
        if (x >= maxX || x <= 0) direction *= -1;
        pose.eyes = direction > 0 ? "right" : "left";
        pose.feet = FEET.walk[Math.floor(now / action.stepInterval) % 2];
        break;
      }
      case "idle":
        // きょろきょろ見回す
        pose.eyes = ["front", "left", "front", "right"][
          Math.floor(sinceStart / 700) % 4
        ];
        break;
      case "quack":
        pose.bubble = current.tapped ? TAP_QUACK_TEXT : QUACK_TEXT;
        if (current.tapped && sinceStart < ACTIONS.hop.duration[0]) {
          const t = sinceStart / ACTIONS.hop.duration[0];
          pose.lift = Math.sin(Math.PI * t) * ACTIONS.hop.height * PIXEL;
        }
        break;
      case "hop": {
        const t = sinceStart / action.duration[0];
        pose.lift = Math.sin(Math.PI * Math.min(t, 1)) * action.height * PIXEL;
        break;
      }
      case "flap":
        pose.wingsUp = Math.floor(sinceStart / action.flapInterval) % 2 === 0;
        break;
      default:
        throw new Error(`未知の動き: ${current.name}`);
    }

    x = Math.min(Math.max(x, 0), maxX);

    // まばたきは動きと関係なくときどき入れる
    if (now >= nextBlinkAt) {
      if (now < nextBlinkAt + BLINK_DURATION) pose.eyes = "closed";
      else nextBlinkAt = now + 2000 + Math.random() * 3000;
    }

    draw({ x, ...pose });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
