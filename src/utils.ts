import * as vscode from 'vscode';
import * as http from 'http';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn, spawnSync } from 'child_process';

export const MAX_HTTP_BODY = 5 * 1024 * 1024; // 5MB cap on /api/* request bodies
export const MAX_STREAM_BUFFER = 2 * 1024 * 1024; // 2MB cap on per-stream line buffer
export const MAX_FILE_NAME_LEN = 200;

export const _CONNECT_AI_VERSION = '2.89.156';

/**
 * Run a git subcommand with argv form (no shell interpolation).
 * Returns stdout on success, throws on failure. Never blocks longer than `timeout`.
 */
export function gitExec(args: string[], cwd: string, timeout = 15000): string {
    const res = spawnSync('git', args, {
        cwd,
        encoding: 'utf-8',
        timeout,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } // never block on credential prompt
    });
    if (res.error) throw res.error;
    if (res.status !== 0) {
        const err: any = new Error(`git ${args[0]} failed: ${res.stderr?.trim() || 'unknown'}`);
        err.code = res.status;
        err.stderr = res.stderr;
        throw err;
    }
    return res.stdout || '';
}

/** Same as gitExec but swallows errors and returns null. */
export function gitExecSafe(args: string[], cwd: string, timeout = 15000): string | null {
    try { return gitExec(args, cwd, timeout); }
    catch { return null; }
}

/**
 * Resolve `relPath` against `root` and confirm the result stays within `root`.
 * Returns absolute path on success, null if traversal is detected.
 */
export function safeResolveInside(root: string, relPath: string): string | null {
    if (typeof relPath !== 'string' || relPath.length === 0) return null;
    const resolvedRoot = path.resolve(root);
    const abs = path.resolve(resolvedRoot, relPath);
    const rel = path.relative(resolvedRoot, abs);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return abs;
}

const _SYSTEM_PATH_BLOCKLIST = [
    '/etc', '/System', '/usr/bin', '/usr/sbin', '/bin', '/sbin', '/var/db',
    '/private/etc', '/private/var/db',
];

export function _resolveFlexiblePath(input: string, root: string): { abs: string; reason?: string } | null {
    if (typeof input !== 'string') return null;
    let s = input.trim();
    if (!s) return null;
    s = s.replace(/\$\{?(HOME|USER|USERNAME|TMPDIR|TEMP|TMP|APPDATA|LOCALAPPDATA|USERPROFILE|HOMEDRIVE|HOMEPATH)\}?/g, (_m, k) => {
        if (k === 'HOME') return process.env.HOME || os.homedir();
        if (k === 'USER' || k === 'USERNAME') return process.env.USER || process.env.USERNAME || os.userInfo().username || _m;
        if (k === 'TMPDIR' || k === 'TEMP' || k === 'TMP') return process.env.TMPDIR || process.env.TEMP || process.env.TMP || os.tmpdir();
        const v = process.env[k]; return v || _m;
    });

    if (s === '~') s = os.homedir();
    else if (s.startsWith('~/') || s.startsWith('~\\')) s = path.join(os.homedir(), s.slice(2));
    let abs = path.isAbsolute(s) ? path.resolve(s) : path.resolve(root, s);
    abs = path.normalize(abs);
    for (const blocked of _SYSTEM_PATH_BLOCKLIST) {
        if (abs === blocked || abs.startsWith(blocked + path.sep)) {
            return { abs, reason: `시스템 보호 경로(${blocked})에는 쓰지 않습니다. 사용자 홈/워크스페이스 안의 경로를 지정해주세요.` };
        }
    }
    if (process.platform === 'win32') {
        const upper = abs.toUpperCase();
        const winDirs = [
            (process.env.WINDIR || 'C:\\WINDOWS').toUpperCase(),
            (process.env.PROGRAMFILES || 'C:\\PROGRAM FILES').toUpperCase(),
            (process.env['PROGRAMFILES(X86)'] || 'C:\\PROGRAM FILES (X86)').toUpperCase(),
            (process.env.PROGRAMDATA || 'C:\\PROGRAMDATA').toUpperCase(),
            (process.env.SYSTEMROOT || 'C:\\WINDOWS').toUpperCase(),
        ];
        for (const w of winDirs) {
            if (upper === w || upper.startsWith(w + path.sep)) {
                return { abs, reason: `시스템 보호 경로(${w})에는 쓰지 않습니다. Documents·Desktop·다른 사용자 폴더로 지정해주세요.` };
            }
        }
    }
    return { abs };
}

