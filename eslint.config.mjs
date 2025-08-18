const eslintConfig = {
  extends: ['next/core-web-vitals'],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "jsx-a11y/alt-text": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-require-imports": "off",
  },
  ignorePatterns: ["node_modules/", ".next/", "out/"],
};

export default eslintConfig;
