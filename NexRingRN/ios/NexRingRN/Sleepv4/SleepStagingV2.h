//
//  SleepStagingV2.h
//  sr01sdkProject
//
//  Created by 兰仲平 on 2022/8/16.
//  第二版本的睡眠计算-使用 时间 心率 运动计数

#import <Foundation/Foundation.h>
#import "SleepStagingResultV2.h"
#import "ListUtils.h"
//#import "SleepStagingV2+sleepCLibCall.h"

NS_ASSUME_NONNULL_BEGIN




@interface SleepStagingV2 : NSObject
/// 计算睡眠 V2算法
/// @param hrData @"first" =时间戳 , @"second" =心率, @"third" = 运动计数
-(SleepStagingResultV2 *)findSleepData:(NSMutableArray <NSMutableDictionary *> *)data;




/* 测试使用 */
-(NSMutableArray<NSMutableDictionary *> *)readFile;
-(NSMutableArray<NSMutableDictionary *> *)readFileV3FileName:(NSString *)fileName;
-(NSString *)TestformatTimeStamp:(NSTimeInterval)timeInterval;
@end

NS_ASSUME_NONNULL_END