export function _renderUnifiedDiff(before: string, after: string, ctx: number = 3): string {
    if (before === after) return '';
    const a = before.split('\n');
    const b = after.split('\n');
    let prefixLen = 0;
    while (prefixLen < a.length && prefixLen < b.length && a[prefixLen] === b[prefixLen]) prefixLen++;
    let suffixLen = 0;
    while (
        suffixLen < a.length - prefixLen &&
        suffixLen < b.length - prefixLen &&
        a[a.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]
    ) suffixLen++;
    const aChanged = a.slice(prefixLen, a.length - suffixLen);
    const bChanged = b.slice(prefixLen, b.length - suffixLen);
    const ctxStart = Math.max(0, prefixLen - ctx);
    const ctxEndA = Math.min(a.length, a.length - suffixLen + ctx);
    const ctxEndB = Math.min(b.length, b.length - suffixLen + ctx);
    const out: string[] = [];
    out.push(`@@ -${ctxStart + 1},${ctxEndA - ctxStart} +${ctxStart + 1},${ctxEndB - ctxStart} @@`);
    for (let i = ctxStart; i < prefixLen; i++) out.push(' ' + a[i]);
    for (const line of aChanged) out.push('-' + line);
    for (const line of bChanged) out.push('+' + line);
    for (let i = a.length - suffixLen; i < ctxEndA; i++) out.push(' ' + a[i]);
    if (out.length > 52) {
        return out.slice(0, 52).join('\n') + '\n... (' + (out.length - 52) + '줄 더 있음)';
    }
    return out.join('\n');
}

export function _globMatch(pattern: string, root: string, maxResults: number = 200): string[] {
    const re = _globToRegex(pattern);
    const results: string[] = [];
    const skipDirs = new Set(['node_modules', '.git', '.next', 'dist', 'out', 'build', '.cache', '__pycache__', '.venv', 'venv', '.idea', '.vscode']);
    function walk(dir: string, depth: number) {
        if (results.length >= maxResults || depth > 12) return;
        let entries: fs.Dirent[];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
            if (results.length >= maxResults) return;
            if (e.name.startsWith('.git')) continue;
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (skipDirs.has(e.name)) continue;
                walk(full, depth + 1);
            } else if (e.isFile()) {
                const rel = path.relative(root, full).split(path.sep).join('/');
                if (re.test(rel)) results.push(rel);
            }
        }
    }
    walk(root, 0);
    return results;
}

