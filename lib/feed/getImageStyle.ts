import { ImageTransform } from "@/src/app/types/feed";
import { default_ImageTransform, filters } from "@/src/constents/feed";


export const getImageStyle = (
  transform : ImageTransform 
): React.CSSProperties => {
  const rotation = transform.rotation || 0;
  const flipH = transform.flipH ? -1 : 1;
  const flipV = transform.flipV ? -1 : 1;
  const zoomLevel = (transform.zoom / 50) * 0.5 + 0.75;
  const straightenAngle = ((transform.straighten - 50) / 50) * 15;
  let filterValue = "";
  if (transform.filter !== "none") {
    const filter = filters.find((f) => f.value === transform.filter);
    filterValue = filter ? filter.filter : "";
  }
  const brightnessVal = (transform.brightness / 50) * 0.5 + 0.75;
  const contrastVal = (transform.contrast / 50) * 0.5 + 0.75;
  const saturateVal = (transform.saturation / 50) * 0.5 + 0.75;
  const hueRotateVal = ((transform.temperature - 50) / 50) * 30;
  const adjustmentFilters = `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) hue-rotate(${hueRotateVal}deg)`;

  return {
    transform: `rotate(${
      rotation + straightenAngle
    }deg) scale(${flipH}, ${flipV}) scale(${zoomLevel})`,
    filter: filterValue
      ? `${filterValue} ${adjustmentFilters}`
      : adjustmentFilters,
    transition: "all 0.3s ease",
  };
};
