# Jihoney OS 🍯

Ji Heon Kim's portfolio, served as a tiny operating system.

**Live:** https://flight2moon.github.io/it-s-me/

- **Folders** — About Me, Research, Projects, Publications, Awards open as windows
- **Resume.pdf** — opens `resume.html`, a printable résumé page with the original PDF
- **Git Blog** — jumps to https://flight2moon.github.io/
- **Terminal** — `help`, `ls`, `cat`, `neofetch`, `htop`, `btop`, `vi` (modal: `i`, `Esc`, `:wq`, `dd`, `yy`, `p`, `u`, `/search`)
- **Bug Hunt 3D** — raycasting corridor shooter
- **Honey Prix** — pseudo-3D road racer

Works on phones: windows become full-screen apps, the terminal gets an Esc/Tab/Ctrl/arrow key row, and the games get touch pads.

## Layout

```
index.html        the OS
resume.html       printable résumé page
css/os.css        all styles
js/content.js     ← all portfolio content lives here (edit this to update everything)
js/os.js          desktop, dock, window manager, boot screen
js/terminal.js    shell, filesystem, htop, btop, vi, neofetch
js/games.js       Bug Hunt 3D, Honey Prix
assets/           résumé PDF and other attachments
```

No build step and no dependencies. To run locally:

```bash
python3 -m http.server 8765
```

## Adding things

- **Content**: edit `JOS.data` in `js/content.js`. Windows, terminal files and `resume.html` all read from it.
- **A new desktop icon / app**: add one entry to `apps` in `js/os.js` (`render` for a content window, `mount` for a live app, `href` for a link).
- **Deep links**: `…/it-s-me/#terminal`, `#projects`, `#bughunt`, `#prix` open that app on load.
