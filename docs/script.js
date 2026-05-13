// ============================================================
// ジョブ名 → 表示するコンポーネントのマッピング
// deploy.yml の job: 名と完全一致させること
// ============================================================
const JOB_MAP = {
  'setup':             { regions: ['vpc', 'subnet-public', 'subnet-private'], comps: [] },
  'deploy-network':    { regions: [], comps: ['alb', 'vpce'] },
  'deploy-cognito':    { regions: [], comps: ['cognito'] },
  'deploy-dynamodb':   { regions: [], comps: ['dynamodb'] },
  'deploy-ecr':        { regions: [], comps: ['ecr'] },
  'deploy-ecs':        { regions: [], comps: ['ecs'] },
  'deploy-lambda':     { regions: [], comps: ['lambda'] },
  'deploy-apigw':      { regions: [], comps: ['apigw'] },
  'deploy-cloudfront': { regions: [], comps: ['cloudfront'] },
  'deploy-frontend':   { regions: [], comps: ['s3'] },
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

  mapping.regions.forEach(id => show(id));

  // 複数コンポーネントは少しずらして表示
  mapping.comps.forEach((id, i) => {
    setTimeout(() => show(id), i * 150);
  });
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
  document.getElementById('log').innerHTML = '';
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