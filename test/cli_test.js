var spawn = require('child_process').spawn,
  fs = require('fs'),
  path = require('path');

var bin = path.resolve(__dirname + '/../bin/handlebars-xgettext');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

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
  },
  'output': function (test) {
    test.expect(0);

    var child = spawn('node', [
      bin,
      '--output=../tmp/cli-output.po',
      'fixtures/template.hbs'
    ], {
      cwd: __dirname,
      stdio: ['ignore', null, null]
    });

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function () {
      throw 'There should not be any output';
    });

    child.stderr.on('data', function (err) {
      throw err;
    });

    child.on('exit', function () {
      test.done();
    });
  },
  'stdin input': function (test) {
    test.expect(1);

    var child = spawn('node', [
      bin,
      '--from-code=utf8',
      '-'
    ], {
      cwd: __dirname
    });

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function (data) {
      test.ok(data.match('This is a fixed sentence'), data);
    });

    child.stderr.setEncoding('utf8');

    child.stderr.on('data', function (err) {
      throw err;
    });

    child.on('exit', function () {
      test.done();
    });

    child.stdin.write(fs.readFileSync('test/fixtures/template.hbs'));
    child.stdin.end();
  }
};
