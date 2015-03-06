# hbars
[Try it now](http://hbars.io/)

###Haml-like syntax for Ember HTMLBars templates.

The goal is to keep the syntax as close to Haml as possible given the Ruby is replaced by HTMLBars helpers. The logic should pass through to HTMLBars with as little manipulation as possible also.

[Documentation](http://hbars.io/)

## Install

```
npm install --save-dev hbars
```

### Ember-cli addon
[ember-cli-hbars](https://github.com/code0100fun/ember-cli-hbars)

```
npm install --save-dev ember-cli-hbars
```

## Contributing

**Pull requests welcome!**

There are many features in Haml that I would like to have available in hbars.

* raw text blocks with `plain:` filter
* raw text lines with leading `/`
* attribute lists spanning multiple lines
* HTML doctypes
* data attributes sub-hash

### Dependencies

```
bower install
npm install
```

### Build

```
npm run build
```

### Test

Testem auto running tests:

```
npm test
```

To run all tests once:

```
./bin/test
```

or to grep a specific set of tests:

```
./bin/test 'compiler'
```

### Vim

Haml syntax highlighting works well for hbars. Add this to your `.vimrc` to automatically highlight *.hbars files:

```
au BufNewFile,BufRead *.hbars set filetype=haml
```
