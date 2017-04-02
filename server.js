#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const resolve = file => path.resolve(__dirname, file);

const renderer = require('vue-server-renderer').createBundleRenderer(require('./_build/vue-ssr-bundle.json'), {
    template: fs.readFileSync(resolve('./_build/index.html'), 'utf-8')
});

const app = express();

app.use(express.static('./_build'));

app.get('*', (req, res) => {
    if (!renderer) {
        return res.end('waiting for compilation... refresh in a moment.')
    }

    const s = Date.now();

    res.setHeader("Content-Type", "text/html");

    const errorHandler = err => {
        if (err && err.code === 404) {
            res.status(404).end('404 | Page Not Found')
        } else {
            res.status(500).end('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err)
        }
    };

    renderer.renderToStream({ url: req.url })
        .on('error', errorHandler)
        .on('end', () => console.log(`whole request: ${Date.now() - s}ms`))
        .pipe(res);
});

app.listen(8080);