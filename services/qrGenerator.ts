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

export const generateQrCode = async (token: string, options: QROptions = {}, joinBusinessId?: string): Promise<string> => {
    let urlData = token;
    if (token.startsWith('cust_')) {
        let baseUrl = `${window.location.origin}/customer?token=${token}`;
        if (joinBusinessId) {
            baseUrl += `&join=${joinBusinessId}`;
        }
        urlData = baseUrl;
    } else if (token.startsWith('biz_')) {
        // Point to the landing page with a token param it can read
        urlData = `${window.location.origin}/?token=${token}`;
    }

    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: urlData,
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
            // FIX: Cast the result to Blob, as getRawData can also return a Buffer type in Node.js environments.
            return await blobToBase64(blob as Blob);
        }
        return '';
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        // Fallback for environments where canvas/blob might fail
        const fallbackQr = new QRCodeStyling({ width: 300, height: 300, data: token });
        const fallbackBlob = await fallbackQr.getRawData('png');
        if (fallbackBlob) {
            // FIX: Cast the result to Blob, as getRawData can also return a Buffer type in Node.js environments.
            return await blobToBase64(fallbackBlob as Blob);
        }
        return '';
    }
};