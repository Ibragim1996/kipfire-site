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
for (const entry of fs.readdirSync(path.join(root, 'journal'), { withFileTypes: true })) {
  if (entry.isDirectory() && !posts.some((post) => post.slug === entry.name)) {
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
