const fs = require('fs');
const path = require('path');
const P = require('../assets/publisher.js');

const root = path.join(__dirname, '..');
const posts = P.sortPosts(JSON.parse(fs.readFileSync(path.join(root, 'journal/posts.json'), 'utf8')).posts);

function write(rel, text) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
}

function patch(rel, name, inner) {
  const dest = path.join(root, rel);
  const next = P.patchMarked(fs.readFileSync(dest, 'utf8'), name, inner);
  fs.writeFileSync(dest, next);
}

const keep = new Set(['index.html', 'feed.xml', 'posts.json']);
// Old URLs kept as redirect stubs (do not delete)
const redirects = new Set(['how-to-start-making-content-on-camera-ideas-and-what-to-say']);
for (const entry of fs.readdirSync(path.join(root, 'journal'), { withFileTypes: true })) {
  if (entry.isDirectory() && !redirects.has(entry.name) && !posts.some((post) => post.slug === entry.name)) {
    fs.rmSync(path.join(root, 'journal', entry.name), { recursive: true, force: true });
  }
  if (entry.isFile() && !keep.has(entry.name)) {
    fs.unlinkSync(path.join(root, 'journal', entry.name));
  }
}

write('journal/index.html', P.renderListing(posts));
write('journal/feed.xml', P.renderFeed(posts));
for (const post of posts) {
  write(path.join('journal', post.slug, 'index.html'), P.renderArticle(post));
}
patch('index.html', 'journal:latest', P.latestBlock(posts));
patch('sitemap.xml', 'journal', P.sitemapBlock(posts));
patch('llms.txt', 'journal', P.llmsBlock(posts));
console.log('rendered', posts.length, 'posts');

// Tips: no clean-up runs in tips/, so tips/feed.xml is never deleted ('feed.xml' is also in keep).
// Tips (same as the owner desk does on publish)
const tips = P.sortPosts(JSON.parse(fs.readFileSync(path.join(root, 'tips/posts.json'), 'utf8')).posts);
for (const post of tips) {
  write(path.join('tips', post.slug, 'index.html'), P.renderTipArticle(post, tips));
}
write('tips/feed.xml', P.renderTipFeed(tips));
patch('tips/index.html', 'tips', P.tipListBlock(tips));
patch('sitemap.xml', 'tips', P.tipSitemapBlock(tips));
patch('llms.txt', 'tips', P.tipLlmsBlock(tips));

// Founder page
const profile = JSON.parse(fs.readFileSync(path.join(root, 'about/profile.json'), 'utf8'));
write('founder/index.html', P.renderFounder(profile));
console.log('rendered', tips.length, 'tips and founder');
