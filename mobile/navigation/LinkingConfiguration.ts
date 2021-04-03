import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Browse: {
            screens: {
              BrowseScreen: 'one',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'two',
            },
          },
        },
      },
      LandingScreen: 'landing',
      NotFound: '*',
    },
  },
};
