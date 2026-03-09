import { loadRulesFromJson } from '../data/loader.js';

export class CliRules {
  static getRules() {
    return loadRulesFromJson('cli');
  }
}
