[![build status](https://secure.travis-ci.org/gmarty/handlebars-xgettext.png)](http://travis-ci.org/gmarty/handlebars-xgettext)
# handlebars-xgettext
> Extract strings from Handlebars source

This is a `xgettext(1)` replacement for Handlebars templates

## Background

When creating Handlebars templates that require translatable strings, you probably set up a helper similar to this:
``` javascript
Handlebars.registerHelper('_', function(msgid) {
  return i18n.gettext(msgid);
});
```
What this i18n object refers to is up to you. For server-side templates it is best to use a gettext implementation that reads binary gettext sources (MO files, see below). [node-gettext](https://github.com/andris9/node-gettext) is a good option in that case.

For client-side templates you probably need to read from JSON data, [Jed](http://slexaxton.github.io/Jed/) can do that.

Independent from the gettext implementation, your templates can contain translatable strings like so:
``` html
<button>{{_ "Sign in"}}</button>
```

Now, you need to get these strings into a translation application. This is where **handlebars-xgettext** comes in. It generates gettext (PO) files by parsing these strings out of your templates.
It are these PO files that are read by translation applications. The most common of them: [Poedit](http://www.poedit.net).

These applications should both generate PO and binary MO files as the end result. These files are then typically passed to your i18n library.

## Usage
#### With Poedit
Install handlebars-xgettext globally:
``` bash
$ npm install -g handlebars-xgettext
```
Configure [Poedit](http://www.poedit.net/) under *File* - *Preferences...* by adding a new parser in the *Parsers* tab with these settings:
![Poedit parser configuration](http://gmarty.github.io/handlebars-xgettext/Poedit.png)

Please note that in this Windows example you have to use `handlebars-xgettext.cmd`, while the extension should of course not be there on *nix platforms.

#### General
You can of course use handlebars-xgettext independent from a translation application.
``` bash
$ handlebars-xgettext [OPTION] [INPUTFILE]...
```
##### Options
* `-D|--directory` add directory to list for input files search.
* `-o|--output` write output to specified file (default stdout).
* `-k|--keyword` additional keyword to be looked for (default `gettext` and `_`).
* `--from-code` encoding of input files (default `ascii`).

## Development

* Run `npm test` or `grunt` to run tests.
* Run `grunt watch` to watch for file changes and run tests.

Pull requests and issues are greatly appreciated ;-)

## Note

handlebars-xgettext initial development was founded by Dijiwan.

## License

Copyright (c) 2012 Guillaume Marty

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
