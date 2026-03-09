import { loadRulesFromJson } from '../data/loader.js';

export class AccessibilityRules {
  static getRules() {
    return loadRulesFromJson('accessibility');
  }
}
