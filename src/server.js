import App from "./App";
import React from "react";
import { StaticRouter } from "react-router-dom";
import express from "express";
import { renderToString } from "react-dom/server";
import VK from "./vk";

const APP_ID = 7234319;

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

server.get("/auth", async (req, res) => {
  const HOST = "http://localhost:3000/";
  const AUTH_LINK = `https://oauth.vk.com/authorize?client_id=${APP_ID}&display=page&redirect_uri=${HOST}&response_type=token&v=5.103`;

  res.redirect(AUTH_LINK);
});

server.get("/getLikes", async ({ query: { access_token, post_url } }, res) => {
  const response = await VK.analyzePost(access_token, post_url);
  res.status(200).send(JSON.stringify(response));
});

server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get("/*", (req, res) => {
    const context = {};
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>VK Activity</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ""
        }
        ${
          process.env.NODE_ENV === "production"
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    </head>
    <body>
        <div id="root">${markup}</div>
    </body>
</html>`
      );
    }
  });

export default server;
