import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import BrowseCommunityCard from '../components/BrowseCommunityCard';
import { GradientView, Text } from '../components/Themed';
import GlobalStyles from '../constants/GlobalStyles';
import Layout from '../constants/Layout';
import { CommunitySummary, TabTwoParamList } from '../types';

export default function CommunitiesScreen({ navigation }: StackScreenProps<TabTwoParamList, 'ManageCommunity'>) {
    const CommunitiesList = communities.map((communitySummary: CommunitySummary, index) => {
        return <BrowseCommunityCard key={index} {...communitySummary} onPress={() => navigation.navigate('ManageCommunity')}></BrowseCommunityCard>
    });

    return (
        <GradientView style={styles.container}>
            <ScrollView style={{
                width: Layout.window.width,
                paddingHorizontal: 20,
                marginTop: GlobalStyles.consts.headerContainerHeight
                }}>
                {CommunitiesList}
                <Text style={{
                    color: 'white',
                    paddingVertical: 40,
                    textAlign: 'center',
                }}>There are no more Communities to show.</Text>

            </ScrollView>
        </GradientView>
    );
}


const communities: CommunitySummary[] = [
    {
        name: 'One World Vision',
        logo: require('../assets/images/favicon.png'),
        image: require('../assets/images/temp-children.png'),
        description: 'Finance a school and directly help 10,000+ children reach their full potention.',
        funders: 1000000,
        loansMade: 20,
        totalValueLocked: 854875,
    },
    {
        name: 'Loanr',
        logo: require('../assets/images/favicon.png'),
        image: require('../assets/images/temp-children.png'),
        description: 'Help fund loans to people around the world and receive money back from interest.',
        funders: 100000,
        loansMade: 20,
        totalValueLocked: 300002213,
    },
    {
        name: 'Lorem Ipsum',
        logo: require('../assets/images/favicon.png'),
        image: require('../assets/images/temp-children.png'),
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam venenatis ipsum ut lorem sollicitudin, eget malesuada arcu auctor. Vestibulum vitae diam sed ante volutpat venenatis. Duis accumsan maximus risus, vel auctor neque laoreet et. Cras cursus volutpat ante eget efficitur. Ut mattis eu ante sit amet molestie. Donec tincidunt placerat quam et posuere. Fusce hendrerit fringilla nunc lobortis viverra. Quisque finibus lacinia justo, eget laoreet odio sagittis at. ',
        funders: 1000,
        loansMade: 20,
        totalValueLocked: 300000,
    },
    {
        name: 'Nunc et tincidunt Nunc et tincidunt Nunc et tincidunt',
        logo: require('../assets/images/favicon.png'),
        image: require('../assets/images/temp-children.png'),
        description: 'diam, at dignissim urna. Sed nibh est, iaculis sed aliquam eu, tristique a elit. Phasellus luctus ac enim a maximus. Mauris elementum sodales accumsan. Quisque nulla nunc, malesuada vel bibendum at, dignissim in odio. Nam accumsan lectus vitae auctor gravida. Fusce hendrerit quis nisl at varius. Etiam id lacus elit. Vivamus dictum aliquet varius. Suspendisse enim eros, luctus sit amet magna vel, varius vestibulum orci. Phasellus at sem sit amet nisl consequat accumsan quis in odio. Sed eget tellus vitae risus hendrerit auctor vel sed est. Suspendisse potenti.',
        funders: 10000000000,
        loansMade: 20,
        totalValueLocked: 3012398,
    },
]
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
