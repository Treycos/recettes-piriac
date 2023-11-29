import * as fs from "node:fs/promises";

import { readWord } from "./readDod.ts";

export const loadGroup = async (group: string) => {
  const groupDir = `./assets/recipes/${group}`;

  const dir = await fs.readdir(groupDir);

  const groupRecipes = await Promise.all(
    dir
      .filter((path) => path.endsWith(".docx"))
      .map(async (path) => {
        const a = await fs.readFile(groupDir + "/" + path);
        return await readWord(a);
      }),
  );

  for (const recipeGroup of groupRecipes) {
    for (const recipe of recipeGroup.recipes) {
      const recipeFilename = recipe.title.replace("/", "-");
      const recipePath = `./src/assets/recipes/${group}/${recipeFilename}`;

      await fs.mkdir(recipePath, {
        recursive: true,
      });
      fs.writeFile(`${recipePath}/recipe.json`, JSON.stringify(recipe));

      console.log(recipe.images);
      for (const { id, path } of recipe.images ?? []) {
        console.log(recipeGroup.imageMap, id);
        if (!recipeGroup.imageMap[id]) continue;
        fs.writeFile(`${recipePath}/` + path, recipeGroup.imageMap[id]);
      }

      if (
        !recipe.title ||
        (recipe.title.match(/[A-Z]/g)?.length ?? 0) < recipe.title.length / 4 ||
        !recipe.steps?.length ||
        !recipe.steps.length
      ) {
        console.log("Failed parsing", recipe.title);
      }
    }
  }

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
