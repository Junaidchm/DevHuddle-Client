import {
  Crop,
  FlipHorizontal,
  Palette,
  RotateCcw,
  RotateCw,
  Sliders,
  X,
} from "lucide-react";
import { IconButton } from "./IconButton";
import { useState } from "react";
import { TabButton } from "./TabButton";
import { ImageTransform } from "@/src/app/types/feed";
import { update } from "lodash";
import { FLIP_VERTICAL } from "@/src/constents/svg";
import { SliderControl } from "./SliderControl";
import { filters } from "@/src/constents/feed";
import { TextButton } from "../ui/TextButton";
import { GradientButton } from "../ui/GradientButton";

interface EditPanelProps {
  transform: ImageTransform;
  onTransformChange: (updates: Partial<ImageTransform>) => void;
  onApply: () => void;
  onClose: () => void;
  className?: string;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  transform,
  onTransformChange,
  onApply,
  onClose,
  className = '',
}) => {
  const [editTab, setEditTab] = useState<"crop" | "filter" | "adjust">("crop");
  const resetAllAdjustments = () => {
    onTransformChange({
      brightness: 50,
      contrast: 50,
      saturation: 50,
      temperature: 50,
      highlights: 50,
      shadows: 50,
    });
  };
  return (
    <div className="w-96 border-l border-slate-200 pl-6">
      <div className="flex items-center gap-3 mb-6">
        <IconButton
          icon={<X size={20} className="text-slate-600" />}
          ariaLabel="Close edit panel"
        />
        <h3 className="text-lg font-semibold text-slate-800">Edit</h3>
      </div>
      <div className="flex border-b border-slate-200 mb-6">
        <TabButton
          label="Crop"
          icon={<Crop size={16} className="inline mr-2" />}
          isActive={editTab === "crop"}
          onClick={() => setEditTab("crop")}
          ariaLabel="Crop tab"
        />
        <TabButton
          label="Filter"
          icon={<Palette size={16} className="inline mr-2" />}
          isActive={editTab === "filter"}
          onClick={() => setEditTab("filter")}
          ariaLabel="Filter tab"
        />
        <TabButton
          label="adjust"
          icon={<Sliders size={16} className="inline mr-2" />}
          isActive={editTab === "adjust"}
          onClick={() => setEditTab("adjust")}
          ariaLabel="Adjust tab"
        />
      </div>
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {editTab === "crop" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <IconButton
                icon={<RotateCcw size={20} className="text-slate-600" />}
                onClick={() =>
                  onTransformChange({
                    rotation: (transform.rotation || 0) - 90,
                  })
                }
                className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
                ariaLabel="Rotate left"
              />
              <IconButton
                icon={<RotateCw size={20} className="text-slate-600" />}
                onClick={() =>
                  onTransformChange({
                    rotation: (transform.rotation || 0) + 90,
                  })
                }
                className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
                ariaLabel="Rotate right"
              />
              <IconButton
                icon={<FlipHorizontal size={20} className="text-slate-600" />}
                onClick={() => onTransformChange({ flipH: !transform.flipH })}
                className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
                ariaLabel="Flip horizontal"
              />
              <IconButton
                icon={FLIP_VERTICAL}
                onClick={() => onTransformChange({ flipV: !transform.flipV })}
                className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
                ariaLabel="Flip vertical"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Aspect Ratio
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Original", "Square", "4:3", "3:4", "16:9", "9:16"].map(
                  (ratio) => (
                    <button
                      key={ratio}
                      onClick={() =>
                        onTransformChange({ aspectRatio: ratio.toLowerCase() })
                      }
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        transform.aspectRatio === ratio.toLowerCase()
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                      }`}
                      aria-label={`Set aspect ratio to ${ratio}`}
                    >
                      {ratio}
                    </button>
                  )
                )}
              </div>
            </div>

            <SliderControl
              label="Zoom"
              value={transform.zoom}
              onChange={(value) => onTransformChange({ zoom: value })}
              displayValue={`${Math.round((transform.zoom / 50) * 50 + 75)}%`}
            />
            
            <SliderControl
              label="Straighten"
              value={transform.straighten}
              onChange={(value) => onTransformChange({ straighten: value })}
              displayValue={`${Math.round(
                ((transform.straighten - 50) / 50) * 15
              )}%`}
            />
          </div>
        )}
        {editTab === "filter" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onTransformChange({ filter: filter.value })}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                    transform.filter === filter.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  aria-label={`Apply ${filter.name} filter`}
                >
                  <div className="text-sm font-medium text-slate-700">
                    {filter.name}
                  </div>
                  <div
                    className="w-full h-12 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 rounded mt-2"
                    style={{ filter: filter.filter }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        {editTab === "adjust" && (
          <div className="space-y-5">
            <SliderControl
              label="Brightness"
              value={transform.brightness}
              onChange={(value) => onTransformChange({ brightness: value })}
              displayValue={`${Math.round(
                (transform.brightness / 50) * 50 + 75
              )}%`}
            />
            <SliderControl
              label="Contrast"
              value={transform.contrast}
              onChange={(value) => onTransformChange({ contrast: value })}
              displayValue={`${Math.round(
                (transform.contrast / 50) * 50 + 75
              )}%`}
            />
            <SliderControl
              label="Saturation"
              value={transform.saturation}
              onChange={(value) => onTransformChange({ saturation: value })}
              displayValue={`${Math.round(
                (transform.saturation / 50) * 50 + 75
              )}%`}
            />
            <SliderControl
              label="Temperature"
              value={transform.temperature}
              onChange={(value) => onTransformChange({ temperature: value })}
              displayValue={`${Math.round(
                ((transform.temperature - 50) / 50) * 30
              )}°`}
            />
            <SliderControl
              label="Highlights"
              value={transform.highlights}
              onChange={(value) => onTransformChange({ highlights: value })}
              displayValue={`${Math.round(
                (transform.highlights / 50) * 50 + 75
              )}%`}
            />
            <SliderControl
              label="Shadows"
              value={transform.shadows}
              onChange={(value) => onTransformChange({ shadows: value })}
              displayValue={`${Math.round(
                (transform.shadows / 50) * 50 + 75
              )}%`}
            />
            <div className="flex justify-between mt-6">
             
              <TextButton
                label="Reset All"
                onClick={resetAllAdjustments}
                ariaLabel="Reset all adjustments"
              />
              <GradientButton
                label="Apply"
                onClick={onApply}
                ariaLabel="Apply adjustments"
                className="px-4 py-2 text-sm font-medium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
