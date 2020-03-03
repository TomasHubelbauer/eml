const fs = require('fs-extra');
const eml = require('.');
const { subject, sender, recipient, inline } = require('.');

function diff(actual, expected, index = 0) {
  const length = Math.max(actual.length, expected.length);
  const order = length.toString().length;

  console.log(`   | ${' '.repeat(order)} | Actual                         |   | ${' '.repeat(order)} | Expected                       |`);
  console.log(`   |-${'-'.repeat(order)}-|--------------------------------|---|-${'-'.repeat(order)}-|--------------------------------|`)
  for (let lineIndex = Math.max(0, index - 5); lineIndex < Math.min(length, index + 5); lineIndex++) {
    const rel = actual[lineIndex] === expected[lineIndex] ? '=' : '≠';

    const actualBit = (actual[lineIndex] || '').slice(0, 30);
    const actualPad = ' '.repeat(30 - actualBit.length);
    const expectedBit = (expected[lineIndex] || '').slice(0, 30);
    const expectedPad = ' '.repeat(30 - expectedBit.length);

    const indexPad = ' '.repeat(order - lineIndex.toString().length);
    const actualIndex = actual[lineIndex] === undefined ? ' '.repeat(order) : indexPad + lineIndex;
    const expectedIndex = expected[lineIndex] === undefined ? ' '.repeat(order) : indexPad + lineIndex;
    console.log(`  ${lineIndex === index ? '>' : ' '}| ${actualIndex} | ${actualBit}${actualPad} | ${rel} | ${expectedIndex} | ${expectedBit}${expectedPad} |${lineIndex === index ? '<' : ' '}`);
  }
}

function test(test, actual, ...expected) {
  const length = Math.max(actual.length, expected.length);
  for (let index = 0; index < length; index++) {
    if (actual[index] !== expected[index]) {
      console.log(`☒ ${test}`);
      console.log(`  The actual element (${actual[index]}) and expected element (${expected[index]}) differ at index ${index}.`);
      diff(actual, expected, index);
      return;
    }
  }

  console.log('☑', test);
}

void async function () {
  test('A single string',
    eml('Test'),
    'Content-Type: text/html',
    '',
    'Test'
  );

  test('Flattening args',
    eml(1, [2, [3, [4]]]),
    'Content-Type: text/html',
    '',
    '1',
    '2',
    '3',
    '4'
  );

  test('A string body with the subject helper',
    eml(subject('Subject'), 'Body'),
    'Subject: Subject',
    'Content-Type: text/html',
    '',
    'Body'
  );

  test('A string body with the subject, sender and recipient helpers',
    eml(
      subject('Subject'),
      sender('tomas@hubelbauer.net'),
      recipient('Tomas Hubelbauer', 'tomas@hubelbauer.net'),
      'Body'
    ),
    'Subject: Subject',
    'From: tomas@hubelbauer.net',
    'To: Tomas Hubelbauer <tomas@hubelbauer.net>',
    'Content-Type: text/html',
    '',
    'Body'
  );

  test('An inline image is used',
    eml(
      subject('Subject'),
      sender('tomas@hubelbauer.net'),
      recipient('Tomas Hubelbauer', 'tomas@hubelbauer.net'),
      'Check out this image:',
      inline('hi.png', 'image/png', await fs.readFile('test/hi.png')),
      '<img src="cid:hi@" />'
    ),
    'Subject: Subject',
    'From: tomas@hubelbauer.net',
    'To: Tomas Hubelbauer <tomas@hubelbauer.net>',
    'Content-Type: multipart/alternative;',
    '  boudary=abcdefabcdefabcdefabcdefabcdef',
    '',
    '--abcdefabcdefabcdefabcdefabcdef',
    '',
    'Check out this image:',
    '',
    '--abcdefabcdefabcdefabcdefabcdef',
    'Content-Type: multipart/related',
    '  boundary=fedcbafedcbafedcbafedcbafedcba',
    '',
    '--fedcbafedcbafedcbafedcbafedcba',
    'Content-Type: text/html',
    '',
    'Check out this image:',
    '<img src="cid:hi@" />',
    '',
    '--fedcbafedcbafedcbafedcbafedcba',
    'Content-Id: hi.png@',
    'Content-Disposition: inline; filename="hi.png"',
    'Content-Type: image/png; name="hi.png"',
    'Content-Transfer-Encoding: BASE64',
    '',
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAAXNSR0IArs4c6QAAAARnQU1BAACx',
    'jwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVChTY/z//z8DbsAEpXEAkDQjIyOEA2Eg',
    'k0ToBgKgWohyNACVBjoQqxtxGg5RjVMaYhcl/mZgAADzdg8Zfdv3TwAAAABJRU5ErkJggg==',
    '',
    '',
    '--fedcbafedcbafedcbafedcbafedcba--',
    '',
    '--abcdefabcdefabcdefabcdefabcdef--',
  );
}()