function _globToRegex(pattern: string): RegExp {
    let re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    re = re.replace(/\*\*\//g, '__GLOBSTAR_SLASH__');
    re = re.replace(/\*\*/g, '__GLOBSTAR__');
    re = re.replace(/\*/g, '[^/]*');
    re = re.replace(/\?/g, '[^/]');
    re = re.replace(/__GLOBSTAR_SLASH__/g, '(?:.*/)?');
    re = re.replace(/__GLOBSTAR__/g, '.*');
    return new RegExp('^' + re + '$', 'i');
}

export function _grepFiles(pattern: string, root: string, fileGlob?: string): { file: string; matches: { line: number; text: string }[] }[] {
    let regex: RegExp;
    try { regex = new RegExp(pattern, 'i'); }
    catch { return []; }
    const fileRe = fileGlob ? _globToRegex(fileGlob) : null;
    const results: { file: string; matches: { line: number; text: string }[] }[] = [];
    const skipDirs = new Set(['node_modules', '.git', '.next', 'dist', 'out', 'build', '.cache', '__pycache__', '.venv', 'venv', '.idea', '.vscode']);
    const MAX_FILES = 50;
    const MAX_PER_FILE = 10;
    const MAX_FILE_BYTES = 1024 * 1024;  /* 1MB 초과 파일 스킵 */
    function walk(dir: string, depth: number) {
        if (results.length >= MAX_FILES || depth > 12) return;
        let entries: fs.Dirent[];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
            if (results.length >= MAX_FILES) return;
            if (e.name.startsWith('.git')) continue;
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (skipDirs.has(e.name)) continue;
                walk(full, depth + 1);
            } else if (e.isFile()) {
                const rel = path.relative(root, full).split(path.sep).join('/');
                if (fileRe && !fileRe.test(rel)) continue;
                try {
                    const stat = fs.statSync(full);
                    if (stat.size > MAX_FILE_BYTES) continue;
                    const buf = fs.readFileSync(full);
                    if (buf.slice(0, 512).includes(0)) continue;
                    const content = buf.toString('utf-8');
                    const lines = content.split('\n');
                    const matches: { line: number; text: string }[] = [];
                    for (let i = 0; i < lines.length; i++) {
                        if (regex.test(lines[i])) {
                            matches.push({ line: i + 1, text: lines[i].slice(0, 200) });
                            if (matches.length >= MAX_PER_FILE) break;
                        }
                    }
                    if (matches.length > 0) results.push({ file: rel, matches });
                } catch { /* skip */ }
            }
        }
    }
    walk(root, 0);
    return results;
}

export function _versionLessThan(a: string, b: string): boolean {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0);
    const pb = b.split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const ai = pa[i] || 0, bi = pb[i] || 0;
        if (ai !== bi) return ai < bi;
    }
    return false;
}

export async function _probeExistingBridge(): Promise<{ ours: boolean; version: string; pid: number }> {
    try {
        const r = await axios.get('http://127.0.0.1:4825/ping', { timeout: 1500 });
        const d = r.data;
        if (d && d.app === 'connect-ai-bridge') {
            return { ours: true, version: String(d.version || ''), pid: Number(d.pid || 0) };
        }
    } catch { /* not running or different app */ }
    return { ours: false, version: '', pid: 0 };
}

export function _killProcessesOnPort(port: number): number[] {
    const ourPid = process.pid;
    const killed: number[] = [];
    try {
        if (process.platform === 'win32') {
            const r = spawnSync('netstat', ['-ano'], { encoding: 'utf-8', timeout: 5000 });
            const lines = (r.stdout || '').split(/\r?\n/);
            const pidSet = new Set<number>();
            for (const line of lines) {
                if (!/LISTENING/i.test(line)) continue;
                if (!new RegExp(`[:.]${port}\\b`).test(line)) continue;
                const m = line.trim().split(/\s+/);
                const pid = parseInt(m[m.length - 1], 10);
                if (!isNaN(pid) && pid > 0 && pid !== ourPid) pidSet.add(pid);
            }
            for (const pid of pidSet) {
                const k = spawnSync('taskkill', ['/F', '/PID', String(pid)], { encoding: 'utf-8', timeout: 3000 });
                if (k.status === 0) killed.push(pid);
            }
        } else {
            const r = spawnSync('lsof', ['-ti', `:${port}`], { encoding: 'utf-8', timeout: 5000 });
            const pids = (r.stdout || '').split(/\r?\n/).map(s => parseInt(s.trim(), 10)).filter(p => !isNaN(p) && p > 0 && p !== ourPid);
            for (const pid of pids) {
                const k = spawnSync('kill', ['-9', String(pid)], { encoding: 'utf-8', timeout: 3000 });
                if (k.status === 0) killed.push(pid);
            }
        }
    } catch (e) {
        console.error('[Connect AI] _killProcessesOnPort 실패:', e);
    }
    return killed;
}

