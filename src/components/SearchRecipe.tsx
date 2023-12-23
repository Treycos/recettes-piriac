import { Autocomplete, ComboboxItemGroup } from "@mantine/core";
import { Button, rem } from "@mantine/core";
import {
  Spotlight,
  spotlight,
  SpotlightActionGroupData,
} from "@mantine/spotlight";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbSearch } from "react-icons/tb";
import { useLocation } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";

import "./SearchRecipe.css";

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

export const SearchRecipeZ = () => {
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

export function SearchRecipe() {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [, setLocation] = useLocation();

  const filtered = useMemo(() => {
    const results = fuse.search(value).slice(0, 15);

    const groups = new Set(results.map(({ item }) => item.type));

    const data: SpotlightActionGroupData[] = Array.from(groups).map(
      (group) => ({
        group: t("sheets." + group),
        actions: results
          .filter(({ item }) => item.type === group)
          .map(({ item }) => ({
            id: item.recipe.title,
            label: item.recipe.title,
            onClick: () => {
              setLocation(`/${item.type}/${item?.recipe.slug}`);
              setValue("");
            },
          })),
      }),
    );

    return data;
  }, [value]);

  return (
    <>
      <Button
        onClick={spotlight.open}
        variant="outline"
        leftSection={<TbSearch />}
      >
        {t("search")}
      </Button>
      <Spotlight
        scrollable
        onQueryChange={setValue}
        query={value}
        filter={(_, a) => a}
        actions={filtered}
        nothingFound={value ? "Aucun résultat..." : ""}
        searchProps={{
          leftSection: (
            <TbSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          placeholder: t("search"),
        }}
      />
    </>
  );
}
