/**
 * サーバー駆動型 SSOT (Single Source of Truth)
 * 
 * このファイルは「型のエントリポイント（窓口）」です。
 * 実体は generated.d.ts にあり、バックエンドの Data Object と 100% 同期されています。
 * 各コンポーネントはここからインポートすることで、疎結合なアーキテクチャを維持します。
 */

/**
 * ユーザー型
 */
export type User = App.Data.UserData;

/**
 * 勤怠記録型
 */
export type Attendance = App.Data.AttendanceData;

/**
 * 休憩記録型
 */
export type Rest = App.Data.RestData;

/**
 * 勤怠修正申請
 */
export type AttendanceCorrection = App.Data.AttendanceCorrectionData;

/**
 * 休憩時間の修正申請
 */
export type RestCorrection = App.Data.RestCorrectionData;
