import PropTypes from "prop-types"
import React from "react";
import { View, TouchableOpacity, Text,StyleSheet } from "react-native"
const Header = (props) => {
    const {  disabled, isConnected, onPress, scaning } = props;
    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.buttonView, { opacity: disabled ? 0.7 : 1 }]}
                disabled={disabled}
                onPress={onPress}>
                <Text style={[styles.buttonText]}>
                    {scaning ? '正在搜索中' : isConnected ? '断开蓝牙连接' : '搜索蓝牙'}
                </Text>
            </TouchableOpacity>

            <Text style={{ marginLeft: 10, marginTop: 10 }}>
                {isConnected ? '当前连接的设备' : '可用设备'}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    buttonView: {
        backgroundColor: 'rgb(33, 150, 243)',
        paddingHorizontal: 10,
        marginHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
});
Header.prototype = {
    isConnected: PropTypes.bool.isRequired,
    scaning: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
}

export default Header;