export function _revealInOsExplorer(targetPath: string): { ok: boolean; message: string } {
    try {
        if (!fs.existsSync(targetPath)) {
            return { ok: false, message: `존재하지 않는 경로: ${targetPath}` };
        }
        if (process.platform === 'darwin') {
            spawn('open', ['-R', targetPath], { detached: true, stdio: 'ignore' }).unref();
        } else if (process.platform === 'win32') {
            spawn('explorer.exe', ['/select,', targetPath], { detached: true, stdio: 'ignore' }).unref();
        } else {
            const dir = fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
            spawn('xdg-open', [dir], { detached: true, stdio: 'ignore' }).unref();
        }
        return { ok: true, message: `🗂 익스플로러 열림: ${targetPath}` };
    } catch (e: any) {
        return { ok: false, message: `익스플로러 열기 실패: ${e?.message || e}` };
    }
}

export function _openInDefaultApp(targetPath: string): { ok: boolean; message: string } {
    try {
        if (!fs.existsSync(targetPath)) {
            return { ok: false, message: `존재하지 않는 경로: ${targetPath}` };
        }
        if (process.platform === 'darwin') {
            spawn('open', [targetPath], { detached: true, stdio: 'ignore' }).unref();
        } else if (process.platform === 'win32') {
            spawn('cmd.exe', ['/c', 'start', '', targetPath], { detached: true, stdio: 'ignore' }).unref();
        } else {
            spawn('xdg-open', [targetPath], { detached: true, stdio: 'ignore' }).unref();
        }
        return { ok: true, message: `🚀 기본 앱으로 열림: ${targetPath}` };
    } catch (e: any) {
        return { ok: false, message: `파일 열기 실패: ${e?.message || e}` };
    }
}

