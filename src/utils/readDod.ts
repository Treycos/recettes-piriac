/* eslint-disable no-case-declarations */
import slugify from "@sindresorhus/slugify";
import jszip from "jszip";
import { QualifiedTag, Tag } from "sax";
import sax from "sax";
const { parser } = sax;

export type Recipe = {
  title: string;
  titleRaw: string;
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

export const readStyles = (styleXML: string) => {
  const stylesParser = parser();

  let pointer: any = null;
  const styles: any = {};

  stylesParser.onopentag = ({ name, attributes }) => {
    if (name === "W:STYLE") {
      styles[(attributes as any)["W:STYLEID"]] = {};
      pointer = styles[(attributes as any)["W:STYLEID"]];
    }
    if (name === "W:JC" && attributes["W:VAL"] === "center")
      pointer.centered = true;
    if (name === "W:B") pointer.bold = true;
    if (name === "W:SZ") pointer.size = +attributes["W:VAL"];
  };

  stylesParser.onclosetag = (name) => {
    if (name === "W:STYLE") pointer = null;
  };

  stylesParser.write(styleXML);

  return styles;
};

export const parseTitle = (title: string) => {
  return title.replace(
    /[A-Z]+/g,
    (match) => `${match.charAt(0)}${match.slice(1).toLowerCase()}`,
  );
};

export const readWord = async (file: File | Buffer) => {
  const res = await new jszip().loadAsync(file);
  const wordDoc = await res.file("word/document.xml")?.async("arraybuffer");
  const wordRels = await res
    .file("word/_rels/document.xml.rels")
    ?.async("arraybuffer");
  const wordStyles = await res.file("word/styles.xml")?.async("arraybuffer");

  const rels = new TextDecoder().decode(wordRels);
  const imageRels = readRels(rels);
  const content = new TextDecoder().decode(wordDoc);
  const stylesXML = new TextDecoder().decode(wordStyles);

  const textStyles = readStyles(stylesXML);

  const imageMap: { [key: string]: Buffer | undefined } = {};
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

  let cells = 0;
  let ingredientBuffer: string[][] = [];

  let isCentered = false;
  let isBold = false;
  let rectangles = 0;

  const resetBuffer = () => {
    const txt = txtBuffer.join("").replace(/ {2,}/, " ").trim();
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

      case "W:JC":
        if (attributes["W:VAL"] === "center") isCentered = true;
        break;

      case "V:RECT":
        if (attributes["FILLCOLOR"] !== "yellow") return;

        rectangles++;
        break;

      case "W:PSTYLE":
        if (stage !== "title" && stage !== "steps") return;
        isCentered = !!textStyles[(attributes as any)["W:VAL"]].centered;
        isBold = !!textStyles[(attributes as any)["W:VAL"]].bold;
        break;

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

      case "W:P":
        if (stage !== "steps") return;
        recipe[0].steps ??= [];
        break;

      case "W:B":
        isBold = (attributes as any)["W:VAL"] !== "0";
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
      case "W:TR":
        cells = 0;
        break;
      case "W:TBL":
        if (stage !== "ingredients") return;
        textCursor = null;
        stage = "steps";
        recipe[0].ingredients = ingredientBuffer.flat();
        ingredientBuffer = [];
        break;

      case "W:TC":
        if (stage !== "ingredients") return;
        if (!txtBuffer.length) return;
        ingredientBuffer ??= [];
        if (ingredientBuffer.length < cells + 1) ingredientBuffer.push([]);
        ingredientBuffer[cells].push(resetBuffer());
        cells += 1;
        break;

      case "W:P":
        if (stage === "title" || stage === "steps") {
          if (!txtBuffer?.length) break;

          const content = resetBuffer();

          if (content) {
            if (isCentered && isBold) {
              recipe.unshift({
                title: parseTitle(content),
                titleRaw: content,
                slug: slugify(content).slice(0, 30),
              });

              stage = "meta";
            } else {
              recipe[0].steps?.push(content);
            }
          }
        }
        isCentered = false;
        isBold = false;
        break;
    }
  };

  docParser.ontext = (txt) => {
    if (path[0]?.name !== "W:T") return;

    textCursor?.push(txt);
    txtBuffer?.push(txt);
  };

  docParser.write(content);

  if (recipe.length !== rectangles)
    console.log(
      "Rectangle / recipe diff",
      recipe.map((r) => r.title),
      rectangles,
    );

  return { recipes: recipe, imageMap };
};
