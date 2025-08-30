import React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

function Select({ items, placeholder, value, setValue }) {
    return (
        <RadixSelect.Root value={value} onValueChange={setValue}>
            <RadixSelect.Trigger className="inline-flex justify-center items-center gap-2 rounded-md text-left text-sm focus:outline-none">
                <RadixSelect.Value placeholder={placeholder} />
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
                <RadixSelect.Content
                    className="rounded-md shadow-lg bg-white max-h-50 overflow-auto mt-2"
                    side="bottom"
                    position="popper"
                    align="center"
                >
                    <RadixSelect.Viewport>
                        {items.map((value) => (
                            <RadixSelect.Item
                                key={value}
                                value={value}
                                className="flex justify-between items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-sm"
                            >
                                <RadixSelect.ItemText>
                                    {value}
                                </RadixSelect.ItemText>
                                <RadixSelect.ItemIndicator>
                                    <Check className="w-4 h-4 text-black" />
                                </RadixSelect.ItemIndicator>
                            </RadixSelect.Item>
                        ))}
                    </RadixSelect.Viewport>
                </RadixSelect.Content>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
}

export default Select;
