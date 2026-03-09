import { loadRulesFromJson } from '../data/loader.js';

export class DatabaseRules {
  static getRules() {
    return loadRulesFromJson('database');
  }
}
