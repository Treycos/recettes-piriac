import { Autocomplete } from "@mantine/core";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";

const allRecipes = Object.entries(ImportedRecipes)
  .map(([type, recipes]) =>
    Object.values(recipes).map((recipe) => ({ type, recipe })),
  )
  .flat();

const fuse = new Fuse(allRecipes, {
  minMatchCharLength: 1,
  keys: ["recipe.title"],
  ignoreLocation: true,
});

export const SearchRecipe = () => {
  const [value, setValue] = useState("");
  const [, setLocation] = useLocation();

  const filtered = useMemo(
    () => fuse.search(value).map((recipe) => recipe.item.recipe.title),
    [value],
  );

  return (
    <Autocomplete
      placeholder="Chercher une recette"
      data={filtered}
      value={value}
      onChange={setValue}
      onBlur={() => setValue("")}
      onOptionSubmit={(opt) => {
        const recipeMeta = allRecipes.find(
          (recipe) => recipe.recipe.title === opt,
        );
        setLocation(`./${recipeMeta?.type}/${recipeMeta?.recipe.slug}`);
        setValue("");
      }}
    />
  );
};
