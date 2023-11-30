/* eslint-disable no-case-declarations */
import slugify from "@sindresorhus/slugify";
import jszip from "jszip";
import { QualifiedTag, Tag } from "sax";
import sax from "sax";
const { parser } = sax;

export type Recipe = {
  title: string;
  meta?: string;
  parsedMeta?: {
    cook?: string;
    prep?: string;
    portions?: string;
  };
  ingredients?: string[];
  steps?: string[];
  images?: { id: string; path: string }[];
  slug?: string;
};

export type RecipeStage = "title" | "meta" | "ingredients" | "steps";

export const readRels = (rels: string) => {
  const imageRels: { [key: string]: string } = {};
  const relsParser = parser();

  relsParser.onopentag = ({ name, attributes }) => {
    if (name !== "RELATIONSHIP") return;
    if (
      attributes.TYPE !==
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    )
      return;

    if (
      typeof attributes.ID !== "string" ||
      typeof attributes.TARGET !== "string"
    )
      return;

    imageRels[attributes.ID] = attributes.TARGET;
  };

  relsParser.write(rels);

  return imageRels;
};

export const readWord = async (file: File | Buffer) => {
  const res = await new jszip().loadAsync(file);
  const wordDoc = await res.file("word/document.xml")?.async("arraybuffer");
  const wordRels = await res
    .file("word/_rels/document.xml.rels")
    ?.async("arraybuffer");

  const rels = new TextDecoder().decode(wordRels);
  const imageRels = readRels(rels);
  const content = new TextDecoder().decode(wordDoc);

  const imageMap: { [key: string]: any } = {};
  for (const [id, path] of Object.entries(imageRels)) {
    imageMap[id] = await res.file("word/" + path)?.async("nodebuffer");
  }

  const recipe: Recipe[] = [];
  const docParser = parser();

  let stage: RecipeStage = "title";

  const path: (Tag | QualifiedTag)[] = [];
  let textCursor: string[] | null = null;
  let firstBreak = false;
  let txtBuffer: string[] = [];

  const resetBuffer = () => {
    const txt = txtBuffer.map((t) => t.trim()).join("");
    txtBuffer = [];
    return txt;
  };

  docParser.onopentag = async (tag) => {
    const { name, attributes } = tag;
    path.unshift(tag);

    switch (name) {
      case "V:IMAGEDATA":
        if (typeof attributes["R:ID"] !== "string") return;
        recipe[0].images ??= [];
        recipe[0].images.push({
          id: attributes["R:ID"],
          path: imageRels[attributes["R:ID"]].split("/").reverse()[0],
        });
        break;

      case "V:RECT":
        if (attributes["FILLCOLOR"] !== "yellow") return;
        if (stage !== "title" && stage !== "steps") return;

        stage = "title";
        resetBuffer();
        break;

      // case "W:SZ":
      //   if (attributes["W:VAL"] !== "36") return;
      //   if (stage !== "title" && stage !== "steps") return;

      //   stage = "title";
      //   resetBuffer();
      //   break;

      case "W:TBL":
        if (stage !== "meta") return;

        recipe[0].meta = resetBuffer();

        recipe[0].parsedMeta = {
          portions: /Pour\s*(\d[\d/\s]*)/i
            .exec(recipe[0].meta ?? "")?.[1]
            .replace(/\s/g, ""),
          prep: /(préparation|prép\.)\s*(\d[\dmnh\s/]*)(\s|$)/i
            .exec(recipe[0].meta ?? "")?.[2]
            .replace(/\s/g, ""),
          cook: /Cuisson\s*(\d[\dmnh\s/]*)/i
            .exec(recipe[0].meta ?? "")?.[1]
            .replace(/\s/g, ""),
        };

        stage = "ingredients";
        recipe[0].ingredients = [];
        break;

      case "W:TC":
        if (stage !== "ingredients") return;
        break;

      case "W:P":
        if (stage !== "steps") return;
        recipe[0].steps ??= [];
        break;

      case "W:BR":
        if (stage !== "steps") return;
        if (!firstBreak) {
          firstBreak = true;
          return;
        }
        if (txtBuffer.length) recipe[0].steps?.push(resetBuffer());
        firstBreak = false;
        break;
    }
  };

  docParser.onclosetag = (name) => {
    path.shift();

    switch (name) {
      case "W:TBL":
        if (stage !== "ingredients") return;
        textCursor = null;
        stage = "steps";
        break;

      case "W:TC":
        if (stage !== "ingredients") return;
        if (txtBuffer.length) recipe[0].ingredients?.push(resetBuffer());
        break;

      case "W:P":
        if (stage === "title") {
          if (!txtBuffer?.length) return;

          const title = resetBuffer();
          recipe.unshift({
            title,
            slug: slugify(title),
          });

          stage = "meta";
          return;
        }
        if (stage !== "steps") return;
        if (txtBuffer.length) recipe[0].steps?.push(resetBuffer());
        break;
    }
  };

  docParser.ontext = (txt) => {
    if (path[0]?.name !== "W:T") return;

    textCursor?.push(txt);
    txtBuffer?.push(txt);
  };

  docParser.write(content);

  return { recipes: recipe, imageMap };
};
