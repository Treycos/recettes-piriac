import { AppShell, Burger, NavLink, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Redirect, Route, Switch } from "wouter";

import Logo from "./assets/chef.svg?react";
import { RecipeGrid } from "./components/RecipeGrid";
import { RecipePage } from "./components/RecipePage";
import { SearchRecipe } from "./components/SearchRecipe";
import { ImportedRecipes } from "./utils/importedRecipes";

import styles from "./App.module.css";

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Logo className={styles.logo} />
        <SearchRecipe />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <ScrollArea>
          {Object.entries(ImportedRecipes).map(([type, recipeGroup]) => (
            <NavLink component={Link} href={`/${type}`} key={type} label={type}>
              {Object.entries(recipeGroup).map(([slug, { title }]) => (
                <NavLink
                  component={Link}
                  href={`/${type}/${slug}`}
                  key={slug}
                  label={title}
                />
              ))}
            </NavLink>
          ))}
        </ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main className={styles.main}>
        <Switch>
          <Route path="/:type">
            <RecipeGrid />
          </Route>
          <Route path="/:type/:recipe">
            <RecipePage />
          </Route>
          <Redirect to="/" />
        </Switch>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
