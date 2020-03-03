module.exports = function (...args) {
  const headers = [];
  const plainPart = [];
  const htmlPart = [];
  const multiParts = [];

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (Array.isArray(arg)) {
      // Flatten the args array to enable call sites without the spread operator
      args.splice(index + 1, 0, ...arg);
      continue;
    }

    if (typeof arg === 'string') {
      // TODO: Split the line if too long and be aware of HTML tags
      htmlPart.push(arg);
      continue;
    }

    if (typeof arg === 'number') {
      htmlPart.push(arg.toString());
      continue;
    }

    if (arg instanceof Subject) {
      // TODO: Split the subject line into multiple lines if too long
      headers.push(`Subject: ${arg.subject}`);
      continue;
    }

    // TODO: Split the sender(s) line into multiple lines if too long
    if (arg instanceof Sender) {
      if (arg.sender === arg.email) {
        headers.push(`From: ${arg.sender}`);
      }
      else {
        headers.push(`From: ${arg.sender} <${arg.email}>`);
      }

      continue;
    }

    // TODO: Split the recipient(s) line into multiple lines if too long
    if (arg instanceof Recipient) {
      if (arg.recipient === arg.email) {
        headers.push(`To: ${arg.recipient}`);
      }
      else {
        headers.push(`To: ${arg.recipient} <${arg.email}>`);
      }

      continue;
    }

    if (arg instanceof Inline) {
      multiParts.push(arg);
      continue;
    }

    throw new Error(`Invalid agument ${JSON.stringify(arg)}.`);
  }

  const eml = [];

  // Generate the plain text version by stripping the HTML tags
  let state = 'plain';
  for (const htmlLine of htmlPart) {
    let plainLine = '';
    for (let index = 0; index < htmlLine.length; index++) {
      const char = htmlLine[index];
      switch (state) {
        case 'plain': {
          if (char === '<') {
            state = 'html';
            continue;
          }

          plainLine += char;
          break;
        }
        case 'html': {
          if (char === '>') {
            state = 'plain';
            continue;
          }

          break;
        }
        default: {
          throw new Error(`Invalid state '${state}'.`);
        }
      }
    }

    // Ignore the line if it is completely HTML to avoid an extra line break
    if (plainLine) {
      // TODO: Split the line if it is too long
      plainPart.push(plainLine);
    }
  }

  // TODO: Ditch this and correctly include the plain text version as alternative
  if (multiParts.length === 0) {
    if (headers.length > 0) {
      eml.push(...headers);
    }

    eml.push('Content-Type: text/html');
    eml.push('');
    eml.push(...htmlPart);
  }
  else {
    if (headers.length > 0) {
      eml.push(...headers);
    }

    eml.push('Content-Type: multipart/alternative;');
    eml.push('  boudary=abcdefabcdefabcdefabcdefabcdef')
    eml.push('');
    eml.push('--abcdefabcdefabcdefabcdefabcdef');
    eml.push('');
    eml.push(...plainPart);
    eml.push('');
    eml.push('--abcdefabcdefabcdefabcdefabcdef');
    eml.push('Content-Type: multipart/related');
    eml.push('  boundary=fedcbafedcbafedcbafedcbafedcba');
    eml.push('');
    eml.push('--fedcbafedcbafedcbafedcbafedcba');
    eml.push('Content-Type: text/html');
    eml.push('');
    eml.push(...htmlPart);
    for (const part of multiParts) {
      eml.push('');
      eml.push('--fedcbafedcbafedcbafedcbafedcba');
      eml.push(`Content-Id: ${part.name}@`);
      eml.push(`Content-Disposition: inline; filename="${part.name}"`);
      eml.push(`Content-Type: ${part.type}; name="${part.name}"`);
      eml.push('Content-Transfer-Encoding: BASE64');
      eml.push('');
      eml.push(...part.buffer.toString('base64').match(/.{0,76}/g));
    }

    eml.push('');
    eml.push('--fedcbafedcbafedcbafedcbafedcba--');
    eml.push('');
    eml.push('--abcdefabcdefabcdefabcdefabcdef--');
  }

  return eml;
};

class Subject {
  constructor(subject) {
    this.subject = subject;
  }
}

module.exports.subject = function subject(subject) {
  return new Subject(subject);
};

class Sender {
  constructor(sender, email = sender) {
    if (!email.includes('@') || !email.includes('.', email.indexOf('@'))) {
      throw new Error('Invalid email address.');
    }

    this.sender = sender;
    this.email = email;
  }
}

module.exports.sender = function sender(sender, email) {
  return new Sender(sender, email);
};

class Recipient {
  constructor(recipient, email = recipient) {
    if (!email.includes('@') || !email.includes('.', email.indexOf('@'))) {
      throw new Error('Invalid email address.');
    }

    this.recipient = recipient;
    this.email = email;
  }
}

module.exports.recipient = function recipient(recipient, email) {
  return new Recipient(recipient, email);
};

class Inline {
  constructor(name, type, buffer) {
    this.name = name;
    this.type = type;
    this.buffer = buffer;
  }
}

module.exports.inline = function inline(name, type, buffer) {
  return new Inline(name, type, buffer);
};
