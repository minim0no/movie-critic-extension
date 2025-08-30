import React, { useState } from "react";
import { Button } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";

function Range({ rangeValue, setRangeValue, text, open, setOpen, min, max }) {
    const handleInputChange = (index, value) => {
        const newRange = [...rangeValue];
        newRange[index] = value ? parseInt(value, 10) : 0; // Ensure the value is a number
        setRangeValue(newRange);
    };

    return (
        <div className="flex flex-col items-center">
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
                <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
            {open && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 w-[250px] bg-white p-4 rounded-md shadow-lg z-10">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-sm text-gray-700">Min:</label>
                        <input
                            type="number"
                            min={min}
                            placeholder={min}
                            max={rangeValue[1]}
                            onChange={(e) =>
                                handleInputChange(0, e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-sm text-gray-700">Max:</label>
                        <input
                            min={rangeValue[0]}
                            max={max}
                            placeholder={max}
                            type="number"
                            onChange={(e) =>
                                handleInputChange(1, e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            color="gray"
                            size="2"
                            className="!text-gray-700 hover:!bg-gray-100"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Range;
