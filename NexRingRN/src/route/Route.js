import React from "react";

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import BlueTooth from "../pages/Bluetooth";
import Main from "../pages/Main";
import Ota from '../pages/Ota'
import UpgradeProcess from '../pages/UpgradeProcess'
const Stack = createStackNavigator();
const Route=()=>{

    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName={"bluetooth"} screenOptions={{headerTitleAlign:"center"}}>
                <Stack.Screen name="bluetooth" component={BlueTooth} ></Stack.Screen>
                <Stack.Screen name="main" component={Main}></Stack.Screen>
                <Stack.Screen name="ota" component={Ota}></Stack.Screen>
                <Stack.Screen name="upgradeProcess" component={UpgradeProcess}></Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    ) 

}

export default Route;