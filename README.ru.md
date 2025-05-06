# path-icons

[English](README.md) | **Русский**

🛠️ *Этот проект находится в процессе разработки.*

[![Версия NPM](https://img.shields.io/npm/v/path-icons.svg)](https://www.npmjs.com/package/path-icons)
[![Лицензия](https://img.shields.io/npm/l/path-icons.svg)](https://github.com/schavelev/path-icons/blob/main/LICENSE)
[![Версия Node](https://img.shields.io/node/v/path-icons)](https://github.com/schavelev/path-icons#installation)
[![CI](https://github.com/schavelev/path-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/schavelev/path-icons/actions)

![Логотипы](logos.svg)

**Path Icons** — инструмент для генерации определений двухцветных векторных айконок на основе SVG-путей из [Bootstrap Icons](https://icons.getbootstrap.com/).
Он создаёт CSS-файлы для веб-приложений и C#-файлы для приложений на Avalonia/WPF, 
позволяет использовать только необходимые айконки, упрощает включение в приложение пользовательских айконок.

Пример генерации определений айконок в форме HTML-файла для предварительного просмотра доступен по [ссылке](https://schavelev.github.io/path-icons/examples/quick-start/my-icons.html).

## Почему Path Icons?

- **Готовые айконки**: Используйте обширную коллекцию [Bootstrap Icons](https://icons.getbootstrap.com/), не создавая айконки с нуля.
- **Цветные айконки**: Преобразуйте монохромные Bootstrap Icons в цветные, задав до двух цветов для фрагментов изображения (`path`).
- **Компактность**: Оптимизируйте проект, включая вместо полного набора из 2000+ только необходимые айконки.
- **Пользовательские айконки**: Быстро создавайте собственные айконки, указав имя и 1-2 фрагмента изображения (`path`).
- **Кроссплатформенность**: Используйте Bootstrap Icons не только для веб-приложений, но и в приложениях на Avalonia/WPF.

## Установка

```bash
npm install path-icons --save-dev
```

## Быстрый старт

1. **Создайте тестовый проект и установите `path-icons`**:
   ```bash
   mkdir try-path-icons
   cd try-path-icons
   npm init -y
   npm install path-icons --save-dev
   ```

2. **Создайте файл `my-icons.json`**:
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
   В файле перечислены айконки, которые берутся из Bootstrap Icons: с указанием двух одинаковых цветов для фрагментов изображения (sign-stop-fill, exclamation-triangle-fill, info-circle, database), с определением двух разных цветов (database-check, database-exclamation, database-dash), без определения цвета (floppy, gear).
   
   Дополнительно приведены определения пользовательских иконок (custom1, custom2).



3. **Запустите генератор:**:
   ```bash
   npx path-icons --input my-icons.json --verbose
   ```

4. **Ознакомьтесь с результатами**:

   Сгенерированные файлы (html, css, cs) находятся в директории `dist`. Откройте `dist/app-icons.html` в браузере для предварительного просмотра айконок.
   Пример результата также доступен по [ссылке](https://schavelev.github.io/path-icons/examples/quick-start/my-icons.html).

## Примеры

Ниже описаны шаги для сборки и запуска примеров использования `path-icons`. Все команды выполняются из корня проекта.

### Клонирование и сборка
Клонируйте репозиторий и выполните сборку проекта:
```bash
git clone https://github.com/schavelev/path-icons.git
cd path-icons
npm install
npm run build
```
Результат: сгенерирован файл `dist/path-icons.json` в корне проекта.

### Пример `app-icons`
Простейший пример генерации CSS-файла для веб-приложений.  
Файл конфигурации `path-icons.config.json` задаёт входной файл `app-icons.json` и выходные файлы (`css`, `html`).
```bash
cd examples/app-icons
npx path-icons --verbose
```
Результат: сгенерированы файлы `dist/app-icons.css` и `dist/app-icons.html`.  
Откройте `dist/app-icons.html` в браузере для просмотра айконок.

### Пример `AppIcons`

#### Проект `AppIcons/SharedLib`
Генерация C#-файла с определениями айконок для приложений Avalonia/WPF.  
Файл конфигурации `path-icons.config.json` задаёт входной файл `shared-lib-icons.json` и выходные файлы (`css`, `html`, `csharp`).
Из корня проекта выполните:
```bash
cd examples/AppIcons/SharedLib
npx path-icons --verbose
```
Результат: сгенерированы файлы `Bootstrap/BootstrapSymbol.cs`, `dist/shared-lib-icons.css` и `dist/shared-lib-icons.html` (последний удобен для проверки набора айконок).

#### Проект `AppIcons/TryAvalonia`
Пример использования айконок из `AppIcons/SharedLib` в приложении Avalonia.
Из корня проекта выполните:
```bash
cd examples/AppIcons/TryAvalonia
dotnet build
dotnet run
```
Результат: запускается десктоп-приложение с панелью цветных кнопок (псевдо тулбаром).

#### Проект `AppIcons/TryWpf`
Пример использования айконок из `AppIcons/SharedLib` в приложении WPF.
Из корня проекта выполните:
```bash
cd examples/AppIcons/TryWpf
dotnet build
dotnet run
```
Результат: запускается десктоп-приложение с панелью цветных кнопок (ToolBar).

## Лицензия

Распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).

## Благодарности

Этот проект включает SVG данные айконок из [Bootstrap Icons](https://github.com/twbs/icons), распространяемые под лицензией MIT. Copyright (c) 2019-2025 The Bootstrap Authors. 
