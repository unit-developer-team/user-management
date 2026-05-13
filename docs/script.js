// ============================================================
// ジョブ名 → 表示するコンポーネントのマッピング
// deploy.yml の job: 名と完全一致させること
// ============================================================
const JOB_MAP = {
  'setup':            { regions: ['r-vpc', 'r-pub', 'r-prv'], comps: [] },
  'deploy-network':   { regions: [], comps: ['c-alb', 'c-vpce'] },
  'deploy-cognito':   { regions: [], comps: ['c-cognito'] },
  'deploy-dynamodb':  { regions: [], comps: ['c-dynamodb'] },
  'deploy-ecr':       { regions: [], comps: ['c-ecr'] },
  'deploy-ecs':       { regions: [], comps: ['c-ecs'] },
  'deploy-lambda':    { regions: [], comps: ['c-lambda'] },
  'deploy-apigw':     { regions: [], comps: ['c-apigw'] },
  'deploy-cloudfront':{ regions: [], comps: ['c-cloudfront'] },
  'deploy-frontend':  { regions: [], comps: ['c-s3'] },
};

const POLL_MS = 8000; // 8秒ごと（PAT有りなら短縮OK）

let pollTimer = null;
let seenJobs  = new Set();

// ============================================================
// URL と PAT を解析してポーリング開始
// ============================================================
function startLive() {
  resetAll();

  const url = document.getElementById('run-url').value.trim();
  const pat  = document.getElementById('pat-input').value.trim();
  const parsed = parseRunUrl(url);

  if (!parsed) {
    addLog('URLが正しくありません', 'error');
    return;
  }

  addLog(`Polling start: ${parsed.owner}/${parsed.repo} run#${parsed.runId}`, 'info');
  setBadge('Polling…', 'running');

  async function tick() {
    const result = await fetchJobs(parsed.owner, parsed.repo, parsed.runId, pat);

    if (result === 'rate-limited') {
      addLog('Rate limit到達。しばらく待ちます…', 'warn');
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

  tick(); // 即時1回
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

  // レート制限チェック
  if (res.status === 403 || res.status === 429) return 'rate-limited';
  if (!res.ok) return 'error';

  const data = await res.json();
  let allCompleted = true;

  for (const job of data.jobs) {
    // 成功完了済み & まだ処理していない
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
// ジョブ名に対応するコンポーネントを表示
// ============================================================
function revealJob(jobName) {
  const mapping = JOB_MAP[jobName];
  if (!mapping) return;

  addLog(`✓ ${jobName}`, 'success');

  mapping.regions.forEach(id => {
    document.getElementById(id)?.classList.replace('hidden', 'visible');
  });
  mapping.comps.forEach(id => {
    document.getElementById(id)?.classList.replace('hidden', 'visible');
  });
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
  document.querySelectorAll('.comp, .region').forEach(el => {
    el.classList.replace('visible', 'hidden');
  });
  document.getElementById('log').innerHTML = '';
  setBadge('Idle', '');
}

function setBadge(text, state) {
  const b = document.getElementById('badge');
  b.textContent = text;
  b.className = state;
}

function addLog(msg, type = 'info') {
  const el   = document.getElementById('log');
  const line = document.createElement('div');
  const ts   = new Date().toLocaleTimeString('ja-JP');
  line.className = `log-line ${type}`;
  line.textContent = `[${ts}] ${msg}`;
  el.prepend(line); // 新しいログを上に
}