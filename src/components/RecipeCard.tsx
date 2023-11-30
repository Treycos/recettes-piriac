import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
import { Link, useParams } from "wouter";

import { Recipe } from "../utils/readDod";

export const RecipeCard = ({ title, images, parsedMeta }: Recipe) => {
  const { type } = useParams<{ type: string }>();

  return (
    <Card
      component={Link}
      href={`/type/${type}/recipe/${title}`}
      key={title}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <Card.Section>
        <Image
          src={
            new URL(
              `../assets/recipes/${decodeURIComponent(
                type,
              )}/${title}/${images?.[0].path}`,
              import.meta.url,
            ).href
          }
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{title}</Text>
        {parsedMeta?.cook && (
          <Badge color="pink" variant="light">
            {parsedMeta?.cook}
          </Badge>
        )}
        {parsedMeta?.portions && (
          <Badge color="blue" variant="light">
            {parsedMeta?.portions}
          </Badge>
        )}
        {parsedMeta?.prep && (
          <Badge color="yellow" variant="light">
            {parsedMeta?.prep}
          </Badge>
        )}
      </Group>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md">
        Book classic tour now
      </Button>
    </Card>
  );
};
