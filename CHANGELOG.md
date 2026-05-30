# Changelog

## [1.0.1](https://github.com/timdixon82/SWOT-Builder/compare/v1.0.0...v1.0.1) (2026-05-30)


### Bug Fixes

* **a11y:** fix Group 1 critical accessibility findings (C-01, C-05, C-06, C-07, H-06) ([74d59bd](https://github.com/timdixon82/SWOT-Builder/commit/74d59bd2de50a3dea65d646ddac25f271d25979b))
* **a11y:** fix Group 3 accessibility findings (H-01–H-03, H-07, M-02, M-03, M-06, L-01–L-04); 0 lint warnings ([00799cd](https://github.com/timdixon82/SWOT-Builder/commit/00799cdc599122504b0383595d6534322b66d8b6))
* **a11y:** fix Group 3 accessibility findings (H-01–H-03, H-07, M-02, M-03, M-06, L-01–L-04); 0 lint warnings ([00799cd](https://github.com/timdixon82/SWOT-Builder/commit/00799cdc599122504b0383595d6534322b66d8b6))
* **a11y:** fix Group 3 accessibility findings (H-01, H-02, H-03, H-07, M-02, M-03, M-06, L-01 to L-04) ([c3fa69e](https://github.com/timdixon82/SWOT-Builder/commit/c3fa69ea76e29ed6f5a8180c5428c65a9914db52))
* **a11y:** Phase 2 Group 1 critical accessibility fixes ([770f546](https://github.com/timdixon82/SWOT-Builder/commit/770f546d718dc02601c419b106c6b6f64c9cd35d))
* **a11y:** Phase 2 Group 1 critical accessibility fixes ([770f546](https://github.com/timdixon82/SWOT-Builder/commit/770f546d718dc02601c419b106c6b6f64c9cd35d))
* **a11y:** Phase 2 Group 2 accessibility fixes (C-02, C-03, C-04, H-04, H-05, H-08, M-01, M-05) ([09c4e6b](https://github.com/timdixon82/SWOT-Builder/commit/09c4e6b96a4473a8f063e47784d08c82cb55682f))
* **a11y:** rework H-01 selector and H-02 contrast per Carol review ([ff8f813](https://github.com/timdixon82/SWOT-Builder/commit/ff8f813a04dcd664bac9e35765e89e48829be201))
* add 'self' to CSP connect-src so Babel can load JSX source files ([#13](https://github.com/timdixon82/SWOT-Builder/issues/13)) ([3535146](https://github.com/timdixon82/SWOT-Builder/commit/35351467c728c224751f5bac8e6a6cc6182d8201))
* **ci:** align accessibility workflow to team standard pattern ([d7e754a](https://github.com/timdixon82/SWOT-Builder/commit/d7e754af7db489ca09077b26ec9661187eece996))
* **ci:** export BDM chromedriver to GITHUB_PATH so axe-core finds it before system driver ([14c9298](https://github.com/timdixon82/SWOT-Builder/commit/14c9298cdb89370771a563b7a0122c7e2638d94f))
* **ci:** install Chrome via Puppeteer cache for Pa11y (runner Chrome 148 update) ([c9c6987](https://github.com/timdixon82/SWOT-Builder/commit/c9c6987f9e766692346c8fac80c233bee5699089))
* **ci:** replace BDM with Chrome for Testing CDN for axe ChromeDriver ([#9](https://github.com/timdixon82/SWOT-Builder/issues/9)) ([64c6d1d](https://github.com/timdixon82/SWOT-Builder/commit/64c6d1df7f47e9a4e396b3e3baec184330627f73))
* **ci:** resolve Pa11y Chrome path via jq-generated CI config (avoids Puppeteer cache drift) ([490fb32](https://github.com/timdixon82/SWOT-Builder/commit/490fb3267e901c32c0c8939c52e6b76d3e370113))
* **ci:** restore browser-driver-manager for axe ChromeDriver; Pa11y uses system Chrome via jq config ([023bb30](https://github.com/timdixon82/SWOT-Builder/commit/023bb309db175e3b8c52e21d3afa17b0b93726db))
* **ci:** restore jq Chrome path for Pa11y; browser-driver-manager handles axe ChromeDriver ([a8bfa88](https://github.com/timdixon82/SWOT-Builder/commit/a8bfa883c60d6c8659e1e07a9094574f9652664b))
* **ci:** use system Chrome path for Pa11y to avoid Puppeteer cache version drift ([f626691](https://github.com/timdixon82/SWOT-Builder/commit/f626691881105fda7f636faede690fa20b1dcd29))
* **lint:** resolve all 36 ESLint warnings; add AIBadge arrow-key navigation ([4944cbf](https://github.com/timdixon82/SWOT-Builder/commit/4944cbff982f8dfdd670a88303e1dcd263ddf3a4))
* **security:** add CSP meta tag, SRI hash for html2canvas, GoatCounter snippet ([63da44c](https://github.com/timdixon82/SWOT-Builder/commit/63da44c92eecaa0e3dcca4d52f15924feef36488))
* **security:** pin WebLLM CDN URL to version 0.2.83 (ADR 0007 / Jed finding 3) ([01a1f57](https://github.com/timdixon82/SWOT-Builder/commit/01a1f57e38acff7e6b7efe6fa78229bbea97a7f3))
