# bitbit
JavaScript Object to Bit Compression Utility and back

To use BitBit, you create a schema to convert objects to pack them down via a mapping to specific bits in a number and back.

Supports:
  * Numbers
  * Booleans
  * Using Lodash Keys for Getter/Setters (see Usage)

Does Not Support:
  * Packing anything other than numbers or booleans down yet

###Usage

``` JavaScript
const BitBit = require('bitbit');

const bitBit = new BitBit({
  level: [0, 7],                  // 128 Levels Available to Pack
  class: [8, 9],                  // 0 - 3 (4 Classes)
  'inventory[0].value': [10, 41], // 32 Bit Integer Available
});

let player = {
  name: 'Joe the Great',
  level: 100,
  class: 1,               // Warrior
  inventory: [
    { name: 'Great Blade of Grass', value: 1 },
    { name: 'Great Shield of Wood', value: 999 },
  ],
};

let packed = bitBit.pack(player);
// 1380

let unpacked = bitBit.unpack(packed);
// { level: 100, class: 1, inventory: [ { value: 1 } ] }
```

### Other Notes
A helpful tip is if you do use the lodash getter setter values in the schema - to use lodash.merge to merge settings back into the original object if you do lose any of the settings in the packing process.