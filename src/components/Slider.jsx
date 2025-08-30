import React, { useState } from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { Button } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";

function Slider({
    sliderValue,
    setSliderValue,
    maxValue,
    step,
    text,
    open,
    setOpen,
}) {
    return (
        <div className="relative flex flex-col items-center">
            <div className="inline-flex justify-center items-center gap-2 rounded-md text-left text-sm focus:outline-none whitespace-nowrap">
                <Button
                    variant="ghost"
                    color="gray"
                    size="2"
                    className="mb-2 !text-black hover:!bg-transparent"
                    onClick={setOpen}
                >
                    {text}
                </Button>
                <ChevronRight className="min-w-4 min-h-4 max-w-4 max-h-4 text-gray-500" />
            </div>

            {open && (
                <div className="absolute top-8 mx-auto flex items-center gap-2 w-[200px] bg-white p-4 rounded-md shadow-lg z-10">
                    <RadixSlider.Root
                        className="relative flex items-center w-full h-5"
                        value={sliderValue}
                        onValueChange={(newValue) => {
                            setSliderValue(newValue);
                        }}
                        max={maxValue}
                        step={step}
                    >
                        <RadixSlider.Track className="bg-gray-300 relative flex-grow h-1 rounded-full">
                            <RadixSlider.Range className="absolute bg-gray-500 h-full rounded-full" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb
                            className="block w-4 h-4 bg-white border-2 border-gray-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="Volume"
                        />
                    </RadixSlider.Root>
                    <span className="w-[75px] h-6 text-center text-sm text-gray-700 bg-gray-100 rounded-md flex items-center justify-center">
                        {sliderValue}
                    </span>{" "}
                </div>
            )}
        </div>
    );
}

export default Slider;
