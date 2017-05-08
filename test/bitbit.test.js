/**
 * Bit Bit Tests
 */
const BitBit = require('../index');
const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

chai.use(require('chai-shallow-deep-equal'));

const schema = {
  level: [0, 7],      // 0 - 128 levels
  class: [8, 9],      // 4 total classes (0 - 3)
  isAwesome: [10],    // Boolean - whether player is awesome
};

const schemaB = {
  'class.index': [0, 1],      // 0 - 3
  'playerValues[0]': [2],     // Boolean Value
  'playerValues[1]': [3, 3],  // Single Bit Number Value
};

const bitPlayer = new BitBit(schema);
const bitPlayer2 = new BitBit(schemaB);

describe('Bit Bit Conversion Unit Tests', () => {
  it('should convert an object to a bit value based on a schema and back and ignore extra fields', () => {
    let val = bitPlayer.pack({
      isAwesome: true,
      level: 100,
      class: 0,
      name: 'Bob',
    });

    expect(val).to.equal(1124);

    let obj = bitPlayer.unpack(val);

    expect(obj).to.shallowDeepEqual({
      isAwesome: true,
      level: 100,
      class: 0,
    });
  });

  it('should unpack a value and convert it to the proper object', () => {
    let obj = bitPlayer.unpack(300);

    expect(obj).to.shallowDeepEqual({
      level: 44,
      class: 1,
    });
  });

  it('should ignore if a field is not a boolean or number even if it is in the schema', () => {
    let val = bitPlayer.pack({
      level: '500',
      class: 1,
    });

    expect(val).to.equal(256);
  });

  it('should limit fields to the maximum and not break', () => {
    let val = bitPlayer.pack({
      level: 384,       // 128 + 256
      class: 0,
      isAwesome: false,
    });

    expect(val).to.equal(128);

    let obj = bitPlayer.unpack(val);

    expect(obj).to.shallowDeepEqual({
      level: 128,
      class: 0,
      isAwesome: false,
    });
  });

  it('should let you use lodash notation in the schema to access nested fields', () => {
    let val = bitPlayer2.pack({
      class: {
        index: 3,
        name: 'Mage',
      },
      playerValues: [
        true,
        1,
      ],
    });

    expect(val).to.equal(15);

    let obj = bitPlayer2.unpack(val);

    expect(obj).to.shallowDeepEqual({
      class: {
        index: 3,
      },
      playerValues: [true, 1],
    });
  });

  describe('Error Handling', () => {
    it('should throw an error if no schema is given', () => checkThrown());

    it('should throw an error if the schema was not an object', () => checkThrown([]));

    it('should throw an error if the schema has no fields', () => checkThrown({}));

    it('should throw an error if the schema has fields that do not have an array', () => checkThrown({ field: 5 }));

    it('should throw an error if the array in the field is empty', () => checkThrown({ field: [] }));

    it('should throw an error if the array has more than 2 fields', () => checkThrown({ field: [0, 1, 2] }));

    it('should throw an error if the array has values that are not numbers', () => checkThrown({ field: ['A'] }));

    // TODO - make this work
    it.skip('should throw an error if the schema has fields with values that overlap', () => checkThrown({ fieldA: [0, 2], fieldB: [1, 3] }));
  });
});

function checkThrown(schema) {
  let errorHappened = false;
  try {
    new BitBit(schema);
  } catch (e) {
    errorHappened = true;
  }

  assert(errorHappened, 'Should have thrown an error');
}
