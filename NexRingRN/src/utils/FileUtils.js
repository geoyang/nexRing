import RNFS from 'react-native-fs';
import { decode } from 'base-64';

const readFile = async (filePath) => {
    try {
        console.log('file path=', filePath);
        const exists = await RNFS.existsAssets(filePath);

        if (exists) {
            const fileName = filePath.match(/[^/]+$/)[0];
            // 读取文件内容
            const content = await RNFS.readFileAssets(filePath, 'base64');
            const binaryData = decode(content);
            const byteArray = Array.from(binaryData, char => {
                const unsignedValue = char.charCodeAt(0);
                const signedValue = unsignedValue > 127 ? unsignedValue - 256 : unsignedValue;
                return signedValue;
            });
            return byteArray;

        } else {
            console.log('file not exist');
        }
    } catch (error) {
        console.log('file error', error);
    }
};

const readFilePath = async (filePath) => {
    try {

        // let destPath;
        // if (filePath.startsWith("content://")) {
        //     const uriComponents = filePath.split("/");
        //     const fileNameAndExtension = uriComponents[uriComponents.length - 1];
        //     destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`;
        //     console.log(`  destPath=${destPath}  fileNameAndExtension=${decodeURI(fileNameAndExtension)}`)
        //     await RNFS.copyFile(filePath, destPath);
        // }
        // console.log(`========readFilePath======destPath==${destPath}====`)
        const exists = await RNFS.exists(filePath);
        console.log(`========readFilePath======exists==${exists}====`)
        if (exists) {
            const fileName = filePath.match(/[^/]+$/)[0];
            const content = await RNFS.readFile(filePath, 'base64');

            const binaryData = decode(content);
            const byteArray = Array.from(binaryData, char => {
                const unsignedValue = char.charCodeAt(0);
                const signedValue = unsignedValue > 127 ? unsignedValue - 256 : unsignedValue;
                return signedValue;
            });
            return {
                data: byteArray,
                fileName
            };
        } else {
            console.log('file not exist');
        }
    } catch (error) {
        console.log('读取文件时出现错误：', error);
    }
};

const isExistFile = async (path) => {
    var isExist = false
    await RNFS.exists(filePath)
        .then((exists) => {
            if (exists) {
                console.log('File exists');
                isExist = true
            } else {
                console.log('File does not exist');
            }
        })
        .catch((error) => {
            console.log('Error checking file existence:', error);
        });
    return isExist
}

export default {
    readFile,
    isExistFile,
    readFilePath
}