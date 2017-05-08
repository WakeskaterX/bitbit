/**
 * BIT BIT Conversion Library
 * Author:  Jason Carter 2017
 *
 * Revisions:
 * 05/2017: Jason Carter
 */
const _ = require('lodash');
const assert = require('assert');
const debug = require('debug')('bitbit');


class BitBit {
  constructor(schema) {
    validateSchema(schema);
    this.schema = schema;
  }

  /**
   * Converts an object down to a decimal number based on the bit mappings
   * in the schema
   *
   * @param {object} objToConvert
   * @returns {number}
   */
  pack(objToConvert) {
    if (!this.schema) throw new Error('No Schema Exists!');

    if (_.isNil(objToConvert)) {
      debug('Object to Convert was null or undefined - returning zero');
      return 0;
    }

    let retValue = 0;

    // Get all keys from the schema to convert
    const keysToConvert = _.keys(this.schema);

    _.each(keysToConvert, (k) => {
      const bitInfo = this.schema[k];
      let valueToConvert = _.get(objToConvert, k);

      // For now skip anything that is not a number or boolean
      if (!_.isInteger(valueToConvert) && !_.isBoolean(valueToConvert)) return;

      // Coerce Booleans to Numbers (0, 1)
      valueToConvert = +valueToConvert;

      // Get the bit info - default the second bit value to the first one
      // if no second one was specified - this means it's a single bit value
      const firstBitLocation = bitInfo[0];
      const secondBitLocation = bitInfo[1] || bitInfo[0];
      const maxBits = secondBitLocation - firstBitLocation + 1;

      // Number to & the result with to limit to maxBits
      // For example if you have a single bit available - you can only have 1 or 0
      // passing in 3 will convert it to 1 through (1 & 3)
      const limiter =  parseInt(_.repeat('1', maxBits), 2);

      debug(`For field: ${k}:
        First Bit: ${firstBitLocation}
        Last Bit: ${secondBitLocation}
        Maximum Bits: ${maxBits}
        Number to '&' with: ${limiter}
      `);

      // Convert the value to a bitmask integer value
      let bitValue = (valueToConvert & limiter) << firstBitLocation;
      debug(`Got Bit Value: ${bitValue} by function: (${valueToConvert} & ${limiter}) << ${firstBitLocation}`);

      retValue += bitValue;
    });

    return retValue;
  }

  /**
   * Converts a standard decimal number to the object based on the Schema
   *
   * @param {number} numToConvert
   * @returns {object}
   */
  unpack(numToConvert) {
    if (!this.schema) throw new Error('No Schema Exists!');

    if (_.isNil(numToConvert)) {
      debug('Number to Convert to Object is null or undefined - returning blank object');
      return {};
    }

    let retObj = {};

    const keysToConvert = _.keys(this.schema);

    _.each(keysToConvert, (k) => {
      const bitInfo = this.schema[k];

      // Get the bit info - default the second bit value to the first one
      // if no second one was specified - this means it's a single bit value
      const firstBitLocation = bitInfo[0];
      const secondBitLocation = bitInfo[1] || bitInfo[0];
      const maxBits = secondBitLocation - firstBitLocation + 1;

      // Number to & the result with to limit to maxBits
      // For example if you have a single bit available - you can only have 1 or 0
      // passing in 3 will convert it to 1 through (1 & 3)
      const limiter =  parseInt(_.repeat('1', maxBits), 2);

      const isBoolean = _.isNil(bitInfo[1]) ? true : false;

      let valShifted = (numToConvert >> firstBitLocation) & limiter;

      if (isBoolean) valShifted = valShifted === 1 ? true : false;

      _.set(retObj, k, valShifted);
    });

    return retObj;
  }
}

/**
 * Validate the Schema given
 * Schema must be a single level object where every key
 * maps to an array of 1 or 2 integers
 *
 * @param {object} schema
 * @returns {boolean}
 */
function validateSchema(schema) {
  if (!schema) throw new Error('A Schema must be supplied');
  if (!_.isPlainObject(schema)) throw new Error('Schema must be an object');
  if (_.size(schema) <= 0) throw new Error('Schema must have more than 1 key');

  _.each(schema, (val) => {
    assert(Array.isArray(val), 'Value of Key must be an array.');
    assert((_.size(val) === 1 || _.size(val) === 2), 'Value Array must have 1 or 2 values');
    assert(_.isNumber(val[0]), 'First value in the array must be a number');
    if (val[1]) {
      assert(_.isNumber(val[1]), 'If given, second value in the array must be a number');
      assert(val[1] >= val[0], 'Value 2 if given must be greater than or equal to Value 1');
    }
  });

  // TODO - validate the schema has no overlapping bit fields
  //        i.e { "val1": [0, 4], "val2": [2, 6] }
  //        currently this will just break
}


module.exports = BitBit;
