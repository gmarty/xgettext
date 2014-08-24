# xgettext-template [![build status](https://secure.travis-ci.org/gmarty/xgettext.png)](http://travis-ci.org/gmarty/xgettext)
> Extract strings from Handlebars source. `xgettext(1)` replacement for Handlebars templates.

*tl;dr* **Get translatable strings from templates into Poedit.**

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

<!-- and a simple plural example: -->
<p>{{count}} {{ngettext "country" "countries" count}}</p>
```

Now, you need to get these strings into a translation application. This is where **xgettext-template** comes in. It generates gettext (PO) files by parsing these strings out of your templates.
It are these PO files that are read by translation applications. The most common of them: [Poedit](http://www.poedit.net).

These applications should both generate PO and binary MO files as the end result. These files are then typically passed to your i18n library.

## Usage
#### With Poedit
Install xgettext-template globally:
``` bash
$ npm install -g xgettext-template
```
Configure [Poedit](http://www.poedit.net/) under *File* - *Preferences...* by adding a new parser in the *Parsers* tab with these settings:

![Poedit parser configuration](http://gmarty.github.io/xgettext/Poedit.png)

Please note that in this Windows example you have to use `xgettext-template.cmd`, while the extension should of course not be there on *nix platforms.

#### General
You can of course use xgettext-template independent from a translation application.
``` bash
$ xgettext-template [OPTION] [INPUTFILE]...
```
##### Options
* `-D|--directory` add directory to list for input files search.
* `-o|--output` write output to specified file (default: stdout).
* `-L|--language` specifies the language of the input files (default: determine from file extension).
* `--from-code` encoding of input files (default: `ascii`).
* `-k|--keyword` additional keyword to be looked for (default: `_,gettext,ngettext:1,2`).
* `--force-po` write PO file even if empty (default: `false`).
* `--no-location` don't add file and line references (default: `false`).
 
## Development

* Clone repository and run `npm install`.
* Run `npm test` to lint & test.

Pull requests and issues are greatly appreciated ;-)

## Note

xgettext-template initial development was founded by Dijiwan.
