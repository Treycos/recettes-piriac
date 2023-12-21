import { Carousel } from "@mantine/carousel";
import {
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
import { TbClockPause, TbCooker, TbUser } from "react-icons/tb";
import { Link, useParams } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";

import styles from "./RecipePage.module.css";

export const RecipePage = () => {
  const { t } = useTranslation();
  const { type, recipe } = useParams<{ type: string; recipe: string }>();

  const { title, parsedMeta, ingredients, steps, images, slug, meta } =
    ImportedRecipes[type][recipe];

  return (
    <Container size="md" pb="xl" mah="100dvh">
      <Breadcrumbs>
        <Link to="/">{t("recipes")}</Link>
        <Link to={`/${type}`}>{t("sheets." + type)}</Link>
        <Link to={`/${type}/${slug}`}>{title}</Link>
      </Breadcrumbs>
      <Flex m="xl" align="center" justify="space-between" gap="xl">
        <Title size="h1">{title}</Title>
        <Tooltip label={meta}>
          <Flex align="center" gap="md">
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
              <Badge variant="outline" size="xl" leftSection={<TbClockPause />}>
                {parsedMeta?.prep}
              </Badge>
            )}
          </Flex>
        </Tooltip>
      </Flex>
      {images?.[0] && (
        <Image
          fit="cover"
          h={200}
          src={
            new URL(
              `../assets/recipes/${type}/${recipe}/${images[0].path}`,
              import.meta.url,
            ).href
          }
          radius="md"
        />
      )}
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
      {images && images?.length > 1 && (
        <Carousel
          withIndicators
          height={200}
          slideSize="100%"
          slideGap="md"
          loop
          align="start"
          slidesToScroll={Math.min(images?.length ?? 0, 3)}
        >
          {images?.map((img) => (
            <Carousel.Slide key={img.id}>
              <Image
                src={
                  new URL(
                    `../assets/recipes/${type}/${recipe}/${img.path}`,
                    import.meta.url,
                  ).href
                }
                height={160}
                alt="Norway"
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
    </Container>
  );
};
