import { Card, Flex, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { TbCake, TbSalad, TbSoup } from "react-icons/tb";
import { Link } from "wouter";

import styles from "./CategoryCard.module.css";

const iconMap = {
  "fiches-entrees": <TbSalad className={styles.typeIcon} />,
  "fiches-plats": <TbSoup className={styles.typeIcon} />,
  "fiches-dessert": <TbCake className={styles.typeIcon} />,
};

export const CategoryCard = ({ type }: { type: keyof typeof iconMap }) => {
  const { t } = useTranslation();

  return (
    <Card
      component={Link}
      href={`/${type}`}
      key={type}
      shadow="sm"
      padding="xl"
      radius="md"
      withBorder
    >
      <Flex align="center" justify="center" p="md">
        {iconMap[type]}
      </Flex>
      <Text ta="center" fw={500} truncate="end">
        {t("sheets." + type)}
      </Text>
    </Card>
  );
};
