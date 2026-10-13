# kipfire.com

Static website for KipFire. Plain HTML + CSS, no build step needed to host.

## Page URLs (for the app and App Store Connect)
- https://kipfire.com/privacy/
- https://kipfire.com/terms/
- https://kipfire.com/faq/
- https://kipfire.com/about/

## Deploy on GitHub Pages
1. Create a new public repo (e.g. `kipfire-site`) and upload everything in this folder (keep the `CNAME` and `.nojekyll` files).
2. Repo Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Custom domain: `kipfire.com`, then tick "Enforce HTTPS" once it becomes available.
4. At your domain registrar, add DNS records:
   - A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME for `www`: `<your-github-username>.github.io`
5. Wait for DNS (minutes to a few hours). Then submit https://kipfire.com/sitemap.xml in Google Search Console.

## Publishing news yourself
Open https://kipfire.com/write/ while signed into GitHub as the site owner. The page asks for a fine-grained token limited to this repo (Contents: Read and write). Articles are committed as normal pages under `/journal/`, so they stay on the site and are listed in the sitemap, the RSS feed, and `llms.txt`.

## After launch
- Update the Privacy Policy URL in App Store Connect to https://kipfire.com/privacy/
- Keep the old GitHub Pages legal links online until every app version links to the new ones.
