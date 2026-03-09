import { loadRulesFromJson } from '../data/loader.js';

export class SecurityRules {
  static getRules() {
    return loadRulesFromJson('security');
  }
}
