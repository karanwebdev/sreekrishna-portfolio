# Aurum

_Front-end boilerplate built on 11ty, Sanity and esbuild._

## What you have

### Tooling

- A simple static site generator with [Eleventy](https://11ty.io)
- Structured content using [Sanity.io](https://www.sanity.io)
- Global deployment on [Netlify](https://netlify.com)
- And a whole bunch of custom code to develop creative websites ✨

## Quick start

1. Clone this repository
2. `pnpm install` in the project root folder on local
3. `pnpm run dev` to start the studio and frontend locally
   - Your studio should be running on [http://localhost:3333](http://localhost:3333)
   - Your frontend should be running on [http://localhost:8080](http://localhost:8080)
4. `pnpm run build` to build to production locally

## Deploy changes

Netlify automatically deploys new changes commited to master on GitHub. If you want to change deployment branch, do so in [build & deploy settings on Netlify](https://www.netlify.com/docs/continuous-deployment/#branches-deploys).


## Deploy on Netlify

You can host both the studio and the 11ty site on [Netlify](https://netlify.com) as two apps. Log in to your Netlify account and add them as two separate apps with the following settings:

### Studio

Add `@sanity/cli` as a dependency to the project

- **Repository**: `<your repository>`
- **Base directory**: `studio`
- **Build command**: `npm run build && cp ./netlify.toml dist`
- **Publish directory**: `studio/dist`

You have to add CORS settings for the studio deployed on Netlify.

You also need to to set a build hook from Sanity to Netlify, in order to rebuild the front end whenever new content is published in the CMS.
