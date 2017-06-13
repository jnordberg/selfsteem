
SelfSteem
=========

Standalone blog powered by the [Steem blockchain](https://steem.io). Built with [Wintersmith](https://github.com/jnordberg/wintersmith).

The output is static html, js and css that can be hosted anywhere.


Setup instructions
------------------

Download and install [node.js](https://nodejs.org).

Download or clone this repository then run:

```
npm install
```

Now you can start the preview server by running:

```
npm run preview
```

When the server is running you can point your browser to http://localhost:8080 and start editing. Then run:

```
npm run build
```

And your static will be built and placed in `build/` ready to be copied to your webserver or webhosting provider.


Configuration
-------------

First change the `username`, `title` and `author` settings in `config.json`. Note that changes to `config.json` will require a server restart to take effect.


Localization
------------

To add another language add your language code to `i18n.locales` in `config.json` and set the `locale` to that code. A new strings file will be created as `locales/<lang>.json` when you start the server.

And please create a PR with any new locales you create.


---

Made by [Johan Nordberg](https://twitter.com/almost_digital) ([@almost-digtal](https://steemit.com/@almost-digital) on steem)
