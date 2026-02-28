import * as QRCode from 'qrcode';
import { IQrGenerator } from '../../domain/interfaces/qr-generator.interface';

/**
 * تنفيذ تقني لتوليد الـ QR باستخدام مكتبة qrcode
 * مطابقة للبند 3.3: Infrastructure is purely technical.
 */
export class QrCodeService implements IQrGenerator {
  async generate(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      throw new Error('FAILED_TO_GENERATE_QR');
    }
  }
}
