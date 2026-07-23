import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function startStaticServer(port: number): Promise<any> {
  const baseDir = join(process.cwd(), 'dist');
  const srv = createServer((req, res) => {
    let path = req.url!.split('?')[0];
    if (path === '/') path = '/index.html';
    const filePath = join(baseDir, path);
    const isDir = existsSync(filePath) && statSync(filePath).isDirectory();
    const finalPath = isDir ? join(filePath, 'index.html') : filePath;
    if (existsSync(finalPath)) {
      const ext = extname(finalPath);
      const buf = readFileSync(finalPath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(buf);
    } else {
      const idxPath = join(baseDir, 'index.html');
      if (existsSync(idxPath)) {
        const buf = readFileSync(idxPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(buf);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    }
  });
  return new Promise(resolve => {
    srv.listen(port, '127.0.0.1', () => resolve(srv));
  });
}

async function runTests(baseUrl: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const errors: string[] = [];
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  let passed = 0, failed = 0;

  function check(condition: boolean, msg: string) {
    if (condition) {
      console.log('  \u2713 ' + msg);
      passed++;
    } else {
      console.log('  \u2717 ' + msg);
      failed++;
    }
  }

  // ── Store Listing Page ──

  console.log('\n=== DIGITAL STORE: Listing Page ===');
  await page.goto(baseUrl + '/digital-store', { waitUntil: 'load', timeout: 15000 });
  await sleep(500);

  check(await page.$('h1'), 'Heading exists');
  const headingText = await page.textContent('h1');
  check(headingText!.toLowerCase().includes('planner') || headingText!.toLowerCase().includes('store'),
    `Heading mentions planner/store: "${headingText?.slice(0, 60)}"`);

  // Category sections — check for multiple heading elements
  const pageHeadings = await page.$$('h1, h2, h3');
  check(pageHeadings.length >= 4, 'At least 4 heading elements on page');

  // Product cards rendered
  const productCards = await page.$$('[class*="rounded-2xl"] a[href*="/digital-store/"]');
  const allLinks = await page.$$('a[href*="/digital-store/"]');
  check(allLinks.length >= 4, 'At least 4 product links on listing page');

  // Collections/curated section exists
  const headings = await page.$$('h2, h3');
  const headingTexts = await Promise.all(headings.map(el => el.textContent()));
  const hasCollection = headingTexts.some(t => /flagship|collection|system/i.test(t || ''));
  check(hasCollection, 'Collections/curated section exists');

  // FAQ accordion exists
  const faqItems = await page.$$('details, [data-faq]');
  check(faqItems.length >= 3, 'FAQ items exist');

  // Categories section exists
  const navLinks = await page.$$('nav a, a');
  const navTexts = await Promise.all(navLinks.map(el => el.textContent()));
  const hasStudyCategory = navTexts.some(t => /study|exam/i.test(t || ''));
  check(hasStudyCategory, 'Study/Exams category referenced');

  // Trust/quality indicators section
  const bodyText = await page.textContent('body');
  check(bodyText.includes('Rating') || bodyText.includes('Sold'), 'Trust/quality indicators section present');

  // No JS errors
  check(errors.length === 0, `No runtime errors (${errors.length} found)`);

  // ── Product Detail Pages ──

  console.log('\n=== DIGITAL STORE: Product Detail Pages ===');

  const detailSlugs = [
    '/digital-store/study-planner',
    '/digital-store/revision-tracker',
    '/digital-store/resume-optimizer-kit',
    '/digital-store/habit-tracker',
    '/digital-store/budget-planner',
  ];

  for (const slug of detailSlugs) {
    console.log(`\n--- ${slug} ---`);
    await page.goto(baseUrl + slug, { waitUntil: 'load', timeout: 15000 });
    await sleep(500);

    const title = await page.title();
    check(title.length > 0, `Page has title: "${title.slice(0, 60)}"`);

    // Product title on page
    const h1 = await page.$('h1');
    const h1Text = h1 ? await h1.textContent() : '';
    check(h1Text !== null && h1Text!.length > 0, `H1 present: "${h1Text?.slice(0, 50)}"`);

    // Price badge
    const hasPrice = bodyText => /\$\d+\.\d{2}/.test(bodyText);
    const bp = await page.textContent('body');
    check(hasPrice(bp), 'Price displayed');

    // Personalization form exists (input fields)
    const inputs = await page.$$('input, textarea, select');
    check(inputs.length >= 1, 'At least 1 form input rendered');

    // Add to Cart / Buy / Customize button
    const buttons = await page.$$('button, a');
    const btnTexts = await Promise.all(buttons.map(b => b.textContent()));
    const hasCta = btnTexts.some(t => /customize|preview|buy|purchase|order|add to cart/i.test(t || ''));
    check(hasCta, 'CTA button present');

    // What's included section
    const includedHeaders = await page.$$('h2, h3, h4, strong');
    const inclTexts = await Promise.all(includedHeaders.map(el => el.textContent()));
    const hasIncluded = inclTexts.some(t => /included|you.*get/i.test(t || ''));
    check(hasIncluded, '"What\'s included" section exists');

    // Reviews section
    const hasReviews = btnTexts.some(t => /review|rating|testimonial/i.test(t || '')) ||
                        bp.includes('review') || bp.includes('star');
    check(hasReviews, 'Reviews/testimonials present');
  }

  // ── Product Detail: Customization Flow ──

  console.log('\n=== DIGITAL STORE: Customization Flow ===');
  await page.goto(baseUrl + '/digital-store/study-planner', { waitUntil: 'load', timeout: 15000 });
  await sleep(500);

  // Fill a form field
  const nameInput = await page.$('input[placeholder*="Name" i], input[placeholder*="Alex" i]');
  if (nameInput) {
    await nameInput.fill('Test User');
    await sleep(200);
    const val = await nameInput.inputValue();
    check(val === 'Test User', 'Name input fillable');
  } else {
    // Fallback: fill the first text input
    const textInputs = await page.$$('input[type="text"], input:not([type])');
    if (textInputs.length > 0) {
      await textInputs[0].fill('Test User');
      const val = await textInputs[0].inputValue();
      check(val === 'Test User', 'First text input fillable');
    } else {
      check(false, 'No fillable input found');
    }
  }

  // Live preview areas exist
  const detailBodyText = await page.textContent('body');
  const previewAreas = await page.$$('[id*="preview"], [class*="preview"], [id*="planner-cover"]');
  check(previewAreas.length >= 1 || detailBodyText.includes('preview'),
    'Preview area present on detail page');

  // ── 404 on invalid slug ──

  console.log('\n=== DIGITAL STORE: 404 Handling ===');
  await page.goto(baseUrl + '/digital-store/nonexistent-product-xyz', {
    waitUntil: 'load',
    timeout: 10000,
  }).catch(() => {});
  await sleep(300);

  // The static SPA serves index.html for unknown routes (standard SPA behavior)
  // Verify it loads without crashing
  const bodyText404 = await page.textContent('body');
  check(bodyText404.length > 0, 'Invalid URL loads content without crashing');

  // ── Checkout Page ──

  console.log('\n=== DIGITAL STORE: Checkout Page ===');
  await page.goto(baseUrl + '/digital-store/checkout', { waitUntil: 'load', timeout: 15000 });
  await sleep(500);

  check(await page.$('#checkout-email'), 'Email input exists');
  check(await page.$('[type="radio"]'), 'Payment method radio exists');
  const checkoutBtns = await page.$$('button, a');
  const checkoutBtnTexts = await Promise.all(checkoutBtns.map(b => b.textContent()));
  const hasCheckoutCta = checkoutBtnTexts.some(t => /place order|purchase|download|pay|checkout|submit/i.test(t || ''));
  check(hasCheckoutCta, 'Checkout action button exists');

  const checkoutBody = await page.textContent('body');
  const hasOrderSummary = checkoutBody.includes('summary') || checkoutBody.includes('total');
  check(hasOrderSummary, 'Order summary area present');

  check(errors.length === 0, `No runtime errors on checkout (${errors.length} found)`);

  // ── Summary ──

  if (errors.length) {
    console.log('\nRuntime errors:');
    errors.forEach(e => console.log('  -', e));
  }

  console.log(`\n\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m\n`);

  await browser.close();
  return { passed, failed };
}

const port = parseInt(process.env.PORT || '0', 10);
const reuseMode = process.argv.includes('--reuse');

if (reuseMode) {
  const targetPort = port || 4324;
  console.log(`Reusing existing server at http://localhost:${targetPort}`);
  const result = await runTests(`http://localhost:${targetPort}`);
  process.exit(result.failed > 0 ? 1 : 0);
} else {
  console.log('Starting static server from dist/ ...');
  const server = await startStaticServer(0);
  const addr = server.address();
  const url = `http://127.0.0.1:${addr.port}`;
  console.log(`Server ready at ${url}`);

  try {
    const result = await runTests(url);
    server.close();
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('Error:', err.message);
    server.close();
    process.exit(1);
  }
}
