import slugify from "@sindresorhus/slugify";
import * as fs from "node:fs/promises";

import { readWord } from "./readDod.ts";

export const loadGroup = async (group: string) => {
  const groupDir = `./assets/recipes/${group}`;

  const dir = await fs.readdir(groupDir);

  const groupRecipes = await Promise.all(
    dir
      .filter((path) => path.endsWith(".docx"))
      .filter((path) =>
        process.argv[2] ? path.includes(process.argv[2]) : true,
      )
      .map(async (path) => {
        const a = await fs.readFile(groupDir + "/" + path);
        return {
          ...(await readWord(a)),
          filename: path,
        };
      }),
  );

  let failed = 0;

  for (const recipeGroup of groupRecipes) {
    for (const recipe of recipeGroup.recipes) {
      const recipeFilename = recipe.title.replace("/", "-");
      const recipePath = `./src/assets/recipes/${slugify(group)}/${slugify(
        recipeFilename,
      )}`;

      await fs.mkdir(recipePath, {
        recursive: true,
      });
      fs.writeFile(`${recipePath}/recipe.json`, JSON.stringify(recipe));

      for (const { id, path } of recipe.images ?? []) {
        if (!recipeGroup.imageMap[id]) continue;
        fs.writeFile(`${recipePath}/` + path, recipeGroup.imageMap[id]!);
      }

      if (
        !recipe.title ||
        (recipe.titleRaw.match(/[A-Z]/g)?.length ?? 0) <
          recipe.title.length / 4 ||
        !recipe.steps?.length ||
        !recipe.steps.length
      ) {
        console.log("Failed parsing", recipeGroup.filename, recipe);
        failed++;
      }
    }
  }

  console.log("Failed: ", failed);

  return groupRecipes;
};

export const loadRecipes = async () => {
  await fs.rm(`./src/assets/recipes`, { recursive: true, force: true });
  const desserts = await loadGroup("Fiches dessert");
  const entrees = await loadGroup("Fiches entrées");
  const plats = await loadGroup("Fiches plats");

  console.log(desserts.length, entrees.length, plats.length);
};

loadRecipes();
