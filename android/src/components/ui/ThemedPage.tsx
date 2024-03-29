import React, { useEffect, useState } from 'react';
import { StyleProp, ViewStyle, StyleSheet, ScrollView, SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import { DarkerTheme, LightTheme } from '../../styles/theme';
import { useTheme } from '../../styles';
import { Theme } from '@react-navigation/native';
import { Avatar } from '../ui'
import { ActivityIndicator } from 'react-native-paper';
import { Icon } from 'react-native-elements'

let createStyles = (selectedTheme: Theme, style?: any): any => {

    return StyleSheet.create({
        container: {
            backgroundColor: selectedTheme.colors.background,
            bottom: 0,
            height: "100%",
            flex: 1,
            padding: 5,
            ...style,
        },
        header: {
            height: 60,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'space-between',
        },
        headerLeft: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerReturn: {
            color: selectedTheme.colors.text
        },
        title: {
            fontSize: 30,
            marginLeft: 10,
            color: selectedTheme.colors.text,
        },
        avatar: {
            marginRight: 25,
        },
        loader: {
            height: '100%',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center'
        },
        loaderItem: {
            paddingBottom: 70
        },
        loaderText: {
            fontSize: 15,
            color: selectedTheme.colors.primary,
            marginBottom: 5
        },
        networkError: {
            textAlign: 'center',
            backgroundColor: "#5A5A5A",
            color: "white"
        },
        inSyncHeader: {
            backgroundColor: "#4BDE6D",
            alignContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: "center",
            padding: 2
        },
        inSyncMessage: {
            textAlign: 'center',
            color: "white",
            marginRight: 5
        },
        cantConnectMessage: {
            textAlign: 'center',
            marginRight: 5
        }
    });
};

type Props = {
    children: any;
    theme: any;
    noHeader?: boolean;
    showUser?: boolean;
    title?: string;
    style?: StyleProp<ViewStyle>;
    onUserPress?: () => void;
    loader?: boolean;
    showReturn?: boolean;
    onReturnPress?: () => void;
    noNetwork?: boolean;
    inSync?: boolean;
    cantConnect?: boolean;
};

export default ({ children, noHeader, showUser, title, style, onUserPress, loader, showReturn, onReturnPress, noNetwork, inSync, cantConnect }: Props) => {
    const theme = useTheme();

    showUser = showUser === undefined ? true : showUser;
    loader = loader === undefined ? false : loader;
    showReturn = showReturn === undefined ? false : showReturn;
    noNetwork = noNetwork === undefined ? false : noNetwork;
    inSync = inSync === undefined ? false : inSync;
    cantConnect = cantConnect === undefined ? false : cantConnect;

    let selectedTheme = theme.mode === "dark" ? DarkerTheme : LightTheme;

    const styles = createStyles(selectedTheme, style);

    let getHeader = () => {
        return (
            noHeader ? null : (
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {
                            showReturn ?
                                (<TouchableOpacity style={styles.headerReturn} onPress={() => onReturnPress()}>
                                    <Icon name="arrow-back-ios" size={23} color={styles.headerReturn.color} />
                                </TouchableOpacity>)
                                : null
                        }
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    {showUser ?
                        <Avatar
                            style={styles.avatar}
                            size={36}
                            onPress={onUserPress}
                        />
                        : null}
                </View>
            )
        );
    }

    let getSuccessPage = () => {
        return (<ScrollView>
            {children}
        </ScrollView>)
    }

    let getLoaderPage = () => {
        return (<View style={styles.loader}>
            <View style={styles.loaderItem}>
                <Text style={styles.loaderText}>
                    Chargment
                </Text>
                <ActivityIndicator color={selectedTheme.colors.primary} />
            </View>
        </View>)
    }

    let getNetworkErrorPage = () => {
        return (<ScrollView>
            <Text style={styles.networkError}>Connexion au serveur impossible</Text>
            {getSuccessPage()}
        </ScrollView>)
    }

    let getInSyncPage = () => {
        return (<View>
            <View style={styles.inSyncHeader}>
                <Text style={styles.inSyncMessage}>Synchronisation</Text>
                <ActivityIndicator color="white" size={10} />
            </View>
            {getSuccessPage()}
        </View>)
    }

    let getCantConnectPage = () => {
        return <View>
            <Text style={styles.cantConnectMessage}>
                Serveur injoignable. Veuillez Réessayer plus tard.
            </Text>
        </View>
    }

    return (
        <>
            <SafeAreaView
                style={styles.container}>
                {getHeader()}
                {
                    inSync ?
                        getInSyncPage()
                        :
                        cantConnect ?
                            getCantConnectPage()
                            :
                            loader ?
                                (getLoaderPage()) :
                                noNetwork ?
                                    (getNetworkErrorPage()) :
                                    (getSuccessPage())
                }
            </SafeAreaView>
        </>
    );
};
