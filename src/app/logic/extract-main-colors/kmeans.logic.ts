import { Lab, RGB } from '../../interfaces/colors.interface';
import { lab2rgb, rgb2lab } from '../../utils/lab.utils';
import { transformRGBToHex } from '../../utils/colors.utils';

/**
 * Implémentation de l'algorithme K-means pour la segmentation des couleurs en espace CIELAB.
 * @param pixelsLab: Lab[] - Tableau de pixels en espace CIELAB.
 * @param k: number - Nombre de clusters (couleurs principales) à extraire.
 * @param maxIter: number - Nombre maximal d'itérations pour l'algorithme K-means.
 */
function kMeansLab(pixelsLab: Lab[], k: number, maxIter = 20): Lab[] {
  // Initialisation aléatoire des centres
  const centers = pixelsLab.slice(0);
  const result: Lab[] = [];
  for (let i = 0; i < k; i++) {
    result.push(centers[Math.floor(Math.random() * centers.length)]);
  }

  let assignments = new Array(pixelsLab.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assignation
    for (let i = 0; i < pixelsLab.length; i++) {
      let minDist = Number.POSITIVE_INFINITY;
      let idx = 0;
      for (let j = 0; j < k; j++) {
        const dist = Math.sqrt(
          (pixelsLab[i][0] - result[j][0]) ** 2 +
            (pixelsLab[i][1] - result[j][1]) ** 2 +
            (pixelsLab[i][2] - result[j][2]) ** 2,
        );
        if (dist < minDist) {
          minDist = dist;
          idx = j;
        }
      }
      assignments[i] = idx;
    }

    // Recalcul des centres
    const newCenters = new Array(k).fill(0).map(() => [0, 0, 0] as Lab);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < pixelsLab.length; i++) {
      const cluster = assignments[i];
      newCenters[cluster][0] += pixelsLab[i][0];
      newCenters[cluster][1] += pixelsLab[i][1];
      newCenters[cluster][2] += pixelsLab[i][2];
      counts[cluster]++;
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        newCenters[j][0] /= counts[j];
        newCenters[j][1] /= counts[j];
        newCenters[j][2] /= counts[j];
      } else {
        // Si un cluster est vide, on le réinitialise aléatoirement
        newCenters[j] = centers[Math.floor(Math.random() * centers.length)];
      }
    }

    // Vérification de la convergence
    let converged = true;
    for (let j = 0; j < k; j++) {
      if (
        Math.abs(newCenters[j][0] - result[j][0]) > 1e-4 ||
        Math.abs(newCenters[j][1] - result[j][1]) > 1e-4 ||
        Math.abs(newCenters[j][2] - result[j][2]) > 1e-4
      ) {
        converged = false;
        break;
      }
    }
    result.splice(0, k, ...newCenters);
    if (converged) break;
  }

  return result;
}

export function extractMainColorsByKMeans(imageData: ImageData, k: number): string[] {
  const pixelsLab = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const rgb: RGB = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
    pixelsLab.push(rgb2lab(rgb));
  }
  const mainLabs = kMeansLab(pixelsLab, k);
  // Convertir Lab -> RGB -> Hex
  return mainLabs.map(lab => transformRGBToHex(lab2rgb(lab)));
}
