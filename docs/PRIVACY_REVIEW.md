# Release privacy review

- Removed personal author and social-profile fields from pages, metadata, configuration, downloadable result cards, and launch media.
- Scanned source, build output, and launch drafts for private document links, personal email addresses, local home paths, credentials, and private keys. The build includes only an explicit runtime-file whitelist.
- Re-rendered launch screenshots, the demo GIF, social cards, and a downloaded result card; visually checked the images. Text scanning alone cannot inspect pixels.
- Fonts are served locally with their original third-party licenses. No analytics SDK, remote font request, or application network API is present. Hosting providers may retain ordinary request logs.
- Notes and learning progress stay in local storage. Share links contain lesson parameters and language only; note exports are explicitly user initiated.
- The public GitHub username is intentionally permitted. GitHub repository ownership and the Pages hostname expose this public account. Its existing public profile remains separately visible; this project does not change account-profile settings.
- Use the public username and GitHub no-reply email for commits; do not publish existing private author metadata. The repository had no prior commits at review time.

This is a scoped prepublication review of this repository and its generated assets, not a scan of unrelated files or a claim that the hosting provider collects no data. Third-party font notices retain the font authors’ required public copyright information.
