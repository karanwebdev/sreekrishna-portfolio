const htmlmin = require("html-minifier");
const { transform: esbuildTransform } = require("esbuild");

const urlFor = require("./utils/imageUrl");
const buildFileUrl = require("./utils/fileUrl");

const string = require("string");
const fs = require("fs");

require("dotenv").config();

const trimText = (text, charCount = 160, addEllipsis = true) => {
  if (text.length > charCount) {
    return addEllipsis
      ? text.slice(0, charCount) + "..."
      : text.slice(0, charCount);
  } else {
    return text;
  }
};

const getSanityImageAspectRatio = (image) => {
  if (!image?.asset) {
    return 0;
  }

  // example asset._ref:
  //  - image-7558c4a4d73dac0398c18b7fa2c69825882e6210-366x96-png
  // When splitting by '-' we can extract ["image", _id, dimensions, extension]
  // unresolved image
  const dimensions = image.asset._ref.split('-')[2];
  // "366x96" -> ["366", "96"] -> [366, 96]
  const [width, height] = dimensions.split('x').map(Number);
  return width / height;
};


module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("static");

  eleventyConfig.addWatchTarget("./src/js/");
  eleventyConfig.setBrowserSyncConfig({
    ghostMode: false,
    injectChanges: true,
    files: ["./dist/css/*.css"],
    callbacks: {
      ready: (err, bs) => {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync("dist/404.html");
          // Add 404 http status code in request header.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
  });

  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addNunjucksShortcode("imageUrlFor", (image) => {
    return urlFor(image).width(2500).fit("max").auto("format");
  });

  
  eleventyConfig.addShortcode('sanityImage', (image, alt = '', width = 1200, priority = 0, classList = '', srcs = null, sizes = null) => {
    const builder = urlFor(image).fit('max').auto('format');

    const baseSizes = [400, 600, 850, 1000, 1150, width];
    const retinaSizes = Array.from(
      new Set([
        ...baseSizes,
        ...baseSizes.map((size) => size * 2),
        ...baseSizes.map((size) => size * 3),
      ]),
    ).sort()
      .filter(
        (size) => size <= width * 3,
      )
      .filter((size, i, arr) => {
        const nextSize = arr[i + 1];
        if (nextSize) {
          return Math.abs(nextSize - size) > 50;
        }

        return true;
      });

    const srcSetContent = retinaSizes.map((size) => `${builder.width(size).url()} ${size}w`).join(', ');
    const sizesContent = `(max-width: ${width}px) 100vw, ${width + 20}px`;

    const aspectRatio = getSanityImageAspectRatio(image);
    const height = aspectRatio > 0 ? Math.round(width * (1 / aspectRatio)) : 0;
    const defaultClassname = `sanity-img ${priority > 0 ? 'sanity-img--priority' : 'sanity-img--lazy'}`;

    return (
      `<img 
        src="${urlFor(image).width(width)}"
        class="${defaultClassname}${classList || ''}"
        srcset="${srcs || srcSetContent}"
        sizes="${sizes || sizesContent}"
        width="${width}"
        ${aspectRatio > 0 && `height="${height}"`}
        loading="${priority > 0 ? 'eager' : 'lazy'}"
        decoding="${priority > 1 ? 'sync' : priority < 0 ? 'async' : 'auto'}"
        fetchpriority="${priority > 1 ? 'high' : priority < 0 ? 'low' : 'auto'}"
        data-aspect="${aspectRatio}"
        style="--aspect:${aspectRatio}"
        alt="${alt}"
      >`
    );
  });

  eleventyConfig.addNunjucksShortcode("fileUrlFor", (file) => {
    return buildFileUrl(file);
  });

  eleventyConfig.addShortcode(
    "trim",
    (text, charCount = 160, addEllipsis = true) => {
      return trimText(text, charCount, addEllipsis);
    }
  );

  eleventyConfig.addFilter("slugify", (input) => {
    if (!input) {
      return false;
    }
    return string(input).slugify().toString();
  });

  eleventyConfig.addFilter("bust", (url) => {
    const [urlPart, paramPart] = url.split("?");
    const params = new URLSearchParams(paramPart || "");
    params.set("v", Date.now());
    return `${urlPart}?${params}`;
  });

  eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
    code,
    callback
  ) {
    try {
      const minified = await esbuildTransform(JSON.stringify(code), { loader: "js" });
      callback(null, minified.code);
    } catch (err) {
      console.error("Esbuild error: ", err);
      callback(null, code);
    }
  });

  return {
    pathPrefix: "/",
    templateFormats: ["html", "njk"],
    passthroughFileCopy: true,
    dir: {
      input: "src/views",
      includes: "_includes",
      data: "_data",
      output: "dist",
    },
  };
};
