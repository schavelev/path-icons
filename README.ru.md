# path-icons

[English](README.md) | **Русский**

🛠️ *Этот проект находится в процессе разработки.*

[![Версия NPM](https://img.shields.io/npm/v/path-icons.svg)](https://www.npmjs.com/package/path-icons)
[![Лицензия](https://img.shields.io/npm/l/path-icons.svg)](https://github.com/schavelev/path-icons/blob/main/LICENSE)
[![Версия Node](https://img.shields.io/node/v/path-icons)](https://github.com/schavelev/path-icons#installation)
[![CI](https://github.com/schavelev/path-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/schavelev/path-icons/actions)

![Логотипы](logos.svg)

**Path Icons** — инструмент для генерации векторных иконок на основе SVG-путей из [Bootstrap Icons](https://icons.getbootstrap.com/).
Он создаёт CSS-файлы для веб-приложений и C#-файлы для приложений на Avalonia и WPF, 
позволяет использовать только необходимые иконки, упрощает создание пользовательских иконок, поддерживает настройку цвета для отдельных фрагментов изображения (`path`).

## Почему Path Icons?

- **Готовые иконки**: Используйте обширную коллекцию [Bootstrap Icons](https://icons.getbootstrap.com/), не создавая иконки с нуля.
- **Цветные иконки**: Преобразуйте монохромные Bootstrap Icons в цветные, задав до двух цветов для фрагментов (`path`).
- **Компактность**: Оптимизируйте проект, включая вместо полного набора из 2000+ только необходимые иконки.
- **Пользовательские иконки**: Быстро создавайте собственные иконки, указав имя и 1-2 фрагмента избражения (`path`).
- **Кроссплатформенность**: Используйте Bootstrap Icons не только для веб-приложений, но и в приложениях на Avalonia и WPF.

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

2. **Создайте файл `app-icons.json`**:
   ```json
   {
     "bootstrap": null,
     "path-icons": null,
     "window-sidebar": null,
     "funnel": null,
     "sort-alpha-down": null
   }
   ```

3. **Запустите генератор:**:
   ```bash
   npx path-icons --input app-icons.json --verbose
   ```

4. **Ознакомьтесь с результатами**:
   Сгенерированные файлы находятся в директории `dist`. Откройте `dist/app-icons.html` в браузере для предварительного просмотра иконок.

## Лицензия

Распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).

## Благодарности

Этот проект включает SVG данные иконок из [Bootstrap Icons](https://github.com/twbs/icons), распространяемые под лицензией MIT. Copyright (c) 2019-2024 The Bootstrap Authors. 
