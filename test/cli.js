const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bin = path.resolve(path.join(__dirname, '/../bin/xgettext-template'));

const tmpDir = path.resolve(path.join(__dirname, '/../tmp'));
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const run = function (args, onErr, onEnd) {
  const child = spawn('node', [bin].concat(args), { cwd: __dirname });
  let data = '';
  let err = '';

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
    } else {
      onEnd(code, data);
    }
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

  it('should handle --keyword parameter adding to defaults', function (done) {
    run(['--output=-', '--from-code=utf8', '--keyword=translate', '--keyword=i18n', 'fixtures/keyword.hbs'], function (err) {
      throw new Error(err);
    }, function (code, data) {
      assert.strictEqual(0, code);
      assert(data.match('This is a fixed sentence'));
      assert(data.match('Image description'));
      assert(data.match('This is a fixed sentence with a default keyword'));
      assert(data.match(/msgid/g).length === 4);
      done();
    });
  });

  it('should handle only -k which removing all defaults before --from-code', function (done) {
    run(['--output=-', '-k', '--from-code=utf8', 'fixtures/keyword.hbs'], function (err) {
      throw new Error(err);
    }, function (code, data) {
      assert.strictEqual(0, code);
      assert(data.length === 0);
      done();
    });
  });

  it('should handle only -k which removing all defaults at end', function (done) {
    run(['--output=-', '--from-code=utf8', 'fixtures/keyword.hbs', '-k'], function (err) {
      throw new Error(err);
    }, function (code, data) {
      assert.strictEqual(0, code);
      assert(data.length === 0);
      done();
    });
  });

  it('should handle --keyword parameter removing defaults', function (done) {
    run(['--output=-', '--from-code=utf8', '-k', '--keyword=translate', '--keyword=i18n', 'fixtures/keyword.hbs'], function (err) {
      throw new Error(err);
    }, function (code, data) {
      assert.strictEqual(0, code);
      assert(data.match('This is a fixed sentence'));
      assert(data.match('Image description'));
      assert(data.match(/msgid/g).length === 3);
      assert(!data.match('This is a fixed sentence with a default keyword'));
      done();
    });
  });

  describe('input', function () {
    it('should parse a single file', function (done) {
      run(['--output=-', 'fixtures/template.hbs'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.strictEqual(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });
    });

    it('should parse a single file in a different root directory', function (done) {
      run(['--output=-', '--directory=fixtures', 'template.hbs'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.strictEqual(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });
    });

    it('should read input from a file', function (done) {
      run(['--output=-', '--files-from=fixtures/list.txt'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.strictEqual(0, code);
        assert(data.match('This is a fixed sentence'));
        done();
      });
    });

    it('should handle stdin input', function (done) {
      const child = run(['--output=-', '--language=Handlebars', '--from-code=utf8', '-'], function (err) {
        throw new Error(err);
      }, function (code, data) {
        assert.strictEqual(0, code);
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
        assert.strictEqual(0, code);
        assert(!data);

        fs.access(path.join(__dirname, '..', 'tmp', 'cli-output.po'), fs.constants.F_OK, function (err) {
          if (err) {
            throw err;
          }

          assert(!err);
          done();
        });
      });
    });
  });
});
