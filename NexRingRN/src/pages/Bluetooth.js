import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    PermissionsAndroid,
    NativeModules
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {bleModule} from '../module/BleModule';
import Characteristic from '../components/Characteristic';
import Header from '../components/Header';
import { BleEventType, BleState } from '../common/Type';
import SDK from '../lib/ringSDK';
import OtaUtil from '../utils/OtaUtil';
import FileUtils from "../utils/FileUtils";
import * as Constant from '../common/Constant'
// import FilePickerManager from 'react-native-file-picker';
import DocumentPicker from 'react-native-document-picker';

var updateValueListener;
const { FileUtilModule } = NativeModules;
const BlueTooth = () => {

    // 蓝牙是否连接
    const [isConnected, setIsConnected] = useState(false);
    // 正在扫描中
    const [scaning, setScaning] = useState(false);
    // 蓝牙是否正在监听
    const [isMonitoring, setIsMonitoring] = useState(false);
    // 当前正在连接的蓝牙id
    const [connectingId, setConnectingId] = useState('');
    // 写数据
    const [writeData, setWriteData] = useState('');
    // 接收到的数据
    const [receiveData, setReceiveData] = useState('');
    // 读取的数据
    const [readData, setReadData] = useState('');
    // 输入的内容
    const [inputText, setInputText] = useState('');
    // 扫描的蓝牙列表
    const [data, setData] = useState([]);
    // 蓝牙连接状态
    const [status, setStatus] = useState('');

    /** 蓝牙接收的数据缓存 */
    const bleReceiveData = useRef([]);
    /** 使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备 */
    const deviceMap = useRef(new Map());

    const isOTAModel = useRef(false);

    const navigation = useNavigation();


    useEffect(() => {
        bleModule.start();
    }, []);

    useEffect(() => {

        const updateStateListener = bleModule.addListener(
            BleEventType.BleManagerDidUpdateState,
            handleUpdateState,
        );
        const stopScanListener = bleModule.addListener(
            BleEventType.BleManagerStopScan,
            handleStopScan,
        );
        const discoverPeripheralListener = bleModule.addListener(
            BleEventType.BleManagerDiscoverPeripheral,
            handleDiscoverPeripheral,
        );
        const connectPeripheralListener = bleModule.addListener(
            BleEventType.BleManagerConnectPeripheral,
            handleConnectPeripheral,
        );
        const disconnectPeripheralListener = bleModule.addListener(
            BleEventType.BleManagerDisconnectPeripheral,
            handleDisconnectPeripheral,
        );
        // updateValueListener = bleModule.addListener(
        //     BleEventType.BleManagerDidUpdateValueForCharacteristic,
        //     handleUpdateValue,
        // );
        ApplyPermissions();
        return () => {
            updateStateListener.remove();
            stopScanListener.remove();
            discoverPeripheralListener.remove();
            connectPeripheralListener.remove();
            disconnectPeripheralListener.remove();
            // updateValueListener.remove();
            console.log(` ==============updateValueListener.remove()=============== `)
        };
    }, []);

    async function ApplyPermissions() {
        // for android dynamic permission,begin start android M;
        if (Platform.OS === 'android' && Platform.Version >= 23 && Platform.Version <= 30) {
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (result === true) {
                console.log('application has the location permission');
            } else {
                console.log('application do not has the location permission');
                // request the permission
                const grant = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission Request',
                        message:
                            'The Bluetooth module needs to access your location information, in order to make the application run smoothly, please give this permission',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'Ok',
                    },
                );
                if (grant === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('user grant the permission request');
                } else {
                    console.log('user refuse the permission request');
                }

                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'File read and write permissions',
                        message: 'The application requires access to files in storage space.',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('user grant the permission request');
                } else {
                    console.log('user refuse the permission request');
                }
            }
        } else if (Platform.OS === 'android' && Platform.Version >= 31) {
            console.log('Platform.Version >= 31');
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (result === true) {
                console.log('application has the bluetooth permission');
            } else {
                console.log('application do not has the bluetooth permission');
                // request the permission
                const grant = await PermissionsAndroid.requestMultiple(["android.permission.BLUETOOTH_SCAN"
                    , 'android.permission.BLUETOOTH_ADVERTISE', 'android.permission.BLUETOOTH_CONNECT', PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]);
                console.log('grant =' + JSON.stringify(grant));
                // if (grant === PermissionsAndroid.RESULTS.GRANTED) {
                //   console.log('user grant the permission request');
                // } else {
                //   console.log('user refuse the permission request');
                // }
            }
        }
    }

    /** 蓝牙状态改变 */
    function handleUpdateState(event) {
        console.log('BleManagerDidUpdateState:', event);
        bleModule.bleState = event.state;
        // 蓝牙打开时自动扫描
        console.log(` event.state=${event.state} `)
        if (event.state === BleState.On) {
            // scan();
        }
    }

    /** 扫描结束监听 */
    function handleStopScan() {
        console.log('Scanning is stopped');
        setScaning(false);
    }

    /** 搜索到一个新设备监听 */
    function handleDiscoverPeripheral(data) {
        console.log('handleDiscoverPeripheral' + JSON.stringify(data));
        // 蓝牙连接 id
        let id;
        // 蓝牙 Mac 地址
        let macAddress;
        if (Platform.OS == 'android') {
            macAddress = data.id;
            id = macAddress;
        } else {
            // ios连接时不需要用到Mac地址，但跨平台识别同一设备时需要 Mac 地址
            macAddress = SDK.getMacFromAdvertising(data);
            id = data.id;
        }
        var isAndroid = Platform.OS == 'android'
        var ringData = SDK.getBroadcastData(data?.advertising?.manufacturerData?.bytes, isAndroid);
        data.color = ringData.color;
        data.size = ringData.size;
        deviceMap.current.set(data.id, data);
        // console.log(`handleDiscoverPeripheral deviceMap=${deviceMap.current}  data=${JSON.stringify(data)} `);
        setData([...deviceMap.current.values()]);
    }

    /** 蓝牙设备已连接 */
    function handleConnectPeripheral(data) {
        console.log('BleManagerConnectPeripheral:', data);
    }

    /** 蓝牙设备已断开连接 */
    function handleDisconnectPeripheral(data) {
        console.log('BleManagerDisconnectPeripheral:', data);
        initData();
    }

    function initData() {
        // 断开连接后清空UUID
        bleModule.initUUID();
        // 断开后显示上次的扫描结果
        setConnectingId('');
        setStatus('');
        setData([...deviceMap.current.values()]);
        setIsConnected(false);
        setWriteData('');
        setReadData('');
        setReceiveData('');
        setInputText('');
    }

    /** 接收到新数据 */
    function handleUpdateValue(data) {
        // console.log(`=========接收到新数据=====handleUpdateValue===========isOTAModel=${isOTAModel.current}== `)
        if (!isOTAModel.current) {
            // console.log(`=========接收到新数据=====handleUpdateValue============== `)
            let value = data.value;
            SDK.pushRawData(value);
        }
    }

    function scan() {
        if (bleModule.bleState !== BleState.On) {
            enableBluetooth();
            return;
        }

        // 重新扫描时清空列表
        deviceMap.current.clear();
        bleModule
            .scan()
            .then(() => {
                setScaning(true);
            })
            .catch(err => {
                setScaning(false);
            });
    }

    function enableBluetooth() {
        if (Platform.OS === 'ios') {
            alert('Please enable Bluetooth on your phone');
        } else {
            Alert.alert('Tip', 'Please enable Bluetooth on your phone', [
                {
                    text: 'Cancel',
                    onPress: () => { },
                },
                {
                    text: 'Open',
                    onPress: () => {
                        bleModule.enableBluetooth();
                    },
                },
            ]);
        }
    }

    /** 连接蓝牙 */
    function connect(item) {
        setConnectingId(item.id);
        setStatus('connecting...');
        if (scaning) {
            // 当前正在扫描中，连接时关闭扫描
            bleModule.stopScan().then(() => {
                setScaning(false);
            });
        }
        var bleName = item.name;
        bleModule
            .connect(item.id)
            .then(peripheralInfo => {
                setIsConnected(true);
                // 连接成功后，列表只显示已连接的设备
                setData([item]);
                Alert.alert('Tip', 'Select Mode', [
                    {
                        text: 'Go to Health',
                        onPress: () => {
                            isOTAModel.current = false
                            updateValueListener?.remove();
                            updateValueListener = bleModule.addListener(
                                BleEventType.BleManagerDidUpdateValueForCharacteristic,
                                handleUpdateValue,
                            );
                            bleModule.startNotification()
                            navigation.navigate('main', {
                                bleName
                            });
                        },
                    },
                    {
                        text: 'Go to OTA',
                        onPress: () => {
                            isOTAModel.current = true
                            updateValueListener?.remove();
                            startOTA()
                        },
                    },
                ]);
            })
            .catch(err => {
                alert('connect failed');
            })
            .finally(() => {
                console.log(`connect finally `);
                setConnectingId('');
            });
    }


    async function startOTA() {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
            });
            let path = ""
            if (Platform.OS == 'android') {
                await FileUtilModule.getFilePath(res.uri, (result) => {
                    path = result.path
                    dealFile(path)
                })
            } else {
                dealFile(res.uri)
            }

            console.log(
                '选择的文件URI: ' + res.uri,
                '选择的文件类型: ' + res.type, // mime类型
                '选择的文件名称: ' + res.name,
                '选择的文件大小: ' + res.size,
                `${JSON.stringify(res)}`
            );

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('用户取消了选择文件');
            } else {
                console.log('选择文件时出现错误: ' + err);
            }
        }
        // FilePickerManager.showFilePicker(null, async (response) => {
        //     if (response.didCancel) {
        //         console.log('use cancel');
        //     } else if (response.error) {
        //         console.log('error:', response.error);
        //     } else if (response.path) {
        //         console.log(response.path);
        //         var result = await FileUtils.readFilePath(response.path)
        //         var bytes = result.data
        //         OtaUtil.setFileName(result.fileName)
        //         console.log(`fileName: ${result.fileName} `)
        //         bleModule.getOtaUUID();
        //         bleModule.startOTANotification(Constant.SPOTA_SERVICE_UUID, Constant.SPOTA_SERV_STATUS_UUID)
        //             .then(() => {
        //                 if (bytes) {
        //                     console.log(` navigation=${JSON.stringify(JSON.stringify(navigation))} `)
        //                     navigation.navigate('ota', {
        //                         bleModule, bytes
        //                     });
        //                 }
        //             })
        //     }
        // });

    }

    async function dealFile(path) {
        var result = await FileUtils.readFilePath(path)
        var bytes = result.data
        OtaUtil.setFileName(result.fileName)
        console.log(`fileName: ${result.fileName} `)
        bleModule.getOtaUUID();
        bleModule.startOTANotification(Constant.SPOTA_SERVICE_UUID, Constant.SPOTA_SERV_STATUS_UUID)
            .then(() => {
                if (bytes) {
                    console.log(` navigation=${JSON.stringify(JSON.stringify(navigation))} `)
                    navigation.navigate('ota', {
                        bleModule, bytes
                    });
                }
            })
    }

    /** 断开连接 */
    function disconnect() {
        bleModule.disconnect();
        initData();
    }

    function notify(index) {
        bleModule
            .startNotification(index)
            .then(() => {
                setIsMonitoring(true);
                alert('Successfully opened');
            })
            .catch(err => {
                setIsMonitoring(false);
                alert('Opening failed');
            });
    }

    function read(index) {
        bleModule
            .read(index)
            .then((data) => {
                setReadData(data);
            })
            .catch(err => {
                alert('read failure');
            });
    }

    function write(writeType) {
        return (index) => {
            if (inputText.length === 0) {
                alert('Please enter the message');
                return;
            }

            bleModule[writeType](inputText, index)
                .then(() => {
                    bleReceiveData.current = [];
                    setWriteData(inputText);
                    setInputText('');
                })
                .catch(err => {
                    alert('fail in send');
                });
        };
    }

    function alert(text) {
        Alert.alert('Tip', text, [{ text: 'OK', onPress: () => { } }]);
    }

    function renderItem(item) {
        const data = item.item;
        const disabled = !!connectingId && connectingId !== data.id;
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                disabled={disabled || isConnected}
                onPress={() => {
                    connect(data);
                }}
                style={[styles.item, { opacity: disabled ? 0.5 : 1 }]}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: 'black' }}>{data.name ? data.name : ''}</Text>
                    <Text style={{ color: 'black', marginLeft: 20 }}>{`color:${ringColor(data.color)} size:${data.size}`}</Text>
                    <Text style={{ marginLeft: 50, color: 'red' }}>
                        {connectingId === data.id ? status : ''}
                    </Text>
                </View>
                <Text>{data.id}</Text>
            </TouchableOpacity>
        );
    }

    function ringColor(val) {
        var color = ""
        switch (val) {
            case 0:
                color = "Deep Black"
                break;
            case 1:
                color = "Silver"
                break;
            case 2:
                color = "Gold"
                break;
            case 3:
                color = "Rose Gold"
                break;
        }
        return color;
    }

    function renderFooter() {
        if (!isConnected) {
            return;
        }
        return (
            <ScrollView
                style={{
                    marginTop: 10,
                    borderColor: '#eee',
                    borderStyle: 'solid',
                    borderTopWidth: StyleSheet.hairlineWidth * 2,
                }}>
                <Characteristic
                    label="写数据（write）："
                    action="发送"
                    content={writeData}
                    characteristics={bleModule.writeWithResponseCharacteristicUUID}
                    onPress={write('write')}
                    input={{ inputText, setInputText }}
                />

                <Characteristic
                    label="写数据（writeWithoutResponse）："
                    action="发送"
                    content={writeData}
                    characteristics={bleModule.writeWithoutResponseCharacteristicUUID}
                    onPress={write('writeWithoutResponse')}
                    input={{ inputText, setInputText }}
                />

                <Characteristic
                    label="读取的数据："
                    action="读取"
                    content={readData}
                    characteristics={bleModule.readCharacteristicUUID}
                    onPress={read}
                />

                <Characteristic
                    label={`通知监听接收的数据（${isMonitoring ? '监听已开启' : '监听未开启'
                        }）：`}
                    action="开启通知"
                    content={receiveData}
                    characteristics={bleModule.nofityCharacteristicUUID}
                    onPress={notify}
                />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                isConnected={isConnected}
                scaning={scaning}
                disabled={scaning || !!connectingId}
                onPress={isConnected ? disconnect : scan}
            />
            <FlatList
                renderItem={renderItem}
                keyExtractor={item => item.id}
                data={data}
                extraData={connectingId}
            />
            {renderFooter()}
        </SafeAreaView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    item: {
        flexDirection: 'column',
        borderColor: 'rgb(235,235,235)',
        borderStyle: 'solid',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingLeft: 10,
        paddingVertical: 8,
    },
});
export default BlueTooth;

