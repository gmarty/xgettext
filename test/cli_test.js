var spawn = require('child_process').spawn,
  path = require('path'),
  fs = require('fs');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

exports.cli = {
  'minimum parameters': function (test) {
    test.expect(1);

    var bin = path.resolve(__dirname + '/../bin/handlebars-xgettext');

    var child = spawn('node', [
      bin,
      'fixtures/default/template.hbs'
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
  }
};
