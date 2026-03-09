/**
 * Stylelint configuration for CSS quality checks
 *
 * Rules to enforce:
 * - Use of CSS custom properties (variables) for repeated values
 * - No duplicate color values across the codebase
 * - General CSS best practices
 */
{
  "extends": "stylelint-config-standard",
  "customSyntax": "postcss-html",
  "rules": {
    "color-named": "never",
    "color-no-hex": null,
    "keyframe-declaration-no-important": true,
    "property-no-vendor-prefix": true,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "value-keyword-case": "lower"
  }
}
