module.exports = {
  extends: [
    "blitz",
    "plugin:@oursky/eslint",
    "plugin:@oursky/oursky",
    "plugin:@oursky/react-hooks",
    "plugin:tailwindcss/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  plugins: ["@oursky", "tailwindcss", "unused-imports"],
  settings: {
    tailwindcss: {
      callees: ["classnames", "cn"],
    },
  },
  globals: {
    JSX: true,
  },
  rules: { "@next/next/no-img-element": "off" },
}
