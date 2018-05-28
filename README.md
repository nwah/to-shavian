# to-shavian
Transliterate English into the Shavian (Shaw) Alphabet

## Demo
[View a live demo](https://nwah.github.io/to-shavian/)

## Installation
```sh
$ npm install --save to-shavian
```

## Usage
```javascript
const toShavian = require('to-shavian')

toShavian('Hello!')
//-> "𐑣𐑩𐑤𐑴!"
```

## How it works
This library first runs the English input through a part-of-speech tagger. It then looks up each word in a pre-compiled lexicon with over 250k entries. POS data is used to help disambiguate homographs, e.g. the plain verb “read” vs. the past participle “read”.

## File Size
Due to the large bundled lexicon, this library is approximately 20 MB, but should GZIP down close to 3 MB.

## Credits
The lexicon is transpiled from the [Illinois Speech and Language Engineering](http://www.isle.illinois.edu/) group’s [ISLEDict](http://isle.illinois.edu/sst/data/g2ps/) lexicon.

POS tagging is powered by [wink](http://winkjs.org/)’s [wink-pos-tagger](https://github.com/winkjs/wink-pos-tagger).
