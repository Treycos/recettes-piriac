import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      fr: {
        translation: {
          recipes: "Recettes",
          search: "Chercher une recette",
          sheets: {
            "fiches-entrees": "Entrées",
            "fiches-plats": "Plats",
            "fiches-dessert": "Dessert",
          },
        },
      },
    },
    lng: "fr",
    fallbackLng: "fr",

    interpolation: {
      escapeValue: false,
    },
  });
