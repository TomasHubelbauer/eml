# EML

An EML module for Node.

```javascript
const _ = eml(
  recipient('Tomas Hubelbauer', 'tomas@hubelbauer.net'),
  name('Tomas Hubelbauer', 'tomas@hubelbauer.net'),
  subject('Test Email'),
  'Hi there!',
  '<p>Check out this picture:</p>',
  `<img src="${inline('hi.png', await fs.readFile('hi.png'))}" />`,
  `<p>It's CID is ${inline('hi.png')}.</p>`,
  `<p>Check it out again: <img src="${inline('hi.png')}" />.</p>`,
  '<p>See your crap attached.</p>',
  attachment('crap.csv', await fs.readFile('crap.csv')),
  'Thanks!'
);
```

## Features

- Has helpers for various common headers
- Generates plain text version from an HTML email
- Has helpers for inline and attached files
- Slices related contents representation to 76 MIME characters automatically
- Slices long HTML lines to 76 MIME characters automatically and correctly

## Status

An idea for now, but I need it for something, so I'm likely to actually implement this.

## To-Do

### Implement this thing
