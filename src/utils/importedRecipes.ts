import { Recipe } from "./readDod";

export const recipeModules = import.meta.glob<Recipe>(
  "../assets/recipes/**/recipe.json",
  {
    eager: true,
  },
);

const ImportedRecipes: { [key: string]: { [key: string]: Recipe } } = {};

for (const [path, recipeModule] of Object.entries(recipeModules)) {
  const [, , type] = path.split("/").reverse();
  ImportedRecipes[type] ??= {};
  ImportedRecipes[type][recipeModule.slug ?? ""] = recipeModule;
}

export { ImportedRecipes };
