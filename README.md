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

2. **Create a** `my-icons.json` **file**:

   ```json
   {
    "sign-stop-fill": null,
    "x-octagon-fill": { "colorBefore": "#dc3545" },
    "exclamation-triangle-fill": { "colorBefore": "#ffc107" },
    "file-earmark-arrow-down": { "colorBefore": "#0d6efd", "colorAfter": "Green" },
    "file-earmark-arrow-up": { "colorBefore": "Gold", "colorAfter": "Green" },
    "custom1": { "pathBefore": "M3,3 8,6 13,3 10,8 13,13 8,10 3,13 6,8z", "colorBefore": "Red" },
    "custom2": { "pathBefore": "M0,0H16V16H0z", "colorBefore": "Green", "pathAfter": "M5,3 13,11 11,13 3,5z M13,5 5,13 3,11 11,3z", "colorAfter": "Red" }
   }
   ```

   The file specifies icons from Bootstrap Icons: unchanged (`sign-stop-fill`), with one color defined (`x-octagon-fill`, `exclamation-triangle-fill`), with two colors defined for image fragments (`file-earmark-arrow-down`, `file-earmark-arrow-up`). It also includes definitions for custom icons (`custom1`, `custom2`).

3. **Run the generator**:
   ```bash
   npx path-icons --input my-icons.json --verbose
   ```

4. **Review the results**:

   Generated files are located in the `dist` directory. Open `dist/app-icons.html` in a browser to preview the icons. An example result is also available [here](https://schavelev.github.io/path-icons/examples/quick-start/my-icons.html).
 
## Examples

The following steps describe how to build and run examples using `path-icons`. All commands are executed from the project root.

### Cloning and Building
Clone the repository and build the project:
```bash
git clone https://github.com/schavelev/path-icons.git
cd path-icons
npm install
npm run build
```
Result: Generated file `dist/path-icons.json` in the project root.

### Example `app-icons`
A simple example of generating a CSS file for web applications.  
The configuration file `path-icons.config.json` specifies the input file `app-icons.json` and output files (`css`, `html`).
```bash
cd examples/app-icons
npx path-icons --verbose
```
Result: Generated files `dist/app-icons.css` and `dist/app-icons.html`.  
Open `dist/app-icons.html` in a browser to view the icons.

### Example `AppIcons/SharedLib`
Generates a C# file with icon definitions for Avalonia and WPF applications.  
The configuration file `path-icons.config.json` specifies the input file `shared-lib-icons.json` and output files (`css`, `html`, `csharp`).  
From the project root, execute:
```bash
cd examples/AppIcons/SharedLib
npx path-icons --verbose
```
Result: Generated files `Bootstrap/BootstrapSymbol.cs`, `dist/shared-lib-icons.css`, and `dist/shared-lib-icons.html` (the latter is useful for verifying the icon set).

### Example `AppIcons/TryAvalonia`
Example of using icons from `AppIcons/SharedLib` in an Avalonia application.  
From the project root, execute:
```bash
cd examples/AppIcons/TryAvalonia
dotnet build
dotnet run
```
Result: Launches a desktop application with two panels of buttons using monochrome and colored icons.

### Example `AppIcons/TryWpf`
Example of using icons from `AppIcons/SharedLib` in a WPF application.  
From the project root, execute:
```bash
cd examples/AppIcons/TryWpf
dotnet build
dotnet run
```
Result: Launches a desktop application with a ToolBar containing buttons with icons.

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Credits

This project includes SVG icon data from [Bootstrap Icons](https://github.com/twbs/icons), licensed under the MIT License. Copyright (c) 2019-2024 The Bootstrap Authors.
