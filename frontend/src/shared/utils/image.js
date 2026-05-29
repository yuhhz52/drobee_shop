const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Cannot convert canvas to blob'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });

export const preprocessAvatarImage = async (
  file,
  { targetSize = 512, mimeType = 'image/jpeg', quality = 0.88 } = {}
) => {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const squareSize = Math.min(image.width, image.height);
  const sx = Math.floor((image.width - squareSize) / 2);
  const sy = Math.floor((image.height - squareSize) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;

  const context = canvas.getContext('2d');
  context.drawImage(
    image,
    sx,
    sy,
    squareSize,
    squareSize,
    0,
    0,
    targetSize,
    targetSize
  );

  const blob = await canvasToBlob(canvas, mimeType, quality);
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  return new File([blob], `avatar.${extension}`, { type: mimeType });
};
