var spawn = require('child_process').spawn,
  fs = require('fs'),
  path = require('path'),
  assert = require('assert');

var bin = path.resolve(__dirname + '/../bin/xgettext-template');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

var run = function (args, onErr, onEnd) {
  var child = spawn('node', [bin].concat(args), {cwd: __dirname}),
    data = '',
    err = '';

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (chunk) {
    data += chunk;
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (chunk) {
    err += chunk;
  });

  child.on('close', function (code) {
    if (err) {
      onErr(err);
    }

    onEnd(code, data);
  });

  return child;
};

describe('CLI', function () {
  it('should not run without parameters or input', function (done) {
    run([], function () {
      done();
    }, function () {
      throw new Error('Ran without parameters or input');
    });
  });

  it('should handle --keyword parameter', function (done) {
    run(['--output=-', '--from-code=utf8', '--keyword=translate', '--keyword=i18n', 'fixtures/keyword.hbs'], function (err) {
      throw new Error(err);
    }, function (code, data) {
      assert.equal(0, code);
      assert(data.match('This is a fixed sentence'));
      assert(data.match('Image description'));
      done();
    });
  });

  describe('input', function () {
    it('should parse a single file', function (done) {
      run(['--output=-', 'fixtures/template.hbs'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.equal(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });
    });
    it('should parse a single file in a different root directory', function (done) {
      run(['--output=-', '--directory=fixtures', 'template.hbs'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.equal(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });
    });
    it('should handle stdin input', function (done) {
      var child = run(['--output=-', '--language=Handlebars', '--from-code=utf8', '-'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.equal(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });

      child.stdin.write(fs.readFileSync('test/fixtures/template.hbs'));
      child.stdin.end();
    });
  });

  describe('output', function () {
    it('should handle --output parameter', function (done) {
      run(['--output=../tmp/cli-output.po', 'fixtures/template.hbs'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.equal(0, code);
        assert(!data);

        fs.exists(path.join(__dirname, '..', 'tmp', 'cli-output.po'), function (exists) {
          assert(exists);
          done();
        });
      });
    });
  });
});