export function safeBasename(name: string): string | null {
    if (typeof name !== 'string') return null;
    const base = path.basename(name).replace(/[\x00-\x1f\\/:*?"<>|]/g, '_').trim();
    if (!base || base === '.' || base === '..') return null;
    return base.slice(0, MAX_FILE_NAME_LEN);
}

export function readRequestBody(req: http.IncomingMessage, maxBytes = MAX_HTTP_BODY): Promise<string> {
    return new Promise((resolve, reject) => {
        let received = 0;
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => {
            received += chunk.length;
            if (received > maxBytes) {
                reject(new Error('BODY_TOO_LARGE'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
    });
}

export function validateGitRemoteUrl(url: string): string | null {
    if (typeof url !== 'string') return null;
    let trimmed = url.trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
    if (!trimmed || trimmed.length > 500) return null;
    const httpsLike = /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?\/[A-Za-z0-9._\-/]+?(\.git)?$/;
    const sshLike = /^git@[A-Za-z0-9.-]+:[A-Za-z0-9._\-/]+?(\.git)?$/;
    if (!httpsLike.test(trimmed) && !sshLike.test(trimmed)) return null;
    return trimmed;
}

let _gitAvailableCache: boolean | null = null;
export function isGitAvailable(): boolean {
    if (_gitAvailableCache !== null) return _gitAvailableCache;
    try {
        const res = spawnSync('git', ['--version'], { encoding: 'utf-8', timeout: 5000 });
        _gitAvailableCache = res.status === 0;
    } catch {
        _gitAvailableCache = false;
    }
    return _gitAvailableCache;
}

export type GitErrorKind = 'auth' | 'not_found' | 'rejected' | 'merge_conflict' | 'network' | 'unknown';

export function classifyGitError(stderr: string): { kind: GitErrorKind; message: string } {
    const s = (stderr || '').toLowerCase();
    if (
        s.includes('authentication failed') ||
        s.includes('could not read username') ||
        s.includes('terminal prompts disabled') ||
        s.includes('invalid credentials') ||
        s.includes('403')
    ) {
        return {
            kind: 'auth',
            message: 'GitHub 인증이 필요해요. 터미널에서 한 번 `git push`로 로그인 후 다시 시도해주세요.'
        };
    }
    if (s.includes('repository not found') || s.includes('does not appear to be a git repository') || s.includes('404')) {
        return { kind: 'not_found', message: '그 GitHub 저장소를 못 찾았어요. 주소가 정확한지 확인해주세요. (Private 저장소면 토큰 권한도 필요해요)' };
    }
    if (s.includes('rejected') && (s.includes('non-fast-forward') || s.includes('fetch first'))) {
        return { kind: 'rejected', message: 'GitHub에 새로운 내용이 있어요. 먼저 받아온 후 다시 시도해주세요.' };
    }
    if (s.includes('merge conflict') || s.includes('automatic merge failed') || s.includes('overwritten by merge')) {
        return { kind: 'merge_conflict', message: '같은 줄을 양쪽에서 다르게 고쳐서 자동으로 합칠 수 없어요. 동기화 메뉴에서 직접 골라주세요.' };
    }
    if (s.includes('could not resolve host') || s.includes('connection refused') || s.includes('network is unreachable') || s.includes('timed out')) {
        return { kind: 'network', message: '인터넷 연결을 확인해주세요.' };
    }
    return { kind: 'unknown', message: (stderr || '알 수 없는 오류').slice(0, 240) };
}

export function getRemoteDefaultBranch(cwd: string): string {
    const out = gitExecSafe(['ls-remote', '--symref', 'origin', 'HEAD'], cwd, 10000);
    if (out) {
        const m = out.match(/ref:\s+refs\/heads\/([^\s]+)\s+HEAD/);
        if (m) return m[1];
    }
    return 'main';
}

export function ensureInitialCommit(cwd: string) {
    if (gitExecSafe(['log', '-1'], cwd) !== null) return;
    const placeholder = path.join(cwd, '.gitkeep');
    if (!fs.existsSync(placeholder)) fs.writeFileSync(placeholder, '');
    gitExecSafe(['add', '.'], cwd);
    gitExecSafe(['commit', '--allow-empty', '-m', 'Initial brain commit'], cwd);
}

export function ensureBrainGitignore(brainDir: string) {
    const gi = path.join(brainDir, '.gitignore');
    if (fs.existsSync(gi)) return;
    const lines = [
        '# Connect AI auto-generated',
        '.DS_Store',
        '.obsidian/',
        '.trash/',
        'node_modules/',
        '*.tmp',
        '*.log',
        '.cache/',
        'Thumbs.db'
    ];
    try { fs.writeFileSync(gi, lines.join('\n') + '\n'); }
    catch { /* non-fatal */ }
}

export function gitRun(args: string[], cwd: string, timeout = 30000): { status: number | null; stdout: string; stderr: string; error?: Error } {
    const res = spawnSync('git', args, {
        cwd,
        encoding: 'utf-8',
        timeout,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });
    return {
        status: res.status,
        stdout: res.stdout || '',
        stderr: res.stderr || '',
        error: res.error
    };
}

let _pythonCmdCache: string | null = null;

export function _detectPythonCmd(): string {
    try {
        const cfg = vscode.workspace.getConfiguration('connectAiLab');
        const override = (cfg.get<string>('pythonPath') || '').trim();
        if (override) {
            try {
                const cp = require('child_process');
                const r = cp.spawnSync(override, ['--version'], { encoding: 'utf-8', timeout: 4000 });
                if (r.status === 0 || /python\s/i.test((r.stdout || '') + (r.stderr || ''))) {
                    return override;
                }
            } catch { /* fall through */ }
        }
    } catch { /* ignore */ }

    const candidates = process.platform === 'win32'
        ? ['py -3', 'python3', 'python', 'py']
        : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
    const cp = require('child_process');
    for (const cand of candidates) {
        try {
            const parts = cand.split(' ');
            const r = cp.spawnSync(parts[0], parts.slice(1).concat(['--version']), {
                encoding: 'utf-8', timeout: 4000
            });
            const out = (r.stdout || '') + (r.stderr || '');
            if (r.status === 0 && /python\s+3/i.test(out)) {
                return cand;
            }
            if (/python\s+3\.\d/i.test(out)) return cand;
        } catch { /* next candidate */ }
    }
    return process.platform === 'win32' ? 'python' : 'python3';
}

export function _pythonCmd(): string {
    if (_pythonCmdCache) return _pythonCmdCache;
    _pythonCmdCache = _detectPythonCmd();
    return _pythonCmdCache;
}

export function _invalidatePythonCmdCache() {
    _pythonCmdCache = null;
}

export function _isPythonMissing(exitCode: number, output: string): boolean {
    if (exitCode === 9009) return true;
    if (/Python was not found/i.test(output)) return true;
    if (/command not found.*python/i.test(output)) return true;
    if (/No such file or directory.*python/i.test(output)) return true;
    if (/ENOENT/i.test(output) && /python/i.test(output)) return true;
    return false;
}

export function _pythonMissingHint(): string {
    const detected = _pythonCmd();
    const platformHint = process.platform === 'win32'
        ? 'https://www.python.org/downloads/ 에서 Python 3 설치 (Add Python to PATH 체크박스 필수!)'
        : (process.platform === 'darwin' ? '`brew install python3`' : '`sudo apt install python3`');
    return `⚠️ Python 3 명령 실행 실패 (시도한 명령: \`${detected}\`).\n` +
           `🔧 해결:\n` +
           `  1. ${platformHint}\n` +
           `  2. 설치 후 안티그래비티/VS Code 완전 종료 → 재실행 (PATH 새로고침 필요)\n` +
           `  3. 또는 명령 팔레트 → "⚙️ 설정 열기" → \`connectAiLab.pythonPath\` 에 절대 경로 입력 (예: \`/usr/local/bin/python3\` 또는 \`C:\\\\Python311\\\\python.exe\`)\n` +
           `🔍 본인 PC 의 Python 경로 확인:\n` +
           (process.platform === 'win32' ? '  - PowerShell: \`Get-Command python, python3, py\`' : '  - 터미널: \`which python3 python py\`');
}

export function runCommandCaptured(
    cmd: string,
    cwd: string,
    onChunk: (text: string) => void,
    timeoutMs = 60000,
    captureStream: 'both' | 'stdout' = 'both'
): Promise<{ exitCode: number; output: string; timedOut: boolean }> {
    return new Promise((resolve) => {
        const child = spawn(cmd, {
            cwd,
            shell: true,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let buf = '';
        let timedOut = false;
        const append = (s: string) => {
            buf += s;
            if (buf.length > 30000) buf = buf.slice(-30000);
            onChunk(s);
        };
        child.stdout?.on('data', (d: Buffer) => append(d.toString()));
        if (captureStream === 'both') {
            child.stderr?.on('data', (d: Buffer) => append(d.toString()));
        }
        const killTimer = setTimeout(() => {
            timedOut = true;
            if (process.platform === 'win32' && child.pid) {
                try { spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).unref(); }
                catch { try { child.kill(); } catch { /* gone */ } }
            } else {
                try { child.kill('SIGTERM'); } catch { /* already dead */ }
                setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* gone */ } }, 2000);
            }
        }, timeoutMs);
        child.on('close', (code) => {
            clearTimeout(killTimer);
            resolve({ exitCode: code ?? -1, output: buf.slice(-15000), timedOut });
        });
        child.on('error', (e) => {
            clearTimeout(killTimer);
            resolve({ exitCode: -1, output: `[실행 오류] ${e.message}`, timedOut: false });
        });
    });
}

export function _isLMStudioEngine(ollamaBase: string): boolean {
    return ollamaBase.includes('1234') || ollamaBase.includes('v1');
}
