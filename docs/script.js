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

  if (mapping.desc) showToast(mapping.desc);

  mapping.regions.forEach(id => show(id));

  // 複数コンポーネントは少しずらして表示
  mapping.comps.forEach((id, i) => {
    setTimeout(() => show(id), i * 150);
  });
}

// ============================================================
// トースト通知（サービス説明） — スタック式
// ============================================================
function showToast(message) {
  const container = document.getElementById('toast-container');

  // 既存のトーストを「古い」スタイルに（薄く縮小）
  container.querySelectorAll('.toast:not(.toast-old)').forEach(t => {
    t.classList.add('toast-old');
  });

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message.replace(/\n/g, '<br>');
  container.appendChild(toast);

  // 最大3枚まで。古いものから削除
  const toasts = container.querySelectorAll('.toast');
  if (toasts.length > 3) {
    const oldest = toasts[0];
    oldest.classList.add('toast-hide');
    setTimeout(() => oldest.remove(), 500);
  }
}

// ============================================================
// ステップバーの該当ステップをアクティブに
// ============================================================
// 並列ジョブ（dynamodb / ecr）は同時にactiveになれる
const PARALLEL_JOBS = new Set(['deploy-dynamodb', 'deploy-ecr']);

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