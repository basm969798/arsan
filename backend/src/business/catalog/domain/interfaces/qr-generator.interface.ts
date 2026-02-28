/**
 * عقد توليد أكواد الـ QR - يحدد الوظيفة فقط دون الارتباط بمكتبة معينة
 * مطابقة للبند 3.1: Domain layer must be pure.
 */
export interface IQrGenerator {
  generate(data: string): Promise<string>; // يعيد الكود كـ Base64 أو URL
}
