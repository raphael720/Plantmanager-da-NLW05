import React, { useEffect, useState } from 'react';
import { 
    View,
    StyleSheet,
    Image,
    Text, 
    Alert
} from 'react-native';

import { Header } from '../components/Header';
import { PlantCardSecondary } from '../components/PlantCardSecondary';
import { FlatList } from 'react-native-gesture-handler';
import { loadPlant, PlantProps, removePlant } from '../libs/storage';
import { formatDistance } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Load } from '../components/Load';

import waterdrop from '../assets/waterdrop.png';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { color } from 'react-native-reanimated';

export function MyPlants() {
    const [myPlants, setMyPlants] = useState<PlantProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextWaterd, setNextWatered] = useState<string>();

    function handleRemove(plant: PlantProps) {
        Alert.alert('Remover', `Deseja remover a ${plant.name}?`, [
            {
                text: 'Não 🙏',
                style: 'cancel'
            },
            {
                text: 'Sim 😥',
                onPress: async () => {
                    try {
                        await removePlant(plant.id);
                        setMyPlants((oldData) =>
                            oldData.filter((item) => item.id !== plant.id)
                        );

                    } catch(error) {
                        Alert.alert('Não foi possível remover! 😥');
                    }
                }
            }
        ]);
    }

    useEffect(() => {
        async function loadStorageData() {
            const plantStoraged = await loadPlant();

            if(plantStoraged.length > 0) {
                const nextTime = formatDistance(
                    new Date(plantStoraged[0].dateTimeNotification).getTime(),
                    new Date().getTime(),
                    {locale: pt}
                );
    
                setNextWatered(
                    `Não esqueça de regar a ${plantStoraged[0].name} à ${nextTime} horas.`
                );
    
                setMyPlants(plantStoraged);
            } else {
                setMyPlants([]);
            }
            setLoading(false);
        }

        loadStorageData();
    },[])

    if(loading) {
        return <Load />
    }

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.spotlight}>
                <Image 
                    source={waterdrop} 
                    style={styles.spotlightImage}
                />
                <Text style={styles.spotlightText}>
                    {nextWaterd}
                </Text>
            </View>

            <View style={styles.plants}>
                <Text style={styles.plantsTitle}>
                    Proximas regadas
                </Text>

                <FlatList 
                    data={myPlants}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyList}>
                            <Text style={styles.emoji}>
                                😬
                            </Text>
                            <Text style={styles.emptyTitle}>
                                Nenhuma plantinha foi salva ainda!
                            </Text>
                        </View>
                    )}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <PlantCardSecondary 
                            data={item} 
                            handleRemove={() => {handleRemove(item)}}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flex: 1 }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 50,
        backgroundColor: colors.background
    },
    spotlight: {
        backgroundColor: colors.blue_light,
        paddingHorizontal: 20,
        borderRadius: 20,
        height: 110,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    spotlightImage: {
        width: 60,
        height: 60
    },
    spotlightText: {
        flex: 1,
        color: colors.blue,
        paddingHorizontal: 20
    },
    plants: {
        flex: 1,
        width: '100%',
    },
    plantsTitle: {
        fontSize: 24,
        fontFamily: fonts.heading,
        color: colors.heading,
        marginVertical: 20,
    },
    emptyList: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emoji: {
        fontSize: 30,
        marginTop: -50
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: fonts.text,
        color: colors.heading,
        marginTop: 10
    }
});
