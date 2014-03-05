var spawn = require('child_process').spawn,
  path = require('path');

var bin = path.resolve(__dirname + '/../bin/handlebars-xgettext');

exports.cli = {
  'no parameters': function (test) {
    test.expect(1);

    var child = spawn('node', [
      bin
    ], {
      cwd: __dirname,
      stdio: ['ignore', null, null]
    });

    child.on('exit', function (code) {
      test.equal(code, 0, 'Unable to run without parameters');
      test.done();
    });
  },
  'minimum parameters': function (test) {
    test.expect(1);

    var child = spawn('node', [
      bin,
      'fixtures/template.hbs'
    ], {
      cwd: __dirname,
      stdio: ['ignore', null, null]
    });

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function (data) {
      test.ok(data.match('This is a fixed sentence'), data);
    });

    child.stderr.on('data', function (err) {
      throw err;
    });

    child.on('exit', function () {
      test.done();
    });
  },
  'keywords': function (test) {
    test.expect(2);

    var child = spawn('node', [
      bin,
      '--from-code=utf8',
      '--keyword=translate',
      '--keyword=i18n',
      'fixtures/keyword.hbs'
    ], {
      cwd: __dirname,
      stdio: ['ignore', null, null]
    });

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function (data) {
      test.ok(data.match('This is a fixed sentence'), data);
      test.ok(data.match('Image description'), data);
    });

    child.stderr.on('data', function (err) {
      throw err;
    });

    child.on('exit', function () {
      test.done();
    });
  }
};
