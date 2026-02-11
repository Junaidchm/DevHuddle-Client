export const filters = [
  { name: "None", value: "none", filter: "none" },
  {
    name: "Vintage",
    value: "vintage",
    filter: "sepia(0.5) contrast(1.2) brightness(1.1)",
  },
  { name: "B&W", value: "bw", filter: "grayscale(1) contrast(1.1)" },
  {
    name: "Warm",
    value: "warm",
    filter: "hue-rotate(15deg) saturate(1.2) brightness(1.1)",
  },
  {
    name: "Cool",
    value: "cool",
    filter: "hue-rotate(-15deg) saturate(1.1) brightness(0.9)",
  },
  {
    name: "Dramatic",
    value: "dramatic",
    filter: "contrast(1.5) saturate(1.3) brightness(0.9)",
  },
  {
    name: "Soft",
    value: "soft",
    filter: "blur(0.5px) brightness(1.1) saturate(0.8)",
  },
  {
    name: "Vibrant",
    value: "vibrant",
    filter: "saturate(1.5) contrast(1.2) brightness(1.1)",
  },
];

export const default_ImageTransform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 50,
  straighten: 50,
  aspectRatio: "original",
  filter: "none",
  brightness: 50,
  contrast: 50,
  saturation: 50,
  temperature: 50,
  highlights: 50,
  shadows: 50,
  altText: "",
};
