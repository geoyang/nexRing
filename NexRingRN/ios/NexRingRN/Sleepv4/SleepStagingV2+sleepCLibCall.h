//
//  SleepStagingV2+sleepCLibCall.h
//  CareRingApp
//
//  Created by 兰仲平 on 2023/4/18.
//  兼容旧的类


#import "SleepStagingV2.h"
#import "SleepSourceData.h"

NS_ASSUME_NONNULL_BEGIN

@interface SleepStagingV2 (sleepCLibCall)

/// 使用V3 的c算法计算睡眠
/// @param originData 数据库数据
-(SleepStagingResultV2 *)findSleepDataByLib:(NSMutableArray <SleepSourceData *> *)originData;


@end

NS_ASSUME_NONNULL_END
