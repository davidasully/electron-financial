import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.lightBlue.accent4,
        accent: colors.grey.lighten4
      },
      dark: {
        primary: colors.cyan.darken3,
        error: colors.amber.darken1,
        accent: colors.grey.darken2
      }
    }
  },
  icons: {
    iconfont: 'md',
  },
});