import js from "@eslint/js"
import tseslint from "typescript-eslint"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import unusedImports from "eslint-plugin-unused-imports"
import prettier from "eslint-plugin-prettier"
import nextPlugin from "@next/eslint-plugin-next"

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "jest.config.js",
      "jest.setup.ts",
      "eslint.config.mjs",
      "next.config.js",
      "tailwind.config.js",
      "postcss.config.js",
      "./components/ui/**",
      "__tests__/**",
      "./next-env.d.ts",
      "./public/*",
      "./lib/config/search-queries.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      // tailwindcss,
      "unused-imports": unusedImports,
      prettier,
      "@next/next": nextPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "writable",
        browser: true,
        node: true,
        es2021: true,
      },
    },
    rules: {
      // Disable base rules in favor of TypeScript versions
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Unused imports management
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Prettier integration
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],

      // Accessibility
      "jsx-a11y/role-supports-aria-props": "off",

      // Code style
      quotes: ["error", "double"],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error"],

      // React rules
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-filename-extension": [
        "warn",
        {
          extensions: [".tsx"],
        },
      ],
      "react/prop-types": "off",
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: false,
          shorthandLast: true,
          ignoreCase: true,
          noSortAlphabetically: false,
        },
      ],
      "react/react-in-jsx-scope": "off",

      // TypeScript rules
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import rules
      "import/prefer-default-export": "off",

      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
)
