import { Badge, Card, Flex, Group, Image, Text, Tooltip } from "@mantine/core";
import { TbClockPause, TbCooker, TbUser } from "react-icons/tb";
import { Link, useParams } from "wouter";

import { Recipe } from "../utils/readDod";

const filler = new URL(`../assets/chef.svg`, import.meta.url);

export const RecipeCard = ({
  title,
  images,
  parsedMeta,
  slug,
  meta,
  steps,
}: Recipe) => {
  const { type } = useParams<{ type: string }>();

  const url = new URL(
    `../assets/recipes/${type}/${slug}/${images?.[0].path}`,
    import.meta.url,
  );

  const fails = url.href.includes("undefined");

  return (
    <Card
      component={Link}
      href={`/${type}/${slug}`}
      key={slug}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <Card.Section>
        <Image
          fit={fails ? "contain" : undefined}
          src={(fails ? filler : url).href}
          height={160}
          alt={title}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Tooltip label={title}>
          <Text fw={500} truncate="end">
            {title}
          </Text>
        </Tooltip>
      </Group>
      <Flex mt="md" mb="xs" justify="space-between">
        <Text fw={500} span size="sm">
          {steps?.length ?? "?"} étapes
        </Text>
        <Tooltip label={meta}>
          <Group justify="space-between">
            {parsedMeta?.portions && (
              <Badge color="blue" variant="light" leftSection={<TbUser />}>
                {parsedMeta?.portions}
              </Badge>
            )}
            {parsedMeta?.cook && (
              <Badge color="pink" variant="light" leftSection={<TbCooker />}>
                {parsedMeta?.cook}
              </Badge>
            )}
            {parsedMeta?.prep && (
              <Badge
                color="yellow"
                variant="light"
                leftSection={<TbClockPause />}
              >
                {parsedMeta?.prep}
              </Badge>
            )}
          </Group>
        </Tooltip>
      </Flex>
    </Card>
  );
};
