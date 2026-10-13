/* Shared by the owner desk (browser) and scripts/render-journal.cjs. */
(function (root) {
  var OWNER = 'Ibragim1996';
  var REPO = 'kipfire-site';
  var SITE = 'https://kipfire.com';
  var KINDS = { news: 'News', update: 'Update', tip: 'Tip' };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function jsonLd(obj) {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
  }

  function prettyDate(iso) {
    var parts = String(iso || '').split('-');
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    if (!y || !m || !d) return iso || '';
    return MONTHS[m - 1] + ' ' + d + ', ' + y;
  }

  function slugify(title) {
    var slug = String(title || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/g, '');
    return slug || 'note';
  }

  function inline(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function bodyToHtml(text) {
    var blocks = String(text || '').replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
    return blocks.filter(Boolean).map(function (block) {
      var lines = block.split('\n').filter(function (line) { return line.length; });
      if (!lines.length) return '';
      if (lines.length === 1 && lines[0].indexOf('## ') === 0) {
        return '<h2>' + inline(lines[0].slice(3)) + '</h2>';
      }
      if (lines.every(function (line) { return line.indexOf('- ') === 0; })) {
        return '<ul>' + lines.map(function (line) {
          return '<li>' + inline(line.slice(2)) + '</li>';
        }).join('') + '</ul>';
      }
      return '<p>' + lines.map(inline).join('<br>') + '</p>';
    }).join('\n');
  }

  function sortPosts(posts) {
    return posts.slice().sort(function (a, b) {
      if (a.date === b.date) return a.slug < b.slug ? 1 : -1;
      return a.date < b.date ? 1 : -1;
    });
  }

  function kindLabel(kind) {
    return KINDS[kind] || 'News';
  }

  function nav(prefix, current) {
    var items = [
      ['no-idea-what-to-post/', 'No idea what to post?'],
      ['faq/', 'FAQ'],
      ['tips/', 'Content tips'],
      ['journal/', 'News'],
      ['founder/', 'Founder'],
      ['about/', 'About']
    ];
    return items.map(function (item) {
      var here = current === item[0] ? ' aria-current="page"' : '';
      return '<a href="' + prefix + item[0] + '"' + here + '>' + item[1] + '</a>';
    }).join('');
  }

  function footer(prefix) {
    return '<footer class="site-foot"><div class="wrap"><div>' +
      '<p><strong>KipFire</strong>: content ideas for Reels, TikTok and YouTube Shorts.</p>' +
      '<p>Available on iPhone and iPad. Android is coming soon.</p>' +
      '<p>Support: <a href="mailto:support@kipfire.com">support@kipfire.com</a></p></div>' +
      '<nav class="foot-links" aria-label="Footer">' +
      '<a href="' + prefix + 'founder/">Founder</a>' +
      '<a href="' + prefix + 'about/">About</a>' +
      '<a href="' + prefix + 'no-idea-what-to-post/">No idea what to post?</a>' +
      '<a href="' + prefix + 'faq/">FAQ</a>' +
      '<a href="' + prefix + 'tips/">Content tips</a>' +
      '<a href="' + prefix + 'journal/">News</a>' +
      '<a href="' + prefix + 'privacy/">Privacy Policy</a>' +
      '<a href="' + prefix + 'terms/">Terms of Use</a></nav>' +
      '<p>&copy; 2026 KipFire. All rights reserved.</p></div></footer>' +
      '<div class="dl-bar"><a class="btn btn-primary" href="https://apps.apple.com/us/app/kipfire/id6755289956" rel="noopener">' +
      SVG + 'Get KipFire free on the App Store</a></div>';
  }

  function head(opts) {
    var prefix = opts.prefix;
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(opts.title) + '</title>\n' +
      '<meta name="description" content="' + esc(opts.description) + '">\n' +
      '<link rel="canonical" href="' + esc(opts.canonical) + '">\n' +
      '<meta name="theme-color" content="#0C0C0E">\n' +
      '<meta property="og:type" content="' + (opts.ogType || 'website') + '">\n' +
      '<meta property="og:site_name" content="KipFire">\n' +
      '<meta property="og:title" content="' + esc(opts.title) + '">\n' +
      '<meta property="og:description" content="' + esc(opts.description) + '">\n' +
      '<meta property="og:url" content="' + esc(opts.canonical) + '">\n' +
      '<meta property="og:image" content="' + SITE + '/assets/og-image.png">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="apple-itunes-app" content="app-id=6755289956">\n' +
      (opts.rss ? '<link rel="alternate" type="application/rss+xml" title="KipFire news" href="' + SITE + '/journal/feed.xml">\n' : '') +
      '<link rel="icon" type="image/png" href="' + prefix + 'assets/favicon-64.png">\n' +
      '<link rel="apple-touch-icon" href="' + prefix + 'assets/icon-180.png">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Figtree:wght@400;500;600;700&display=swap">\n' +
      '<link rel="stylesheet" href="' + prefix + 'assets/site.css">\n' +
      opts.ld.map(function (obj) {
        return '<script type="application/ld+json">' + jsonLd(obj) + '</script>';
      }).join('\n') + '\n</head>\n';
  }

  function shell(opts, main) {
    var prefix = opts.prefix;
    return head(opts) + '<body>\n<a class="skip" href="#main">Skip to content</a>\n' +
      '<header class="site-head"><div class="wrap">' +
      '<a class="brand" href="' + prefix + '" aria-label="KipFire home"><img src="' + prefix + 'assets/icon-180.png" alt="" width="32" height="32"><span>KIPFIRE</span></a>' +
      '<nav class="nav" aria-label="Main">' + nav(prefix, opts.current) + '</nav>' +
      '<span class="head-cta"><a class="btn btn-primary btn-small" href="https://apps.apple.com/us/app/kipfire/id6755289956" rel="noopener">' + SVG + 'Get the app</a></span>' +
      '</div></header>\n<main id="main">\n' + main + '\n</main>\n' + footer(prefix) + '\n</body>\n</html>\n';
  }

  var org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KipFire',
    url: SITE + '/',
    logo: SITE + '/assets/icon-180.png',
    email: 'support@kipfire.com'
  };

  function renderArticle(post) {
    var url = SITE + '/journal/' + post.slug + '/';
    var title = post.title + ' | KipFire';
    var main = '<article class="article"><div class="wrap">' +
      '<p class="meta"><a href="../">News</a> · ' + esc(kindLabel(post.kind)) + ' · <time datetime="' + esc(post.date) + '">' + esc(prettyDate(post.date)) + '</time> · Ibra</p>' +
      '<h1>' + esc(post.title) + '</h1>\n' +
      bodyToHtml(post.body) +
      '<div class="inline-cta"><p>Want a new prompt every time you open your phone? KipFire gives you one card to film.</p>' +
      '<a class="btn btn-primary" href="https://apps.apple.com/us/app/kipfire/id6755289956" rel="noopener">' + SVG + 'Download on the App Store</a></div>' +
      '</div></article>';
    return shell({
      prefix: '../../',
      current: 'journal/',
      title: title,
      description: post.description,
      canonical: url,
      ogType: 'article',
      ld: [org, {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        url: url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        author: { '@type': 'Person', name: 'Ibra', url: SITE + '/about/' },
        publisher: { '@type': 'Organization', name: 'KipFire', logo: { '@type': 'ImageObject', url: SITE + '/assets/icon-180.png' } }
      }, {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'News', item: SITE + '/journal/' },
          { '@type': 'ListItem', position: 3, name: post.title, item: url }
        ]
      }]
    }, main);
  }

  function listItems(posts, hrefFor) {
    return '<ul class="tip-list">' + sortPosts(posts).map(function (post) {
      return '<li><a href="' + hrefFor(post) + '"><p class="meta">' + esc(kindLabel(post.kind)) + ' · ' + esc(prettyDate(post.date)) + '</p><h3>' + esc(post.title) + '</h3><p>' + esc(post.description) + '</p></a></li>';
    }).join('') + '</ul>';
  }

  function renderListing(posts) {
    var main = '<section class="page-head"><div class="wrap"><h1>News</h1>' +
      '<p class="lede">News and app updates. Older pieces stay here. Tips live in <a href="../tips/">Content tips</a>.</p></div></section>' +
      '<section><div class="wrap">' + (posts.length ? listItems(posts, function (post) { return post.slug + '/'; }) : '<p>Nothing published yet.</p>') + '</div></section>';
    return shell({
      prefix: '../',
      current: 'journal/',
      title: 'News and updates | KipFire',
      description: 'App updates, news and posting notes from KipFire. New pieces are added over time.',
      canonical: SITE + '/journal/',
      rss: true,
      ld: [org, {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'KipFire news',
        description: 'App updates, news and posting notes from KipFire.',
        url: SITE + '/journal/',
        inLanguage: 'en',
        publisher: { '@type': 'Organization', name: 'KipFire' }
      }]
    }, main);
  }

  function renderFeed(posts) {
    var items = sortPosts(posts).map(function (post) {
      var url = SITE + '/journal/' + post.slug + '/';
      return '<item><title>' + esc(post.title) + '</title><link>' + url + '</link><guid>' + url + '</guid>' +
        '<pubDate>' + new Date(post.date + 'T15:00:00Z').toUTCString() + '</pubDate>' +
        '<description>' + esc(post.description) + '</description></item>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>' +
      '<title>KipFire news</title><link>' + SITE + '/journal/</link>' +
      '<description>App updates, news and posting notes from KipFire.</description>' +
      '<language>en</language>' + items + '</channel></rss>\n';
  }

  function latestBlock(posts) {
    return listItems(posts.slice(0, 3), function (post) { return 'journal/' + post.slug + '/'; });
  }

  function sitemapBlock(posts) {
    var today = posts.reduce(function (max, post) { return post.date > max ? post.date : max; }, '2026-10-13');
    var urls = ['  <url><loc>' + SITE + '/journal/</loc><lastmod>' + today + '</lastmod></url>']
      .concat(sortPosts(posts).map(function (post) {
        return '  <url><loc>' + SITE + '/journal/' + post.slug + '/</loc><lastmod>' + post.date + '</lastmod></url>';
      }));
    return urls.join('\n');
  }

  function llmsBlock(posts) {
    return sortPosts(posts).map(function (post) {
      return '- [' + post.title + '](' + SITE + '/journal/' + post.slug + '/): ' + post.description;
    }).join('\n');
  }

  function plainText(text) {
    return esc(text).replace(/\n/g, '<br>');
  }

  function profilePhoto(profile, prefix) {
    if (!profile.photo) return '';
    return '<img src="' + prefix + esc(profile.photo) + '" alt="' + esc(profile.name || 'Ibra') + '" width="160" height="160">';
  }

  function firstLine(text) {
    var line = String(text || '').trim().split(/\n{2,}/)[0] || '';
    return line.replace(/^##\s+/, '').slice(0, 180);
  }

  function renderFounder(profile) {
    var name = profile.name || 'Ibra';
    var photo = profile.photo
      ? '<img class="founder-avatar" src="../' + esc(profile.photo) + '" alt="' + esc(name) + '" width="168" height="168">'
      : '';
    var main = '<article class="article founder-page"><div class="wrap">' + photo +
      '<h1>' + esc(name) + '</h1><div class="founder-copy">' + bodyToHtml(profile.body) + '</div></div></article>';
    var person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: name,
      jobTitle: 'Founder',
      url: SITE + '/founder/',
      worksFor: { '@type': 'Organization', name: 'KipFire', url: SITE + '/' }
    };
    if (profile.photo) person.image = SITE + '/' + profile.photo;
    return shell({
      prefix: '../',
      current: 'founder/',
      title: name + ', founder of KipFire',
      description: firstLine(profile.body),
      canonical: SITE + '/founder/',
      ld: [org, person]
    }, main);
  }

  function renderTipArticle(post) {
    var url = SITE + '/tips/' + post.slug + '/';
    var main = '<article class="article"><div class="wrap">' +
      '<p class="meta"><a href="../">Content tips</a> · <time datetime="' + esc(post.date) + '">' + esc(prettyDate(post.date)) + '</time> · Ibra</p>' +
      '<h1>' + esc(post.title) + '</h1>\n' +
      bodyToHtml(post.body) +
      '<div class="inline-cta"><p>Want a new prompt every time you open your phone? KipFire gives you one card to film.</p>' +
      '<a class="btn btn-primary" href="https://apps.apple.com/us/app/kipfire/id6755289956" rel="noopener">' + SVG + 'Download on the App Store</a></div>' +
      '</div></article>';
    return shell({
      prefix: '../../',
      current: 'tips/',
      title: post.title + ' | KipFire',
      description: post.description,
      canonical: url,
      ogType: 'article',
      ld: [org, {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        url: url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        author: { '@type': 'Person', name: 'Ibra', url: SITE + '/founder/' },
        publisher: { '@type': 'Organization', name: 'KipFire', logo: { '@type': 'ImageObject', url: SITE + '/assets/icon-180.png' } }
      }]
    }, main);
  }

  function tipListBlock(posts) {
    if (!posts.length) return '';
    return sortPosts(posts).map(function (post) {
      return '<li><a href="' + post.slug + '/"><p class="meta">Tip · ' + esc(prettyDate(post.date)) + '</p><h3>' + esc(post.title) + '</h3><p>' + esc(post.description) + '</p></a></li>';
    }).join('');
  }

  function tipSitemapBlock(posts) {
    return sortPosts(posts).map(function (post) {
      return '  <url><loc>' + SITE + '/tips/' + post.slug + '/</loc><lastmod>' + post.date + '</lastmod></url>';
    }).join('\n');
  }

  function tipLlmsBlock(posts) {
    return sortPosts(posts).map(function (post) {
      return '- [' + post.title + '](' + SITE + '/tips/' + post.slug + '/): ' + post.description;
    }).join('\n');
  }

  function personLd(profile) {
    var person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name || 'Ibra',
      jobTitle: 'Founder',
      url: SITE + '/about/',
      worksFor: { '@type': 'Organization', name: 'KipFire', url: SITE + '/' }
    };
    if (profile.photo) person.image = SITE + '/' + profile.photo;
    return '<script type="application/ld+json">' + jsonLd(person) + '</script>';
  }

  function patchMarked(source, name, inner) {
    var start = '<!-- ' + name + ':start -->';
    var end = '<!-- ' + name + ':end -->';
    var a = source.indexOf(start);
    var b = source.indexOf(end);
    if (a < 0 || b < 0 || b < a) {
      throw new Error('Missing markers for ' + name);
    }
    var block = String(inner).replace(/^\n+|\n+$/g, '');
    return source.slice(0, a + start.length) + '\n' + block + '\n' + source.slice(b);
  }

  root.KipfirePublisher = {
    OWNER: OWNER,
    REPO: REPO,
    KINDS: KINDS,
    esc: esc,
    prettyDate: prettyDate,
    slugify: slugify,
    bodyToHtml: bodyToHtml,
    sortPosts: sortPosts,
    renderArticle: renderArticle,
    renderListing: renderListing,
    renderFeed: renderFeed,
    latestBlock: latestBlock,
    sitemapBlock: sitemapBlock,
    llmsBlock: llmsBlock,
    renderFounder: renderFounder,
    renderTipArticle: renderTipArticle,
    tipListBlock: tipListBlock,
    tipSitemapBlock: tipSitemapBlock,
    tipLlmsBlock: tipLlmsBlock,
    patchMarked: patchMarked
  };
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalThis.KipfirePublisher;
}
