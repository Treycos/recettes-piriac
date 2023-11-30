import { Autocomplete } from "@mantine/core";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import { recipeModules } from "../utils/importedRecipes";

const allRecipes = Object.values(recipeModules);

const fuse = new Fuse(allRecipes, {
  minMatchCharLength: 1,
  keys: ["title"],
  ignoreLocation: true,
});

export const SearchRecipe = () => {
  const [value, setValue] = useState("");
  const [, setLocation] = useLocation();

  const filtered = useMemo(
    () => fuse.search(value).map((recipe) => recipe.item.title),
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
        setLocation(
          `./${allRecipes.find((recipe) => recipe.title === opt)?.slug}`,
        );
        setValue("");
      }}
    />
  );
};
