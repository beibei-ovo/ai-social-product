import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const entry = process.env.BACKSTORY_TEST_URL || new URL('../index.html', import.meta.url).href;
const screenshotDir = process.env.BACKSTORY_SCREENSHOTS;
const browserPath = process.env.BACKSTORY_BROWSER || join(
  process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
  'Microsoft', 'Edge', 'Application', 'msedge.exe'
);
await access(browserPath);

async function until(condition, label, timeout = 6500) {
  const end = Date.now() + timeout;
  do {
    const result = await condition();
    if (result) return result;
    await delay(40);
  } while (Date.now() < end);
  throw new Error(`Timed out: ${label}`);
}

const tempRoot = await realpath(tmpdir());
const profile = await mkdtemp(join(tempRoot, 'backstory-test-'));
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--use-fake-device-for-media-stream',
  '--use-fake-ui-for-media-stream', 'about:blank'
], { windowsHide: true, stdio: 'ignore' });
const stopped = once(browser, 'exit');

let socket;
try {
  const port = await until(async () => {
    const data = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
    return data.split('\n')[0];
  }, 'browser debugging port');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const tab = tabs.find(target => target.type === 'page');
  assert.ok(tab, 'Browser opened a page');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await once(socket, 'open');

  let sequence = 0;
  const calls = new Map();
  const runtimeErrors = [];
  socket.addEventListener('message', event => {
    const packet = JSON.parse(event.data);
    if (packet.method === 'Runtime.exceptionThrown') runtimeErrors.push(packet.params.exceptionDetails.text);
    const call = calls.get(packet.id);
    if (!call) return;
    calls.delete(packet.id);
    if (packet.error) call.reject(new Error(packet.error.message));
    else call.resolve(packet.result);
  });

  function cdp(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      calls.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!response.exceptionDetails, response.exceptionDetails?.exception?.description || expression);
    return response.result.value;
  }

  const waitFor = expression => until(() => evaluate(expression), expression);
  const hasText = (text, scope = '#screen') => waitFor(`document.querySelector(${JSON.stringify(scope)})?.innerText.includes(${JSON.stringify(text)})`);
  const q = selector => `document.querySelector(${JSON.stringify(selector)})`;
  const click = async selector => { await waitFor(`Boolean(${q(selector)})`); await evaluate(`${q(selector)}.click()`); };
  const change = (selector, value) => evaluate(`{
    const field = ${q(selector)};
    field.value = ${JSON.stringify(value)};
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }`);
  const submit = selector => evaluate(`${q(selector)}.requestSubmit()`);
  const act = (action, id, scope = '#screen') => click(`${scope} [data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`);
  const nav = action => act(action, null, '#navigation');
  const selectRole = async role => { await act('demo', null, '#topbar'); await act('switch-role', role, '#dialog'); };
  const find = async question => { await change('#find-form input', question); await submit('#find-form'); };
  const ask = async question => {
    if (!(await evaluate('Boolean(document.querySelector("#ask-form"))'))) await act('story-tab', 'ask');
    await change('#ask-form input', question);
    await submit('#ask-form');
  };
  const openMayaStory = () => act('open-story', 'solo');
  const sendLatestQuestion = async () => {
    await act('confirm-ask', null, '#story-messages .message:last-child');
    await act('confirm', null, '#dialog');
    await hasText('Waiting for Maya');
  };

  async function screenshot(name) {
    if (!screenshotDir) return;
    await mkdir(screenshotDir, { recursive: true });
    const result = await cdp('Page.captureScreenshot', { format: 'png' });
    await writeFile(join(screenshotDir, `${name}.png`), Buffer.from(result.data, 'base64'));
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1150, height: 850, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: entry });
  await hasText('What are you curious about?');
  await screenshot('backstory-desktop');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate('document.documentElement.scrollWidth'), 320, 'Compact phone layout has no horizontal overflow');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true });
  assert.equal(await evaluate('document.documentElement.scrollWidth'), 390, 'Phone layout has no horizontal overflow');
  await screenshot('backstory-mobile');

  // AC-01 to AC-03: all topics, cross-circle matching, manual follow, and fallback states.
  for (const topic of ['gaming', 'life', 'travel', 'work', 'hobbies', 'relationships']) {
    await act('circle', topic);
    assert.ok(await evaluate('document.querySelectorAll("#screen .story-card").length >= 3'), `${topic} has at least three stories`);
    await click('#screen .story-card');
    await hasText('Human post');
    await hasText('Human comment', '#discussion');
    await hasText('AI reply', '#discussion');
    await hasText('Human · Author', '#discussion');
    await nav('explore');
  }
  await find('I’m too tired for ranked games after work, but I still want to play with friends.');
  await hasText('Cozy Co-op', '#search-results');
  await hasText('Staying in Touch', '#search-results');
  assert.deepEqual(await evaluate('state.follows.alex'), []);
  await screenshot('backstory-matching');
  await act('circle', 'gaming', '#search-results');
  await act('follow', 'gaming');
  await nav('me');
  await hasText('Cozy Co-op');
  await act('follow', 'gaming');
  assert.deepEqual(await evaluate('state.follows.alex'), []);
  await nav('explore');
  await find('help');
  await hasText('What kind of experience do you want to hear about?');
  await find('quantum chromodynamics');
  await hasText('No close match yet');
  await hasText('Browse topics');
  console.log('PASS AC-01 to AC-03: discovery, matching, and explicit follow');

  // AC-06 to AC-09: original audio, partial answers, retry, privacy, and duplicate sends.
  await openMayaStory();
  await screenshot('backstory-discussion');
  await act('comment-reply', 'solo-sample-comment');
  await hasText('Replying to Nia');
  const publicComment = 'I tried that on my first night too. <em>It helped.</em>';
  await change('#comment-form input', publicComment);
  await submit('#comment-form');
  await hasText(publicComment, '#discussion .comment-replies');
  assert.equal(await evaluate('document.querySelectorAll("#discussion em").length'), 0, 'Public comments escape markup');
  await selectRole('guest');
  await hasText(publicComment, '#discussion');
  assert.equal(await evaluate('Boolean(document.querySelector("#comment-form"))'), false, 'Guest can read public comments');
  await cdp('Page.reload');
  await hasText(publicComment, '#discussion');
  await selectRole('alex');
  await act('copy-link', 'solo');
  const storyLink = await evaluate('document.querySelector("#story-link").value');
  assert.equal(new URL(storyLink).hash, '#story=solo');
  await act('close-dialog', null, '#dialog');
  await cdp('Page.navigate', { url: storyLink });
  await hasText('The quiet hit me after work.');
  await act('play-story', 'solo');
  await waitFor('activeAudio?.player.currentTime > 0');
  await act('play-story', 'solo');
  assert.equal(await evaluate('activeAudio.player.paused'), true);
  await ask('When did it feel hardest?');
  await hasText('AI · From Maya’s story');
  await act('play-source', 'solo-1');
  await waitFor('activeAudio?.player.currentTime > 0');
  await screenshot('backstory-quoted-answer');
  await ask('What helped in the first week and what changed after three months?');
  await hasText('doesn’t cover the rest');
  await act('confirm-ask', null, '#story-messages .message:last-child');
  await hasText('what changed after three months?', '#dialog');
  assert.equal(await evaluate('state.questions.length'), 0);
  await act('close-dialog', null, '#dialog');
  await act('demo', null, '#topbar');
  await act('fail-next', null, '#dialog');
  await ask('What changed after three months?');
  await hasText('Your question is still here');
  assert.equal(await evaluate('document.querySelector("#ask-form input").value'), 'What changed after three months?');
  assert.equal(await evaluate('state.questions.length'), 0);
  await submit('#ask-form');
  await sendLatestQuestion();
  const privateId = await evaluate('page.id');
  await act('open-story', 'solo');
  await ask('What changed after three months?');
  await sendLatestQuestion();
  assert.equal(await evaluate('state.questions.length'), 1);
  await selectRole('guest');
  await evaluate(`location.hash = ${JSON.stringify(`#thread=${privateId}`)}`);
  await hasText('Conversation unavailable');
  assert.equal(await evaluate('document.querySelector("#screen").innerText.includes("three months")'), false);
  console.log('PASS AC-06 to AC-09: grounded answers, audio, partial transfer, retries, and private access');

  // AC-10 to AC-12: an author response, a public update, and real people replying.
  await selectRole('maya');
  await nav('inbox');
  await act('open-thread', privateId);
  await act('sample-reply', privateId);
  await submit('#reply-form');
  await hasText('only be visible', '#dialog');
  await act('confirm', null, '#dialog');
  await hasText('Maya replied');
  await selectRole('guest');
  await nav('explore');
  await openMayaStory();
  await ask('What changed after three months?');
  await hasText('doesn’t cover this question yet');
  assert.equal(await evaluate('document.querySelector("#screen").innerText.includes("familiar rhythm")'), false);
  await selectRole('alex');
  await nav('inbox');
  await hasText('Maya · Replied · New');
  await act('open-thread', privateId);
  await hasText('Maya replied');
  await change('#followup-form input', 'Thanks. I just moved too.');
  await submit('#followup-form');
  await hasText('Thanks. I just moved too.');
  await act('share-linked', privateId);
  await change('#share-form input[name="title"]', 'What my first month taught me');
  await change('#share-form textarea', 'I made a habit of calling a friend after dinner.\n\nThe spare key stays in a yellow bowl.');
  await submit('#share-form');
  assert.equal(await evaluate('document.querySelectorAll("#dialog input:checked").length'), 0);
  await click('#dialog input[value="0"]');
  await act('confirm', null, '#dialog');
  await hasText('What my first month taught me');
  await hasText('In response to');
  assert.deepEqual(await evaluate('getStory(page.id).sources.map(source => source.enabled)'), [true, false]);
  await selectRole('maya');
  await nav('inbox');
  await act('open-thread', privateId);
  await hasText('Related story · What my first month taught me');
  await selectRole('alex');
  await nav('explore');
  await openMayaStory();
  await ask('Did you still feel the same after three months?');
  await sendLatestQuestion();
  const publicId = await evaluate('page.id');
  await act('switch-inbox', 'maya');
  await act('open-thread', publicId);
  await act('sample-reply', publicId);
  await click('#reply-form input[name="publish"]');
  await submit('#reply-form');
  await hasText('original question remains private', '#dialog');
  await act('confirm', null, '#dialog');
  await selectRole('guest');
  await nav('explore');
  await openMayaStory();
  await ask('What changed after three months?');
  await hasText('familiar rhythm', '#story-messages');
  assert.equal(await evaluate('document.querySelector("#screen").innerText.includes("Did you still feel the same")'), false);
  await selectRole('alex');
  await ask('Were your neighbors loud?');
  await sendLatestQuestion();
  const declinedId = await evaluate('page.id');
  await act('switch-inbox', 'maya');
  await act('open-thread', declinedId);
  await act('confirm-pass', declinedId);
  await act('confirm', null, '#dialog');
  await selectRole('alex');
  await nav('inbox');
  await hasText('Maya · Passed · New');
  console.log('PASS AC-10 to AC-12: private/public author replies, decline, and linked experiences');

  // AC-04, AC-05, AC-13, and the withdrawal part of AC-01.
  await nav('share');
  await screenshot('backstory-composer');
  await act('record', 'story');
  await hasText('Recording…');
  await delay(350);
  await act('stop-recording', 'story');
  await hasText('Recording ready');
  await waitFor('Boolean(document.querySelector("#share-form audio"))');
  await change('#share-form input[name="title"]', 'A spoken note');
  await change('#share-form textarea', 'I noticed that a small routine made my place feel like home.');
  await submit('#share-form');
  await waitFor('Boolean(document.querySelector("#dialog audio"))');
  await act('confirm', null, '#dialog');
  await hasText('Recorded in the demo');
  await nav('share');
  await evaluate(`navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied by test', 'NotAllowedError'); }`);
  await act('record', 'story');
  await hasText('Microphone unavailable');
  await change('#share-form input[name="title"]', 'A written travel note');
  await change('#share-form textarea', 'A small plan made my solo trip easier.');
  await submit('#share-form');
  await act('confirm', null, '#dialog');
  await hasText('A written travel note');
  await selectRole('maya');
  await nav('explore');
  await openMayaStory();
  await act('manage', 'solo');
  await click('#source-form input[value="solo-1"]');
  await submit('#source-form');
  await selectRole('alex');
  await act('story-tab', 'ask');
  await hasText('Source access was withdrawn');
  await ask('When did it feel hardest?');
  await hasText('doesn’t cover this question yet', '#story-messages .message:last-child');
  await selectRole('maya');
  await act('manage', 'solo');
  await act('confirm-withdraw', 'solo');
  await act('confirm', null, '#dialog');
  await hasText('Story unavailable');
  assert.equal(await evaluate('location.hash'), '#story=solo');
  await act('demo', null, '#topbar');
  await act('confirm-reset', null, '#dialog');
  await act('confirm', null, '#dialog');
  await hasText('What are you curious about?');
  assert.deepEqual(await evaluate('[state.role, state.questions.length, state.stories.length, state.comments.length]'), ['alex', 0, 18, 0]);

  // AC-14 and AC-15: original demo state receives new content without losing old permissions.
  await evaluate(`{
    const old = freshState();
    old.stories = structuredClone(originalStories);
    old.stories[0].sources[1].enabled = false;
    old.stories.find(story => story.id === 'first-job').withdrawn = true;
    old.follows = { alex: ['gaming'], maya: [] };
    delete old.comments;
    localStorage.setItem(legacyStorageKey, JSON.stringify(old));
    localStorage.removeItem(storageKey);
  }`);
  await cdp('Page.reload');
  await hasText('Your circles');
  assert.equal(await evaluate('state.stories.length'), 18);
  assert.equal(await evaluate('Boolean(getStory("first-job"))'), false);
  await openMayaStory();
  await hasText('Source access was withdrawn', '#discussion .twin');
  assert.equal(await evaluate('Boolean(document.querySelector("#discussion .twin [data-action=play-source]"))'), false);
  assert.deepEqual(runtimeErrors, [], 'No uncaught browser errors');
  console.log('PASS AC-04, AC-05, AC-13: recording and fallback, revocation, withdrawal, and reset');
  console.log('PASS AC-14 and AC-15: public roles, nested comments, revoked quotes, and previous demo data');
  console.log('All 15 Backstory demo acceptance cases passed.');
} finally {
  socket?.close();
  browser.kill();
  await Promise.race([stopped, delay(2500)]);
  const resolved = await realpath(profile);
  if (relative(tempRoot, resolved) === basename(resolved) && basename(resolved).startsWith('backstory-test-')) {
    await rm(resolved, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 }).catch(() => {});
  }
}
