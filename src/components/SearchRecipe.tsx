import { Autocomplete, ComboboxItemGroup } from "@mantine/core";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [, setLocation] = useLocation();

  const filtered = useMemo(() => {
    const results = fuse.search(value).slice(0, 15);

    const groups = new Set(results.map(({ item }) => item.type));

    const data: ComboboxItemGroup[] = Array.from(groups).map((group) => ({
      group: t("sheets." + group),
      items: results
        .filter(({ item }) => item.type === group)
        .map(({ item }) => item.recipe.title),
    }));

    return data;
  }, [value]);

  return (
    <Autocomplete
      w="25rem"
      placeholder={t("search")}
      data={filtered}
      value={value}
      onChange={setValue}
      onBlur={() => setValue("")}
      onOptionSubmit={(opt) => {
        const recipeMeta = allRecipes.find(
          (recipe) => recipe.recipe.title === opt,
        );
        setLocation(`/${recipeMeta?.type}/${recipeMeta?.recipe.slug}`);
        setValue("");
      }}
    />
  );
};
