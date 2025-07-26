import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImageBufferToImageKit = async (buffer, fileName, folder = '/ultrawall') => {
  try {
    const result = await imagekit.upload({
      file: buffer,
      fileName,
      folder,
      useUniqueFileName: true,
    });
    return result;
  } catch (error) {
    console.error('❌ Error al subir a ImageKit:', error.message);
    throw error;
  }
};
