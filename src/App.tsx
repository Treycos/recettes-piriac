import { AppShell, Burger, NavLink, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Redirect, Route, Switch } from "wouter";

import { RecipeGrid } from "./components/RecipeGrid";
import { RecipePage } from "./components/RecipePage";
import { ImportedRecipes } from "./utils/importedRecipes";

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
        <div>Logo</div>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <ScrollArea>
          {Object.entries(ImportedRecipes).map(([type, recipeGroup]) => (
            <NavLink
              component={Link}
              href={`/type/${type}`}
              key={type}
              label={type}
            >
              {Object.entries(recipeGroup).map(([name]) => (
                <NavLink
                  component={Link}
                  href={`/type/${type}/recipe/${name}`}
                  key={name}
                  label={name}
                />
              ))}
            </NavLink>
          ))}
        </ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main>
        <ScrollArea>
          <Switch>
            <Route path="/type/:type">
              <RecipeGrid />
            </Route>
            <Route path="/type/:type/recipe/:recipe">
              <RecipePage />
            </Route>
            <Redirect to="/" />
          </Switch>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
