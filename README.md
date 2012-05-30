handlebars-xgettext
===================

Extract translatable strings from Handlebars templates.

## Getting Started

This script is called this way:
```` bash
$ node handlebars-xgettext path/to/handlebars/templates/ translation.pot
````

This will find all the files located in `path/to/handlebars/templates/`, extract translatable strings and create a file called `translation.pot`.

The POT file is a catalog model used to update PO files.

Translatable strings should be marked up like this:
```` handlebars
<button class="btn btn-large">{{gettext "Login"}}</button>
````

This is up to you to define the i18n logic. But you should probably do something like this in your JavaScript:
```` javascript
Handlebars.registerHelper('_', function(key) {
  return i18n.gettext(key);
});
````

The `gettext` helper can also be aliased to `_`:
```` handlebars
<button class="btn btn-large">{{_ "Login"}}</button>
````

[Jed](http://slexaxton.github.com/Jed/) is a very convenient library to manage internationalization from JavaScript in the gettext way.

## Warning

handlebars-xgettext is at a very early stage of development and may not meet your requirements at the moment.

A lot of common features of xgettext are not yet implemented.

But we plan on improving stability and functionalities (see @todo annotations). As such, pull requests or issues are greatly appreciated ;-)

## Note

handlebars-xgettext development was founded by [Dijiwan](http://www.dijiwan.com/).

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
