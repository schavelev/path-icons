# path-icons

**English** | [Русский](README.ru.md)

🛠️ *This project is under construction. More details coming soon!*

[![NPM Version](https://img.shields.io/npm/v/path-icons.svg)](https://www.npmjs.com/package/path-icons)
[![License](https://img.shields.io/npm/l/path-icons.svg)](https://github.com/schavelev/path-icons/blob/main/LICENSE)
[![Node Version](https://img.shields.io/node/v/path-icons)](https://github.com/schavelev/path-icons#installation)
[![CI](https://github.com/schavelev/path-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/schavelev/path-icons/actions)

![Logos](logos.svg)

**Path Icons** is a tool for generating two-color vector icon definitions based on SVG paths from [Bootstrap Icons](https://icons.getbootstrap.com/).
It creates CSS files for web applications and C\# files for Avalonia/WPF applications.
It allows you to use only the necessary icons and simplifies the inclusion of custom icons in your application.

An example of generating icon definitions in the form of an HTML file for preview is available [here](https://schavelev.github.io/path-icons/examples/quick-start/my-icons.html).

## Why Path Icons?

- **Ready-made icons**: Use the extensive collection of [Bootstrap Icons](https://icons.getbootstrap.com/) without creating icons from scratch.
- **Colored icons**: Convert monochrome Bootstrap Icons into colored ones by specifying up to two colors for image fragments (`path`).
- **Compactness**: Optimize your project by including only the necessary icons instead of the full set of 2000+.
- **Custom icons**: Quickly create your own icons by providing a name and 1-2 image fragments (`path`).
- **Cross-platform**: Use Bootstrap Icons not only for web applications but also in Avalonia/WPF applications.

## Installation

```bash
npm install path-icons --save-dev
```

## Quick Start

1. **Create a test project and install `path-icons`**:

   ```bash
   mkdir try-path-icons
   cd try-path-icons
   npm init -y
   npm install path-icons --save-dev
   ```
2. **Create a `my-icons.json` file**:

   ```json
   {
     "sign-stop-fill": [{"fill": "Crimson"}, {"fill": "Crimson"}],
     "exclamation-triangle-fill": [{"fill": "Orange"}, {"fill": "Orange"}],
     "info-circle": [{"fill": "#0dcaf0"}, {"fill": "#0dcaf0"}],
     "database": [{"fill": "#7c3aed"}, {"fill": "#7c3aed"}],
     "database-check": [{"fill": "#198754"}, {"fill": "#7c3aed"}],
     "database-exclamation": [{"fill": "#7c3aed"}, {"fill": "#ffc107"}],
     "database-dash": [{"fill": "#dc3545"}, {"fill": "#7c3aed"}],
     "floppy": null,
     "gear": null,
     "custom1": [ {"d": "M3,3 8,6 13,3 10,8 13,13 8,10 3,13 6,8z", "fill": "Red"} ],
     "custom2": [
       { "d": "M0,0H16V16H0z", "fill": "Green" },
       { "d": "M3,5 5,3 8,6 11,3 13,5 10,8 13,11 11,13 8,10 5,13 3,11 6,8z", "fill": "Red" }
     ]
   }
   ```

   The file lists icons taken from Bootstrap Icons: with two identical colors specified for image fragments (sign-stop-fill, exclamation-triangle-fill, info-circle, database), with two different colors defined (database-check, database-exclamation, database-dash), and without color definition (floppy, gear).

   Definitions for custom icons are also provided (custom1, custom2).

3. **Run the generator**:

   ```bash
   npx path-icons --input my-icons.json --verbose
   ```

4. **Explore the results**:

   The generated files (html, css, cs) are located in the `dist` directory. Open `dist/app-icons.html` in your browser for an icon preview.
   An example result is also available [here](https://schavelev.github.io/path-icons/examples/quick-start/my-icons.html).

## Examples

The steps to build and run examples of `path-icons` usage are described below. All commands are executed from the project root.


### Cloning and Building

Clone the repository and build the project:

```bash
git clone https://github.com/schavelev/path-icons.git
cd path-icons
npm install
npm run build
```
Result: The `dist/path-icons.json` file is generated in the project root.

### Example `app-icons`

The simplest example of generating a CSS file for web applications.
The `path-icons.config.json` configuration file specifies the input file `app-icons.json` and output files (`css`, `html`).
From the project root, run:

```bash
cd examples/app-icons
npx path-icons --verbose
```

Result: The `dist/app-icons.css` and `dist/app-icons.html` files are generated.
Open `dist/app-icons.html` in your browser to view the icons.

### Example `AppIcons/SharedLib`

#### Project `AppIcons/SharedLib`

Generating a C\# file with icon definitions for Avalonia/WPF applications.
The `path-icons.config.json` configuration file specifies the input file `shared-lib-icons.json` and output files (`css`, `html`, `csharp`).
From the project root, run:

```bash
cd examples/AppIcons/SharedLib
npx path-icons --verbose
```
Result: The `Bootstrap/BootstrapSymbol.cs`, `dist/shared-lib-icons.css`, and `dist/shared-lib-icons.html` files are generated (the latter is useful for checking the icon set).

### Project `AppIcons/TryAvalonia`

An example of using icons from `AppIcons/SharedLib` in an Avalonia application.
From the project root, run:

```bash
cd examples/AppIcons/TryAvalonia
dotnet build
dotnet run
```
Result: A desktop application with a panel of colored buttons (a pseudo-toolbar) starts.

### Project `AppIcons/TryWpf`

An example of using icons from `AppIcons/SharedLib` in a WPF application.
From the project root, run:

```bash
cd examples/AppIcons/TryWpf
dotnet build
dotnet run
```

Result: A desktop application with a panel of colored buttons (ToolBar) starts.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Credits

This project includes SVG icon data from [Bootstrap Icons](https://github.com/twbs/icons), licensed under the MIT License. Copyright (c) 2019-2025 The Bootstrap Authors.
