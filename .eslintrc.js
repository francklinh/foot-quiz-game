module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'no-self-compare': 'warn'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  }
};
