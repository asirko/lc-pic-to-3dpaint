export function readFileAsDataURL(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function readImage(dataUri: string): Promise<HTMLImageElement> {
  const img = new Image();
  return new Promise(resolve => {
    img.onload = () => resolve(img);
    img.src = dataUri;
  });
}
