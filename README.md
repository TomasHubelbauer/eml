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

## Installation

`npm install https://github.com/TomasHubelbauer/eml`

## Usage

```javascript
eml(
  'string',
  7, // number
  helper(),
  …
)
```

### `subject` Helper

`subject('subject')`

### `sender` Helper

`sender('name', 'email')` or `sender('email')`

### `recipient` Helper

`recipient('name', 'email')` or `recipient('email')`

### `inline` Helper

`inline('name', 'type', buffer)`

Use in HTML through `<img src="cid:name@" />`.

## Status

The stuff documented in this readme is working and there are some tests, too.

## Changelog

### `1.0.0` 2020-03-03

Initial release with the `subject`, `sender`, `recipient` and `inline` helpers.

## Testing

`node test` (with or without extension) `npx nodemon test.js` (with extension)
to run the tests on each change.

## To-Do

### Split long HTML lines contextually in order not to break semantics

Do not split tag name, attribute names and attributes values.
Do not split words.

### Split long plain text lines

### Split long header values

Subject, sender(s), recipient(s) etc.

### Allow multiple senders and recipients

Probably by concatenating multiple instances of the helper.

### Add more range and format checks throughout

### Add a helper for attachments

### Include the plain text variant even with HTML-only emails with no multiparts

### Add encoding to the plain and HTML variants to support Unicode
