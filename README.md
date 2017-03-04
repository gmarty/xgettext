# xgettext-template [![build status](https://secure.travis-ci.org/gmarty/xgettext.png)](http://travis-ci.org/gmarty/xgettext)
Extracts translatable strings from source. Identical to [xgettext(1)](http://www.gnu.org/software/gettext/manual/gettext.html#xgettext-Invocation) but for template languages.

## Template language support
* Handlebars (using [gettext-handlebars](https://github.com/smhg/gettext-handlebars))
* Swig (using [gettext-swig](https://github.com/smhg/gettext-swig))
* Volt (using [gettext-volt](https://github.com/perchlayer/gettext-volt))
* EJS (using [gettext-ejs](https://github.com/pekala/gettext-ejs))
* Nunjucks (using [gettext-nunjucks](https://github.com/ministryofprogramming/gettext-nunjucks))

React's **JSX** and **Pug** are todos (PRs are much appreciated).

## Installation
``` bash
$ npm install -g xgettext-template
```

## Usage
``` bash
$ xgettext-template [OPTION] [INPUTFILE]...
```
#### Options
```
Input file location:
  -f, --files-from  get list of input files from FILE
  -D, --directory   add DIRECTORY to list for input files search[default: ["."]]

Output file location:
  -o, --output  write output to specified file          [default: "messages.po"]

Choice of input file language:
  -L, --language  recognise the specified language
                  (Handlebars, Swig, Volt, EJS, Nunjucks)

Input file interpretation:
  --from-code  encoding of input files                        [default: "ascii"]

Operation mode:
  -j, --join-existing  join messages with existing file         [default: false]

Language specific options:
  -k, --keyword  look for WORD as an additional keyword

Output details:
  --force-po     write PO file even if empty                    [default: false]
  --no-location  do not write '#: filename:line' lines          [default: false]

Informative output:
  -h, --help     display this help and exit                            [boolean]
  -V, --version  output version information and exit                   [boolean]
```
More information about each option can be found in the [xgettext manual](https://www.gnu.org/software/gettext/manual/html_node/xgettext-Invocation.html).

#### In Poedit
Go to *File* - *Preferences...* in Poedit and add a new parser in the *Parsers* tab:

![Poedit parser configuration](http://gmarty.github.io/xgettext/Poedit.png)

Please note that in this Windows example you have to use `xgettext-template.cmd`. The `.cmd` extension should not be there on *nix platforms.

## General workflow
In the following Handlebars example translatable content is passed to helpers (`_` and `ngettext`):
``` html
<button>{{_ "Sign in"}}</button>

<p>{{count}} {{ngettext "country" "countries" count}}</p>
```

With Handlebars, this requires helpers being registered:
``` javascript
Handlebars.registerHelper('_', function(msgid) {
  return i18n.gettext(msgid);
});

Handlebars.registerHelper('ngettext', function(msgid, plural, count) {
  return i18n.ngettext(msgid, plural, count);
});
```
What this `i18n` object refers to is up to you. Some (client/server) options are:
* [node-gettext](https://github.com/andris9/node-gettext)
* [Jed](http://slexaxton.github.io/Jed/)

**xgettext-template** parses the strings above out of your templates into gettext's PO files.
These PO files are then translated and compiled to binary MO files using applications like [Poedit](http://www.poedit.net).
The MO files are passed as input the i18n library (above).

## Development

* Clone repository and run `npm install`.
* Run `npm test` to lint & test.

## Note

xgettext-template initial development was founded by Dijiwan.
