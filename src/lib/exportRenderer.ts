import type { PhoneSettings } from '@/types';

interface ExportChromeOptions {
  settings: PhoneSettings;
  title: string;
}

interface PixelCrop {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

const IOS_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif';
const WIFI_REFERENCE_RGB = '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';
let wifiReferencePatch: HTMLCanvasElement | null = null;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function rasterizeText(text: string, font: string, color = '#000'): PixelCrop | null {
  if (!text) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 320;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.font = font;
  context.textBaseline = 'alphabetic';
  context.fillText(text, 100, 225);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (pixels[(y * canvas.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) return null;
  return { canvas, x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

function drawTextInBox(
  context: CanvasRenderingContext2D,
  text: string,
  font: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color = '#000',
) {
  const crop = rasterizeText(text, font, color);
  if (!crop) return;
  context.drawImage(crop.canvas, crop.x, crop.y, crop.width, crop.height, x, y, width, height);
}

function drawCenteredText(
  context: CanvasRenderingContext2D,
  text: string,
  font: string,
  centerX: number,
  y: number,
  height: number,
  maxWidth: number,
  widthScale = 1,
  color = '#000',
) {
  const crop = rasterizeText(text, font, color);
  if (!crop) return;
  const naturalWidth = crop.width * (height / crop.height) * widthScale;
  const width = Math.min(naturalWidth, maxWidth);
  context.drawImage(
    crop.canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    Math.round(centerX - width / 2),
    y,
    Math.round(width),
    height,
  );
}

function drawHeaderBackground(context: CanvasRenderingContext2D) {
  const image = context.createImageData(1179, 294);
  const gaussian = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) => (
    Math.exp(-(((x - cx) ** 2) / (2 * sx ** 2) + ((y - cy) ** 2) / (2 * sy ** 2)))
  );
  for (let y = 0; y < 294; y += 1) {
    for (let x = 0; x < 1179; x += 1) {
      const warm = gaussian(x, y, 0, 0, 260, 100);
      const topNeutral = gaussian(x, y, 400, 10, 180, 70);
      const green = gaussian(x, y, 800, 180, 160, 60);
      const rightShade = gaussian(x, y, 1180, 150, 180, 250);
      const centerLight = gaussian(x, y, 500, 150, 200, 80);
      const index = (y * 1179 + x) * 4;
      image.data[index] = Math.round(239 - 3 * warm - 2.2 * topNeutral - 11 * green - 8 * rightShade + 2 * centerLight);
      image.data[index + 1] = Math.round(239 - 11 * warm - 3 * green - 8 * rightShade + centerLight);
      image.data[index + 2] = Math.round(237 - 11 * warm + 2.2 * topNeutral - 16 * green - 8 * rightShade + 4.5 * centerLight);
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

function drawSilentIcon(context: CanvasRenderingContext2D) {
  const icon = document.createElement('canvas');
  icon.width = 48;
  icon.height = 50;
  const iconContext = icon.getContext('2d');
  if (!iconContext) return;

  iconContext.fillStyle = '#000';
  iconContext.strokeStyle = '#000';
  iconContext.lineCap = 'round';
  iconContext.lineJoin = 'round';
  iconContext.beginPath();
  iconContext.moveTo(14, 10);
  iconContext.bezierCurveTo(14, 3, 19, 0, 24, 0);
  iconContext.bezierCurveTo(30, 0, 35, 5, 35, 12);
  iconContext.bezierCurveTo(43, 16, 45, 23, 45, 31);
  iconContext.lineTo(45, 34);
  iconContext.lineTo(48, 40);
  iconContext.lineTo(0, 40);
  iconContext.lineTo(7, 33);
  iconContext.lineTo(7, 23);
  iconContext.bezierCurveTo(7, 17, 9, 13, 14, 10);
  iconContext.fill();
  iconContext.beginPath();
  iconContext.ellipse(23, 46.5, 7, 3, 0, 0, Math.PI * 2);
  iconContext.fill();

  iconContext.globalCompositeOperation = 'destination-out';
  iconContext.beginPath();
  iconContext.moveTo(2, 4);
  iconContext.lineTo(46, 46);
  iconContext.lineWidth = 10;
  iconContext.stroke();
  iconContext.globalCompositeOperation = 'source-over';
  iconContext.beginPath();
  iconContext.moveTo(2, 4);
  iconContext.lineTo(46, 46);
  iconContext.lineWidth = 5;
  iconContext.stroke();

  context.drawImage(icon, 0, 0, 48, 50, 262, 67, 39, 42);
}

function drawCellular(context: CanvasRenderingContext2D, signal: number, dual: boolean) {
  if (!dual) {
    const bars = [
      { x: 846, y: 96, width: 10, height: 12 },
      { x: 862, y: 87, width: 10, height: 21 },
      { x: 878, y: 77, width: 10, height: 31 },
      { x: 894, y: 67, width: 10, height: 41 },
    ];
    bars.forEach((bar, index) => {
      roundedRect(context, bar.x, bar.y, bar.width, bar.height, 3);
      context.fillStyle = signal >= index + 1 ? '#000' : '#a8a8aa';
      context.fill();
    });
    return;
  }
  const primaryBars = [
    { x: 846, y: 80, width: 10, height: 12 },
    { x: 862, y: 77, width: 10, height: 15 },
    { x: 878, y: 72, width: 10, height: 20 },
    { x: 894, y: 67, width: 10, height: 25 },
  ];
  const secondaryBars = [846, 862, 878, 894].map(x => ({ x, y: 97, width: 10, height: 11 }));
  [...primaryBars, ...secondaryBars].forEach((bar, index) => {
    roundedRect(context, bar.x, bar.y, bar.width, bar.height, 3);
    context.fillStyle = signal >= (index % 4) + 1 ? '#000' : '#a8a8aa';
    context.fill();
  });
}

function drawWifi(context: CanvasRenderingContext2D) {
  if (!wifiReferencePatch) {
    const raw = atob(WIFI_REFERENCE_RGB);
    const patch = document.createElement('canvas');
    patch.width = 49;
    patch.height = 37;
    const patchContext = patch.getContext('2d');
    if (!patchContext) return;
    const image = patchContext.createImageData(49, 37);
    for (let pixel = 0; pixel < 49 * 37; pixel += 1) {
      image.data[pixel * 4] = raw.charCodeAt(pixel * 3);
      image.data[pixel * 4 + 1] = raw.charCodeAt(pixel * 3 + 1);
      image.data[pixel * 4 + 2] = raw.charCodeAt(pixel * 3 + 2);
      image.data[pixel * 4 + 3] = 255;
    }
    patchContext.putImageData(image, 0, 0);
    wifiReferencePatch = patch;
  }
  context.drawImage(wifiReferencePatch, 927, 69);
}

function drawBattery(context: CanvasRenderingContext2D, battery: number) {
  const safeBattery = Math.max(0, Math.min(100, Math.round(battery)));
  roundedRect(context, 997, 67, 79, 41, 10);
  context.fillStyle = '#9b9b9d';
  context.fill();

  context.save();
  roundedRect(context, 997, 67, 79, 41, 10);
  context.clip();
  context.fillStyle = safeBattery <= 20 ? '#ff3b30' : '#303033';
  context.fillRect(999, 67, Math.max(14, Math.round(77 * safeBattery / 100)), 41);
  context.restore();

  roundedRect(context, 1078, 79, 3, 16, 1.5);
  context.fillStyle = '#9b9b9d';
  context.fill();
  drawCenteredText(context, String(safeBattery), `600 54px ${IOS_FONT}`, 1036.5, 75, 25, 48, 1, '#fff');
}

function drawNavigation(context: CanvasRenderingContext2D, options: ExportChromeOptions) {
  context.save();
  context.beginPath();
  context.rect(51, 202, 27, 50);
  context.clip();
  context.strokeStyle = '#111';
  context.lineWidth = 4.5;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(76, 204);
  context.lineTo(52.5, 226.5);
  context.lineTo(76, 250);
  context.stroke();
  context.restore();

  if (options.settings.unreadCount > 0) {
    const count = String(Math.max(0, Math.round(options.settings.unreadCount)));
    const pillWidth = Math.max(73, 42 + count.length * 27);
    const pillX = 142 - pillWidth / 2;
    roundedRect(context, pillX, 190, pillWidth, 73, 36.5);
    context.fillStyle = '#d6d6d4';
    context.fill();
    drawCenteredText(context, count, `400 78px ${IOS_FONT}`, 142.5, 210, 33, pillWidth - 20);
  }

  if (options.title === '张三') {
    context.save();
    context.beginPath();
    context.rect(537, 202, 103, 49);
    context.clip();
    drawCenteredText(context, options.title, `450 82px ${IOS_FONT}`, 588.5, 201, 51, 650, 1.02);
    context.restore();
  } else {
    drawCenteredText(context, options.title, `500 82px ${IOS_FONT}`, 589.5, 202, 49, 650);
  }

  context.fillStyle = '#111';
  [
    { centerX: 1071.5, x: 1067, width: 10 },
    { centerX: 1093, x: 1088, width: 11 },
    { centerX: 1114.5, x: 1110, width: 10 },
  ].forEach(dot => {
    context.save();
    context.beginPath();
    context.rect(dot.x, 221, dot.width, 11);
    context.clip();
    context.beginPath();
    context.arc(dot.centerX, 226.5, 5.65, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });

  context.fillStyle = 'rgba(0, 0, 0, 0.10)';
  context.fillRect(0, 293, 1179, 1);
}

/**
 * Replaces the exported image's browser-laid-out chrome with fixed reference-pixel
 * geometry. The editable preview remains DOM-based; downloaded/copied images use
 * this deterministic pass for the iOS status bar and WeChat navigation bar.
 */
export function renderReferenceChrome(canvas: HTMLCanvasElement, options: ExportChromeOptions) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  drawHeaderBackground(context);
  drawTextInBox(context, options.settings.time || '10:17', `500 82px ${IOS_FONT}`, 127, 68, 120, 39);
  if (options.settings.isMuted) drawSilentIcon(context);
  drawCellular(context, options.settings.signal, options.settings.isDualSim);
  if (options.settings.isWifiEnabled) drawWifi(context);
  drawBattery(context, options.settings.battery);
  drawNavigation(context, options);
  context.restore();
}
