# path-icons

**English** | [Русский](README.ru.md)

🛠️ *This project is under construction. More details coming soon!*

[![NPM Version](https://img.shields.io/npm/v/path-icons.svg)](https://www.npmjs.com/package/path-icons)
[![License](https://img.shields.io/npm/l/path-icons.svg)](https://github.com/schavelev/path-icons/blob/main/LICENSE)
[![Node Version](https://img.shields.io/node/v/path-icons)](https://github.com/schavelev/path-icons#installation)
[![CI](https://github.com/schavelev/path-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/schavelev/path-icons/actions)

![Logos](logos.svg)

**Path Icons** is a tool for generating vector icons based on SVG paths from [Bootstrap Icons](https://icons.getbootstrap.com/).  
It creates CSS files for web applications and C# files for Avalonia and WPF applications, enabling the use of only the necessary icons, simplifying the creation of custom icons, and supporting color customization for individual image fragments (`path`).

## Why Path Icons?

- **Ready-to-use icons**: Leverage the extensive [Bootstrap Icons](https://icons.getbootstrap.com/) collection without creating icons from scratch.
- **Colored icons**: Transform monochrome Bootstrap Icons into colored ones by specifying up to two colors for fragments (`path`).
- **Compactness**: Optimize your project by including only the necessary icons instead of the full set of 2000+.
- **Custom icons**: Quickly create your own icons by specifying a name and, for example, 1-2 image fragments (`path`).
- **Cross-platform compatibility**: Use Bootstrap Icons not only in web applications but also in Avalonia and WPF applications. 

## Installation

```bash
npm install path-icons --save-dev
```

## Quick Start

1. **Set up a test project and install `path-icons`**:
   ```bash
   mkdir try-path-icons
   cd try-path-icons
   npm init -y
   npm install path-icons --save-dev
   ```

2. **Create an `app-icons.json` file**:
   ```json
   {
     "bootstrap": null,
     "path-icons": null,
     "window-sidebar": null,
     "funnel": null,
     "sort-alpha-down": null
   }
   ```

3. **Run the generator**:
   ```bash
   npx path-icons --input app-icons.json --verbose
   ```

4. **Review the results**:
   Generated files are located in the `dist` directory. Open `dist/app-icons.html` in a browser to preview the icons.
 
## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Credits

This project includes SVG icon data from [Bootstrap Icons](https://github.com/twbs/icons), licensed under the MIT License. Copyright (c) 2019-2024 The Bootstrap Authors.
