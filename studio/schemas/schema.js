import createSchema from "part:@sanity/base/schema-creator";

import schemaTypes from "all:part:@sanity/base/schema-type";

import cases from "./cases";
import seo from "./seo";
import contact from "./contact";
import about from './about';

import aboutHeroBlock from './aboutHeroBlock'

export default createSchema({
  name: "default",
  types: schemaTypes.concat([
    seo,
    cases,
    contact,
    about,
    aboutHeroBlock
  ]),
});
