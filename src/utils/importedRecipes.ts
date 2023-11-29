import { Recipe } from "./readDod";

const modules = import.meta.glob<Recipe>("../assets/recipes/**/recipe.json", {
  eager: true,
});

const ImportedRecipes: { [key: string]: { [key: string]: Recipe } } = {};

for (const [path, recipeModule] of Object.entries(modules)) {
  const [, name, type] = path.split("/").reverse();
  ImportedRecipes[type] ??= {};
  ImportedRecipes[type][name] = recipeModule;
}

export { ImportedRecipes };
