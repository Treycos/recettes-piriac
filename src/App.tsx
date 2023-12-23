import { AppShell, Burger, NavLink, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Link, Redirect, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import "./i18n";
import Logo from "./assets/chef.svg?react";
import { RecipeGrid } from "./components/RecipeGrid";
import { RecipePage } from "./components/RecipePage";
import { SearchRecipe } from "./components/SearchRecipe";
import { ImportedRecipes } from "./utils/importedRecipes";

import styles from "./App.module.css";

function App() {
  const { t } = useTranslation();
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <Router hook={useHashLocation}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header className={styles.header}>
          <div className={styles.topLeft}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link to="/">
              <Logo className={styles.logo} />
            </Link>
          </div>
          <SearchRecipe />
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <ScrollArea>
            {Object.entries(ImportedRecipes).map(([type, recipeGroup]) => (
              <NavLink
                component={Link}
                href={`/${type}`}
                key={type}
                label={t("sheets." + type)}
              >
                {Object.entries(recipeGroup).map(([slug, { title }]) => (
                  <NavLink
                    onClick={close}
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
        <ScrollArea
          className={styles.mainScroll}
          mah="100dvh"
          maw="100dvw"
          component={AppShell.Main}
        >
          <Switch>
            <Route path="/:type">
              <RecipeGrid />
            </Route>
            <Route path="/:type/:recipe">
              <RecipePage />
            </Route>
            <Redirect to="/" />
          </Switch>
        </ScrollArea>
      </AppShell>
    </Router>
  );
}

export default App;
