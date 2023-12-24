import {
  Anchor,
  Badge,
  Breadcrumbs,
  Container,
  Divider,
  Flex,
  Image,
  List,
  Title,
  Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { TbCooker, TbToolsKitchen, TbUser } from "react-icons/tb";
import { Link, useParams } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";

import styles from "./RecipePage.module.css";

export const RecipePage = () => {
  const { t } = useTranslation();
  const { type, recipe } = useParams<{ type: string; recipe: string }>();

  const { title, parsedMeta, ingredients, steps, images, slug, meta } =
    ImportedRecipes[type][recipe];

  const url = new URL(
    `../assets/recipes/${type}/${slug}/${images?.[0].path}`,
    import.meta.url,
  );

  const fails = url.href.includes("undefined");

  return (
    <Container size="md" pb="xl" mah="100dvh">
      <Breadcrumbs>
        <Link to="/">{t("recipes")}</Link>
        <Link to={`/${type}`}>{t("sheets." + type)}</Link>
        <Anchor
          component={Link}
          to={`/${type}/${slug}`}
          underline="never"
          fw={500}
          truncate="end"
        >
          {title}
        </Anchor>
      </Breadcrumbs>
      <Title m="xl" size="h1">
        {title}
      </Title>
      <Tooltip label={meta}>
        <Flex m="xl" align="center" justify="flex-end" gap="md">
          {parsedMeta?.portions && (
            <Badge variant="outline" size="xl" leftSection={<TbUser />}>
              {parsedMeta?.portions}
            </Badge>
          )}
          {parsedMeta?.cook && (
            <Badge variant="outline" size="xl" leftSection={<TbCooker />}>
              {parsedMeta?.cook}
            </Badge>
          )}
          {parsedMeta?.prep && (
            <Badge variant="outline" size="xl" leftSection={<TbToolsKitchen />}>
              {parsedMeta?.prep}
            </Badge>
          )}
        </Flex>
      </Tooltip>
      {!fails && <Image fit="cover" h={200} src={url.href} radius="md" />}
      <div className={styles.ingredientGrid}>
        {ingredients?.map((ingredient, index) => (
          <Badge variant="light" size="lg" radius="xs" key={index}>
            {ingredient}
          </Badge>
        ))}
      </div>
      <Divider className={styles.divider} />
      <List className={styles.steps}>
        {steps?.map((step) => (
          <List.Item key={step} className={styles.step}>
            {step}
          </List.Item>
        ))}
      </List>
    </Container>
  );
};
