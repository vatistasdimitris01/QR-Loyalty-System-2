import QRCodeStyling from 'qr-code-styling';
import { Business } from '../types';

type QROptions = Partial<Pick<Business, 'qr_logo_url' | 'qr_color' | 'qr_eye_shape' | 'qr_dot_style'>>;

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const generateQrCode = async (token: string, options: QROptions = {}): Promise<string> => {
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: token,
        image: options.qr_logo_url || '',
        dotsOptions: {
            color: options.qr_color || '#000000',
            type: (options.qr_dot_style as any) || 'square' 
        },
        cornersSquareOptions: {
            type: (options.qr_eye_shape as any) || 'square'
        },
        imageOptions: {
            crossOrigin: 'anonymous',
            margin: 5,
            imageSize: 0.3
        }
    });

    try {
        const blob = await qrCode.getRawData('png');
        if (blob) {
            return await blobToBase64(blob);
        }
        return '';
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        // Fallback for environments where canvas/blob might fail
        const fallbackQr = new QRCodeStyling({ width: 300, height: 300, data: token });
        const fallbackBlob = await fallbackQr.getRawData('png');
        if (fallbackBlob) {
            return await blobToBase64(fallbackBlob);
        }
        return '';
    }
};
