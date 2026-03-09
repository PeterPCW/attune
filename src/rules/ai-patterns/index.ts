import { loadRulesFromJson } from '../data/loader.js';

export class AiPatternRules {
  static getRules() {
    return loadRulesFromJson('ai-patterns');
  }
}
