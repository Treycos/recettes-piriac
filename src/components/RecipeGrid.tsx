import { useParams } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";
import { RecipeCard } from "./RecipeCard";

import styles from "./RecipeGrid.module.css";

export const RecipeGrid = () => {
  const { type } = useParams<{ type: string }>();

  const recipeGroup = ImportedRecipes[type];

  return (
    <div className={styles.recipeGrid}>
      {Object.entries(recipeGroup)?.map(([path, recipe]) => (
        <RecipeCard key={path} {...recipe} />
      ))}
    </div>
  );
};
