// ============================================================
// ジョブ名 → 表示するコンポーネントのマッピング
// deploy.yml の job: 名と完全一致させること
// ============================================================
const JOB_MAP = {
  'setup':             { regions: ['vpc', 'subnet-public', 'subnet-private'], comps: [], label: 'Setup', desc: '🏗️ VPC・サブネットを構築中\nネットワークの土台を作ります' },
  'deploy-network':    { regions: [], comps: ['alb', 'vpce'], label: 'Network', desc: '🔀 ALB・VPCエンドポイントを配置\nトラフィックの入口と内部通信経路を確立します' },
  'deploy-cognito':    { regions: [], comps: ['cognito'], label: 'Cognito', desc: '🔐 Cognitoを起動\nユーザー認証・ログイン管理を担います' },
  'deploy-dynamodb':   { regions: [], comps: ['dynamodb'], label: 'DynamoDB', desc: '🗄️ DynamoDBを起動\n高速なNoSQLデータベースです' },
  'deploy-ecr':        { regions: [], comps: ['ecr'], label: 'ECR', desc: '📦 ECRを起動\nDockerイメージを保管するレジストリです' },
  'deploy-ecs':        { regions: [], comps: ['ecs'], label: 'ECS', desc: '🚢 ECSを起動\nコンテナアプリケーションを実行します' },
  'deploy-lambda':     { regions: [], comps: ['lambda'], label: 'Lambda', desc: '⚡ Lambdaを起動\nサーバーレス関数で軽量処理を行います' },
  'deploy-apigw':      { regions: [], comps: ['apigw'], label: 'API GW', desc: '🌐 API Gatewayを起動\nAPIのリクエストを受け付け振り分けます' },
  'deploy-cloudfront': { regions: [], comps: ['cloudfront'], label: 'CloudFront', desc: '⚡ CloudFrontを起動\nCDNで世界中へ高速コンテンツ配信します' },
  'deploy-frontend':   { regions: [], comps: ['s3'], label: 'Frontend', desc: '🖥️ S3へフロントエンドをデプロイ\nWebサイトのファイルを配信します' },
};

const POLL_MS = 8000; // 8秒ごと（PAT有りなら短縮OK、無しなら60秒推奨）

let pollTimer = null;
let seenJobs  = new Set();

// ============================================================
// Live モード：GitHub APIポーリング開始
// ============================================================
function startLive() {
  resetAll();

  const url = document.getElementById('inp-url').value.trim();
  const pat  = document.getElementById('inp-pat').value.trim();
  const parsed = parseRunUrl(url);

  if (!parsed) {
    addLog('URLが正しくありません', 'error');
    return;
  }

  addLog(`Polling: ${parsed.owner}/${parsed.repo} run#${parsed.runId}`, 'info');
  setBadge('Polling…', 'running');

  async function tick() {
    const result = await fetchJobs(parsed.owner, parsed.repo, parsed.runId, pat);

    if (result === 'rate-limited') {
      addLog('Rate limit到達。PATを入力してください', 'warn');
      return;
    }
    if (result === 'error') {
      addLog('APIエラー。ポーリング停止', 'error');
      stopPolling();
      return;
    }
    if (result === 'done') {
      addLog('全ジョブ完了！', 'success');
      setBadge('Complete ✓', 'done');
      stopPolling();
    }
  }

  tick();
  pollTimer = setInterval(tick, POLL_MS);
}

// ============================================================
// GitHub API を叩いてジョブ状態を取得
// ============================================================
async function fetchJobs(owner, repo, runId, pat) {
  const headers = { 'Accept': 'application/vnd.github+json' };
  if (pat) headers['Authorization'] = `Bearer ${pat}`;

  let res;
  try {
    res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
      { headers }
    );
  } catch (e) {
    return 'error';
  }

  if (res.status === 403 || res.status === 429) return 'rate-limited';
  if (!res.ok) return 'error';

  const data = await res.json();
  let allCompleted = true;

  for (const job of data.jobs) {
    if (
      job.status     === 'completed' &&
      job.conclusion === 'success'   &&
      !seenJobs.has(job.id)
    ) {
      seenJobs.add(job.id);
      revealJob(job.name);
    }
    if (job.status !== 'completed') allCompleted = false;
  }

  return allCompleted ? 'done' : 'running';
}

// ============================================================
// Demo モード：タイマーで順番に表示
// ============================================================
function runDemo() {
  resetAll();
  setBadge('Demo中…', 'running');
  const delay = 1200;
  Object.keys(JOB_MAP).forEach((key, i) => {
    setTimeout(() => {
      revealJob(key);
      if (i === Object.keys(JOB_MAP).length - 1) {
        setBadge('Complete ✓', 'done');
      }
    }, delay * (i + 1));
  });
}

// ============================================================
// ジョブ名に対応するコンポーネントを表示
// ============================================================
function revealJob(jobName) {
  const mapping = JOB_MAP[jobName];
  if (!mapping) return;

  addLog(`✓ ${jobName}`, 'success');
  activateStep(jobName);

  if (mapping.desc) showToast(mapping.desc, jobName);

  mapping.regions.forEach(id => show(id));

  // 複数コンポーネントは少しずらして表示
  mapping.comps.forEach((id, i) => {
    setTimeout(() => show(id), i * 150);
  });
}

