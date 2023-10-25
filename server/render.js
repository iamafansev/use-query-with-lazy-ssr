import { ApolloProvider, ApolloClient, createHttpLink } from '@apollo/client';
import { getDataFromTree } from '@apollo/client/react/ssr';
import {renderToPipeableStream} from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { minify } from 'html-minifier';

import App from '../src/App';
import cache from '../src/cache';
import template from './index.html?raw';

// In a real setup, you'd read it from webpack build stats.
const assets = {
  'main.js': '/client/main.js',
  'main.css': '/client/main.css',
};

const SCRIPTS_SEARCH_VALUE = '<!-- SCRIPTS -->';
const CONTENT_SEARCH_VALUE = '<!-- CONTENT -->';

export const splitTemplate = (template) => template.split(CONTENT_SEARCH_VALUE);

const render = async (url, res) => {
  const minifiedTemplate = minify(template, { collapseWhitespace: true });
  const [beginTemplate, endTemplate] = splitTemplate(minifiedTemplate);

  res.socket.on('error', (error) => {
    console.error('Fatal', error);
  });

  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({ uri: 'https://countries.trevorblades.com' }),
    cache,
  });

  const app = (
    <StaticRouter location={url}>
      <ApolloProvider client={client}>
        <App assets={assets} />
      </ApolloProvider>
    </StaticRouter>
  );

  await getDataFromTree(app);

  const {pipe} = renderToPipeableStream(app, {
    onAllReady() {
      res.status(200);
      res.write(beginTemplate);
      pipe(res);
      res.end(endTemplate.replace(SCRIPTS_SEARCH_VALUE, `
        <script>
          window.assetManifest = ${JSON.stringify(assets)};
          window.__APOLLO_STATE__ = ${JSON.stringify(client.extract()).replace(
            /</g,
            '\\u003c'
          )};
        </script>
        <script type="text/javascript" src="${assets['main.js']}"></script>
      `));
    }
  });
}

export default render;
