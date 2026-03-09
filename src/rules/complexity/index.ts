import { loadRulesFromJson } from '../data/loader.js';

export class ComplexityRules {
  static getRules() {
    return loadRulesFromJson('complexity');
  }
}
