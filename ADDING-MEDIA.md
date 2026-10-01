# Add media without editing code

Double-click **Open Portfolio.command** to open the local website. Leave its Terminal window open while browsing.

1. Drop photos into **VFX-Photos** or **Modelling-Photos**.
2. Drop matching videos into **VFX-Videos** or **Modelling-Videos**.
3. New projects and counts update within a few seconds while the launcher page is open. No refresh needed. If a project preview is open, return to the gallery first.

Example: `VFX-Photos/Blue Burst.png` and `VFX-Videos/Blue Burst.mp4` become **Blue Burst**. The filename determines the title, without extensions. The video matches the same name (case-insensitive). No matching video means **coming soon**. MP4/H.264 is recommended for browser compatibility. Photos can be PNG, JPG, JPEG, WebP, GIF, or AVIF.

For Misc, create **Misc-Photos** and **Misc-Videos**. Until Misc-Photos exists, the existing sample list stays in place.

Opening index.html directly uses the last scanned list: browsers cannot automatically list neighboring folders. The launcher handles that for you. For a static hosted website, run `python3 portfolio_server.py --scan-only` before uploading index.html, portfolio-media.js, and the media folders. Automatic folder discovery on a live host requires a server or build step; the local launcher does not deploy the site.

Existing projects keep their order; new projects append. The generated portfolio-media.js is a static fallback and is refreshed by the scanner. You can still edit it manually if you prefer, but scanning replaces its entries from the folders.

The local server only listens on this computer. If port 8765 is already in use, close the previous launcher window or run `python3 portfolio_server.py --port 8766`.

Right-click saving and media dragging are discouraged. No public website can prevent screenshots, developer-tool downloads, or every way of copying media.

## GitHub Pages — automatic updates after every push

Put this portfolio at the root of your GitHub repository, including the hidden `.github` folder. In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions** once.

After that, add photos and same-name videos to the folders and push to your repository’s default branch. The included workflow scans the folders, generates the media list, and publishes the site. Refresh the public page after the deployment completes. The website does not need Python in the visitor’s browser; Python runs only during the build.

Local changes do not reach the public site until you upload/commit and push them. The Pages artifact excludes backups and AI Prompts. Public repository files themselves remain publicly accessible, even if they are not included in the website build.

## Rearrange projects

Open VFX-Order.txt or Models-Order.txt in TextEdit. Move the project-name lines into your preferred sequence and save. Keep one name per line, without file extensions; do not rename your photos or videos. New projects not listed here still appear at the end. Add their names wherever you want them in this list.

Restart Open Portfolio.command once after this upgrade. While the launcher is running, saved order changes appear automatically in the gallery. The starting project remains random, but the sequence follows your list. Include both order files when pushing to GitHub.