// ============================================================
// トースト通知 — アイコン近傍表示＋SVGコネクタ線
// ============================================================

// アクティブなポップアップを jobName → {popup, line} で管理
const activePopups = new Map();

// SVGオーバーレイ（線描画用）を取得 or 生成
function getLineSvg() {
  let svg = document.getElementById('popup-lines');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'popup-lines';
    svg.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;overflow:visible;';
    document.body.appendChild(svg);
  }
  return svg;
}

function showToast(message, jobName) {
  const stepEl = document.querySelector(`.step[data-job="${jobName}"]`);
  if (!stepEl) return;

  // 既存ポップは薄くする
  activePopups.forEach((val, key) => {
    if (key !== jobName) {
      val.popup.classList.add('toast-old');
      val.line && val.line.classList.add('line-old');
    }
  });

  // 既存の同jobポップを削除
  if (activePopups.has(jobName)) {
    activePopups.get(jobName).popup.remove();
    activePopups.get(jobName).line && activePopups.get(jobName).line.remove();
    activePopups.delete(jobName);
  }

  // ポップアップ要素を生成
  const popup = document.createElement('div');
  popup.className = 'toast';
  popup.dataset.job = jobName;
  popup.innerHTML = message.replace(/\n/g, '<br>');
  document.body.appendChild(popup);

  // アイコン位置を取得してポップアップを配置
  function positionPopup() {
    const sr   = stepEl.getBoundingClientRect();
    const pw   = 220;
    const gap  = 14; // アイコン下端からの距離

    // ポップアップ左端：アイコン中央に合わせ、画面端クリップ
    let left = sr.left + sr.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    const top = sr.bottom + gap;

    popup.style.cssText = `
      position: fixed;
      left: ${left}px;
      top: ${top}px;
      width: ${pw}px;
      z-index: 9999;
    `;

    // SVGコネクタ線を描画
    const svg  = getLineSvg();
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.dataset.job = jobName;

    const x1 = sr.left + sr.width / 2;
    const y1 = sr.bottom + 2;
    const x2 = left + pw / 2;
    const y2 = top - 2;
    // ベジェ曲線でなめらかに繋ぐ
    const cy  = (y1 + y2) / 2;
    line.setAttribute('d', `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`);
    line.setAttribute('stroke', '#f90');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke-dasharray', '5,3');
    line.style.transition = 'opacity 0.45s ease';
    svg.appendChild(line);

    activePopups.set(jobName, { popup, line });
  }

  // DOMレイアウト確定後に配置
  requestAnimationFrame(() => {
    requestAnimationFrame(positionPopup);
  });

  // 最大4枚まで（古いものから削除）
  if (activePopups.size > 4) {
    const firstKey = activePopups.keys().next().value;
    const old = activePopups.get(firstKey);
    old.popup.classList.add('toast-hide');
    old.line  && old.line.remove();
    setTimeout(() => old.popup.remove(), 500);
    activePopups.delete(firstKey);
  }
}

// ============================================================
// ステップバーの該当ステップをアクティブに
// ============================================================
// 並列ジョブ（dynamodb / ecr）は同時にactiveになれる
const PARALLEL_JOBS = new Set(['deploy-dynamodb', 'deploy-ecr', 'deploy-cloudfront']);

function activateStep(jobName) {
  const step = document.querySelector(`.step[data-job="${jobName}"]`);
  if (!step) return;

  const isParallel = PARALLEL_JOBS.has(jobName);

  if (!isParallel) {
    // 非並列ジョブ：既存のactiveをすべてdoneにしてから自分をactive
    document.querySelectorAll('.step.active').forEach(s => {
      s.classList.remove('active');
      s.classList.add('done');
    });
  }

  step.classList.remove('active');
  step.classList.add('active');
}

// ============================================================
// 要素を表示（hidden → visible）
// ============================================================
function show(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('visible');
}

// ============================================================
// ユーティリティ
// ============================================================
function parseRunUrl(url) {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/actions\/runs\/(\d+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2], runId: m[3] };
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

function resetAll() {
  stopPolling();
  seenJobs.clear();
  document.querySelectorAll('.comp, .box').forEach(el => {
    el.classList.remove('visible');
    el.classList.add('hidden');
  });
  document.querySelectorAll('.step').forEach(el => {
    el.classList.remove('active', 'done');
  });
  document.getElementById('log').innerHTML = '';
  document.getElementById('toast-container').innerHTML = '';
  // ポップアップとSVG線をすべて削除
  activePopups.forEach(val => {
    val.popup && val.popup.remove();
    val.line  && val.line.remove();
  });
  activePopups.clear();
  const svg = document.getElementById('popup-lines');
  if (svg) svg.innerHTML = '';
  setBadge('Idle', '');
}

function setBadge(text, state) {
  const b = document.getElementById('badge');
  b.textContent = text;
  b.className = state || '';
}

function addLog(msg, type) {
  const el   = document.getElementById('log');
  const line = document.createElement('div');
  const ts   = new Date().toLocaleTimeString('ja-JP');
  line.className = 'log-line ' + (type || 'info');
  line.textContent = `[${ts}] ${msg}`;
  el.prepend(line);
}