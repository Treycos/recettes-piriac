import { Carousel } from "@mantine/carousel";
import {
  Button,
  Divider,
  Image,
  List,
  RingProgress,
  Text,
  Title,
} from "@mantine/core";
import { Link, useParams } from "wouter";

import { ImportedRecipes } from "../utils/importedRecipes";

export const RecipePage = () => {
  const { type, recipe } = useParams<{ type: string; recipe: string }>();

  const { title, parsedMeta, ingredients, steps, images } =
    ImportedRecipes[decodeURIComponent(type)][decodeURIComponent(recipe)];

  return (
    <div>
      <Link href={`/type/${decodeURIComponent(type)}`}>
        <Button variant="outline">go bak</Button>
      </Link>
      <Title order={1}>{title}</Title>
      <Carousel
        withIndicators
        height={200}
        slideSize="33.333333%"
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
                  `../assets/recipes/${decodeURIComponent(
                    type,
                  )}/${decodeURIComponent(recipe)}/${images?.[0].path}`,
                  import.meta.url,
                ).href
              }
              height={160}
              alt="Norway"
            />
          </Carousel.Slide>
        ))}
      </Carousel>
      <RingProgress
        size={170}
        thickness={16}
        label={
          <Text size="xs" ta="center" px="xs" style={{ pointerEvents: "none" }}>
            {parsedMeta?.portions}
          </Text>
        }
        sections={[
          { value: 40, color: "cyan", tooltip: "Documents – 40 Gb" },
          { value: 25, color: "orange", tooltip: "Apps – 25 Gb" },
          { value: 15, color: "grape", tooltip: "Other – 15 Gb" },
        ]}
      />
      <Divider />
      <List>
        {ingredients?.map((ingredient) => (
          <List.Item key={ingredient}>{ingredient}</List.Item>
        ))}
      </List>
      <Divider />
      <List>
        {steps?.map((step) => <List.Item key={step}>{step}</List.Item>)}
      </List>
    </div>
  );
};
