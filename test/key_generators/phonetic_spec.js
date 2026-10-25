/* global describe, it */

const assert = require('assert');

const Generator = require('../../lib/key_generators/phonetic');

const vowels = 'aeiou';
const consonants = 'bcdfghjklmnpqrstvwxyz';

describe('RandomKeyGenerator', () => {
  describe('randomKey', () => {
    it('should return a key of the proper length', () => {
      const gen = new Generator();
      assert.equal(6, gen.createKey(6).length);
    });

    it('should alternate consonants and vowels', () => {
      const gen = new Generator();

      const key = gen.createKey(3);

      const isVowel = (character) => vowels.includes(character);
      assert.notEqual(isVowel(key[0]), isVowel(key[1]));
      assert.notEqual(isVowel(key[1]), isVowel(key[2]));
    });
  });
});
