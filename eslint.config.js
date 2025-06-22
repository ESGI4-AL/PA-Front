import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * Configuration de Eslint:
 * - Utilise tout les règles recommandés pour les hooks de react
 * - Utilise tout les règles recommandés pour typescript
 * - Ignore les fichiers dist, node_modules, *.config.js et *.config.ts
 * - Check s'il y a des consoles logs dans le code
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', '*.config.js', '*.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': 'off',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
)
