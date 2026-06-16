const { chromium } = require('playwright');

const BASE = `http://localhost:${process.env.PORT || 3000}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Admin@123';
const USER_EMAIL = process.env.USER_EMAIL || 'user@example.com';
const USER_PASS = process.env.USER_PASS || 'User@123';

let browser, context, page;

async function login(credential, password) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('input[autocomplete="username"]').fill(credential);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/home`, { timeout: 12000 });
}

async function logout() {
  await page.locator('button:has([data-testid="ExitToAppIcon"])').first().click();
  await page.waitForTimeout(2000);
}

async function waitForGrid() {
  await page.locator('.MuiDataGrid-root').waitFor({ timeout: 10000 });
}

(async () => {
  browser = await chromium.launch({ headless: false, slowMo: 200 });
  context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await context.newPage();

  let passed = 0, failed = 0;
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  PASS  ${name}`);
      results.push({ name, status: 'PASS' });
      passed++;
    } catch (e) {
      const msg = e.message.split('\n')[0];
      console.log(`  FAIL  ${name}`);
      console.log(`        ${msg}`);
      results.push({ name, status: 'FAIL', error: msg });
      failed++;
    }
  }

  console.log('\n── Admin flow ───────────────────────────────────');

  await test('Admin login', async () => {
    await login(ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForSelector('header', { timeout: 8000 });
  });

  await test('Home page loads', async () => {
    expect(page.url()).toContain('/home');
    await page.locator('h1, h2, h3, h4, h5, h6, [class*="Home"]').first().waitFor({ timeout: 6000 });
  });

  await test('Generate Code page loads', async () => {
    await page.goto(`${BASE}/generatecode`, { waitUntil: 'networkidle' });
    await page.locator('button', { hasText: /generate code/i }).waitFor({ timeout: 10000 });
  });

  await test('Generate a code (admin)', async () => {
    await page.locator('button', { hasText: /generate code/i }).click();
    await page.waitForTimeout(3000);
    const rows = await page.locator('[role="row"]').count();
    if (rows < 2) throw new Error(`Grid has ${rows} rows — expected at least 2`);
  });

  await test('All Codes list loads with data', async () => {
    await page.goto(`${BASE}/allcodelist`, { waitUntil: 'networkidle' });
    await waitForGrid();
    const rows = await page.locator('[role="row"]').count();
    if (rows < 2) throw new Error('No codes in grid');
  });

  await test('User Management page loads', async () => {
    await page.goto(`${BASE}/registeruser`, { waitUntil: 'networkidle' });
    await waitForGrid();
  });

  await test('Admin logout', async () => {
    await logout();
  });

  console.log('\n── User flow ────────────────────────────────────');

  await test('User login', async () => {
    await login(USER_EMAIL, USER_PASS);
    await page.waitForSelector('header', { timeout: 8000 });
  });

  await test('Generate Code page loads (user)', async () => {
    await page.goto(`${BASE}/generatecode`, { waitUntil: 'networkidle' });
    await page.locator('button', { hasText: /generate code/i }).waitFor({ timeout: 10000 });
  });

  await test('Generate a code (user)', async () => {
    await page.locator('button', { hasText: /generate code/i }).click();
    await page.waitForTimeout(3000);
    const rows = await page.locator('[role="row"]').count();
    if (rows < 2) throw new Error(`Grid has ${rows} rows — expected at least 2`);
  });

  await test('User blocked from Registration page', async () => {
    await page.goto(`${BASE}/registeruser`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const hasGrid = await page.locator('.MuiDataGrid-root').isVisible().catch(() => false);
    if (hasGrid) throw new Error('User can access admin Registration page');
  });

  await test('User logout', async () => {
    await page.goto(`${BASE}/generatecode`, { waitUntil: 'networkidle' });
    await page.locator('button', { hasText: /generate code/i }).waitFor({ timeout: 8000 });
    await logout();
  });

  console.log('\n── Reset credential flow ────────────────────────');

  await test('Reset credential page loads', async () => {
    await page.goto(`${BASE}/Resetcredential`, { waitUntil: 'networkidle' });
    await page.locator('input').first().waitFor({ timeout: 8000 });
  });

  await test('Email lookup responds', async () => {
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    // Step 2 appears (password field) on success, or error text on failure
    const passwordField = await page.locator('input[name="password"], input[type="password"]').isVisible().catch(() => false);
    const errorShown = await page.locator('text=/not found|failed|error|invalid/i').isVisible().catch(() => false);
    if (!passwordField && !errorShown) throw new Error('No visible response after email lookup');
  });

  console.log('\n─────────────────────────────────────────────────');
  console.log(`\n  Total: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}\n`);
  if (failed > 0) {
    console.log('Failed:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    console.log('');
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();

function expect(val) {
  return {
    toContain: (str) => { if (!val.includes(str)) throw new Error(`Expected "${val}" to contain "${str}"`); }
  };
}
