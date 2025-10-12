# Internationalization (i18n) Setup

This Dream Journal app now supports multiple languages using Angular's built-in internationalization system.

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Full translation

## How to Use

### For Users
1. Go to the Profile/Settings page
2. Tap on "Language" or "Idioma"
3. Select your preferred language from the list
4. The app will reload with the new language

### For Developers

#### Building for Different Languages

```bash
# Build for English (default)
ng build --configuration=en

# Build for Spanish
ng build --configuration=es

# Serve with specific language
ng serve --configuration=en
ng serve --configuration=es
```

#### Adding New Languages

1. **Create translation file**: Copy `src/locale/messages.xlf` to `src/locale/messages.{lang}.xlf`
2. **Translate content**: Update all `<target>` tags with translations
3. **Update angular.json**: Add new configuration in `configurations` section
4. **Update LanguageService**: Add new language to `languages` array in `src/app/services/language.service.ts`

#### Adding New Text to Translate

1. **Add i18n attribute**: Add `i18n="@@unique.id"` to HTML elements
2. **Extract translations**: Run `ng extract-i18n` to update XLF files
3. **Translate**: Update the new entries in all language files

#### Example

```html
<!-- Before -->
<h1>Welcome to Dream Journal</h1>

<!-- After -->
<h1 i18n="@@welcome.title">Welcome to Dream Journal</h1>
```

Then in `messages.xlf`:
```xml
<trans-unit id="welcome.title" datatype="html">
  <source>Welcome to Dream Journal</source>
  <target>Welcome to Dream Journal</target>
</trans-unit>
```

And in `messages.es.xlf`:
```xml
<trans-unit id="welcome.title" datatype="html">
  <source>Welcome to Dream Journal</source>
  <target>Bienvenido a Dream Journal</target>
</trans-unit>
```

## File Structure

```
src/
├── locale/
│   ├── messages.xlf      # English translations (source)
│   └── messages.es.xlf   # Spanish translations
├── app/
│   ├── services/
│   │   └── language.service.ts  # Language management
│   └── pages/
│       └── profile/
│           └── profile.component.*  # Language selector UI
└── ...
```

## Technical Details

- Uses Angular's built-in i18n system
- XLF format for translations
- Capacitor Preferences for language persistence
- Automatic browser language detection
- AOT compilation for production builds

## Current Translation Coverage

✅ Login page
✅ Register page  
✅ Tabs navigation
✅ Calendar page
✅ Dreams page
✅ Profile page
✅ Language selector

## Future Enhancements

- Add more languages (French, German, etc.)
- Dynamic language switching without page reload
- Date/time localization
- Number formatting per locale
- RTL language support
