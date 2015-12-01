# xgettext-template [![build status](https://secure.travis-ci.org/gmarty/xgettext.png)](http://travis-ci.org/gmarty/xgettext)
Extracts translatable strings from source. Identical to [xgettext(1)](http://www.gnu.org/software/gettext/manual/gettext.html#xgettext-Invocation) but for template languages.

*tl;dr* **Get translatable strings from templates into Poedit.**

## Template language support
* Handlebars (using [gettext-handlebars](https://github.com/smhg/gettext-handlebars))
* Swig (using [gettext-swig](https://github.com/smhg/gettext-swig))
* Volt (using [gettext-volt](https://github.com/perchlayer/gettext-volt))

React's **JSX** and **Jade** are todos (PRs are much appreciated).

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

## Installation
``` bash
$ npm install -g xgettext-template
```

## Usage
``` bash
$ xgettext-template [OPTION] [INPUTFILE]...
```
#### Options
* `-D|--directory` add directory to list for input files search.
* `-o|--output` write output to specified file (default: stdout).
* `-L|--language` specifies the language of the input files (default: determine from file extension). Use the language's full name from the **template language support** list above.
* `--from-code` encoding of input files (default: `ascii`).
* `-k|--keyword` additional keyword to be looked for (default: `_,gettext,ngettext:1,2`).
* `--force-po` write PO file even if empty (default: `false`).
* `--no-location` don't add file and line references (default: `false`).

#### In Poedit
Go to *File* - *Preferences...* in Poedit and add a new parser in the *Parsers* tab:

![Poedit parser configuration](http://gmarty.github.io/xgettext/Poedit.png)

Please note that in this Windows example you have to use `xgettext-template.cmd`. The `.cmd` extension should not be there on *nix platforms.

## Development

* Clone repository and run `npm install`.
* Run `npm test` to lint & test.

## Note

xgettext-template initial development was founded by Dijiwan.
