# path-icons

[![NPM Version](https://img.shields.io/npm/v/path-icons.svg)](https://www.npmjs.com/package/path-icons)
[![License](https://img.shields.io/npm/l/path-icons.svg)](https://github.com/schavelev/path-icons/blob/main/LICENSE)
[![Node Version](https://img.shields.io/node/v/path-icons)](https://github.com/schavelev/path-icons#installation)
[![CI](https://github.com/schavelev/path-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/schavelev/path-icons/actions)

![Path Icons Logo](logos.svg)

Path Icons is a lightweight, customizable icon solution inspired by Bootstrap Icons. It allows you to use only the icons you need, add two-tone color support, and easily integrate custom icons. Designed for web applications (via Node.js and npm module path-icons) and cross-platform desktop apps built with Avalonia and WPF.


## Why Path Icons?

- **Selective Icon Usage**: Include only the icons your app needs, avoid bundling the full `bootstrap-icons.woff2` and `bootstrap-icons.min.css`.
- **Two-Tone Colors**: Enhance Bootstrap Icons with dual-color support for better visual appeal.
- **Custom Icons**: Simplify the process of adding and managing your own icons.
- **Cross-Platform**: Seamlessly use the same icons in web and desktop applications (Avalonia, WPF).

**This project is under construction. More details coming soon!**


## Installation

```bash
npm install path-icons
```

## Quick Start  

1. **Set up a test project and install `path-icons`**:  
   ```bash
   mkdir try-path-icons
   cd try-path-icons
   npm init -y
   npm add path-icons -D
   ```

2. **Add configuration files** (copy from [examples/app-icons](examples/app-icons/)):
   - [`path-icons.config.json`](examples/app-icons/path-icons.config.json) - generator settings  
   - [`app-icons.json`](examples/app-icons/app-icons.json) - icon definitions  

3. **Run the generator**:  
   ```bash
   npx path-icons
   ```

4. **View results**:  
   Generated files are available in the `dist` directory. Open `dist/app-icons.html` to preview icons.

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Credits

This project includes SVG icon data from [Bootstrap Icons](https://github.com/twbs/icons), licensed under the MIT License. Copyright (c) 2019-2024 The Bootstrap Authors.
