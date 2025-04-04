// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/google-fonts',
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "nuxt-lucide-icons",
  ],

  css: ["./stylesheets/global.css"],

  googleFonts: {
    display: 'swap',
    outputDir: 'assets/fonts/',
    families: {
      Fredoka: {
        wght: ["75..125",500]
      },
      Poppins: {
        wght: 300
      }
    }
  },

  lucide: {
    namePrefix: "Lucide"
  },

  app: {
    baseURL: '/sgm/'
  },

  routeRules: {
    "api/hp/**": {
      proxy: "https://hyperplanning.iut.u-bordeaux.fr/Telechargements/ical/**"
    }
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui"
  }
};