import { useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import { X, ChevronDown, Funnel, Minus, Plus, RotateCcw } from "lucide-react";

const sortOptions = [
    { name: "Best Rating", value: "rating", current: true },
    { name: "Newest", value: "newest", current: false },
    { name: "Oldest", value: "oldest", current: false },
    { name: "A-Z", value: "title-asc", current: false },
    { name: "Z-A", value: "title-desc", current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Sidebar({
    checkboxFilters,
    numberFilters,
    setCheckboxFilters,
    setNumberFilters,
    sortOption,
    setSortOption,
}) {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    function onNumberFilterChange(sectionId, field, value) {
        if (value == "") {
            setNumberFilters((prev) => ({
                ...prev,
                [sectionId]: {
                    ...prev[sectionId],
                    [field]: "",
                },
            }));
            return;
        }
        const numberValue = Number(value);

        setNumberFilters((prev) => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [field]: numberValue,
            },
        }));
    }

    function onNumberFilterBlur(sectionId, field, value) {
        const { min, max, startVal, endVal } = numberFilters[sectionId];
        let numberValue = Number(value);

        if (field == "startVal") {
            if (numberValue < min || numberValue > max) {
                numberValue = min;
            }
            if (endVal && numberValue > endVal) {
                numberValue = endVal;
            }
        } else if (field == "endVal") {
            if (numberValue < min || numberValue > max) {
                numberValue = max;
            }
            if (startVal && numberValue < startVal) {
                numberValue = startVal;
            }
        }

        setNumberFilters((prev) => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [field]: numberValue,
            },
        }));
    }

    const clearAllFilters = () => {
        // Reset checkbox filters
        setCheckboxFilters((prev) => {
            const newFilters = { ...prev };
            Object.keys(newFilters).forEach((sectionId) => {
                Object.keys(newFilters[sectionId].options).forEach((option) => {
                    newFilters[sectionId].options[option] = false;
                });
            });
            return newFilters;
        });

        // Reset number filters
        setNumberFilters((prev) => {
            const newFilters = { ...prev };
            Object.keys(newFilters).forEach((sectionId) => {
                newFilters[sectionId].startVal = "";
                newFilters[sectionId].endVal = "";
            });
            return newFilters;
        });
    };

    const hasActiveFilters = () => {
        // Check if any checkbox filters are active
        const hasCheckboxFilters = Object.values(checkboxFilters).some(
            (section) => Object.values(section.options).some(Boolean)
        );

        // Check if any number filters are active
        const hasNumberFilters = Object.values(numberFilters).some(
            (section) => section.startVal !== "" || section.endVal !== ""
        );

        return hasCheckboxFilters || hasNumberFilters;
    };

    return (
        <div className="bg-white">
            <div>
                {/* Mobile filter dialog */}
                <Dialog
                    open={mobileFiltersOpen}
                    onClose={setMobileFiltersOpen}
                    className="relative z-40 lg:hidden"
                >
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 transition duration-300 ease-in-out data-closed:translate-x-full"
                        >
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-lg font-medium text-stone-800">
                                    Filters
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-stone-400 hover:bg-stone-50 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                >
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Close menu</span>
                                    <X
                                        aria-hidden="true"
                                        className="size-6 cursor-pointer"
                                    />
                                </button>
                            </div>

                            {/* Clear Filters Button */}
                            {hasActiveFilters() && (
                                <div className="px-4 py-2">
                                    <button
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-2 w-full justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Clear All Filters
                                    </button>
                                </div>
                            )}

                            {/* Filters */}
                            <form className="mt-4 border-t border-stone-200">
                                <h3 className="sr-only">Categories</h3>

                                {/* Checkbox Filters */}
                                {Object.keys(checkboxFilters || {}).map(
                                    (sectionId) => (
                                        <Disclosure
                                            key={sectionId}
                                            as="div"
                                            className="border-t border-stone-200 px-4 py-6"
                                        >
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-stone-400 hover:text-stone-500">
                                                    <span className="font-medium text-stone-800">
                                                        {
                                                            checkboxFilters[
                                                                sectionId
                                                            ].name
                                                        }
                                                    </span>
                                                    <span className="ml-6 flex items-center">
                                                        <Plus className="h-5 w-5 group-data-open:hidden" />
                                                        <Minus className="h-5 w-5 group-not-data-open:hidden" />
                                                    </span>
                                                </DisclosureButton>
                                            </h3>
                                            <DisclosurePanel className="pt-6">
                                                <div className="space-y-6">
                                                    {Object.entries(
                                                        checkboxFilters[
                                                            sectionId
                                                        ].options
                                                    ).map(
                                                        (
                                                            [
                                                                optionValue,
                                                                checked,
                                                            ],
                                                            idx
                                                        ) => (
                                                            <div
                                                                key={
                                                                    optionValue
                                                                }
                                                                className="flex gap-3"
                                                            >
                                                                <div className="flex h-5 shrink-0 items-center">
                                                                    <div className="group grid h-4 w-4 grid-cols-1">
                                                                        <input
                                                                            id={`filter-mobile-${sectionId}-${idx}`}
                                                                            type="checkbox"
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            onChange={() => {
                                                                                setCheckboxFilters(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [sectionId]:
                                                                                            {
                                                                                                ...prev[
                                                                                                    sectionId
                                                                                                ],
                                                                                                options:
                                                                                                    {
                                                                                                        ...prev[
                                                                                                            sectionId
                                                                                                        ]
                                                                                                            .options,
                                                                                                        [optionValue]:
                                                                                                            !checked,
                                                                                                    },
                                                                                            },
                                                                                    })
                                                                                );
                                                                            }}
                                                                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-stone-400 bg-white checked:border-red-500 checked:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                                                        />
                                                                        <svg
                                                                            fill="none"
                                                                            viewBox="0 0 14 14"
                                                                            className="pointer-events-none col-start-1 row-start-1 h-3.5 w-3.5 self-center justify-self-center stroke-white"
                                                                        >
                                                                            <path
                                                                                d="M3 8L6 11L11 3.5"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                className={
                                                                                    checked
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                }
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <label
                                                                    htmlFor={`filter-mobile-${sectionId}-${idx}`}
                                                                    className="min-w-0 flex-1 text-stone-500"
                                                                >
                                                                    {optionValue
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                        optionValue.slice(
                                                                            1
                                                                        )}
                                                                </label>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </DisclosurePanel>
                                        </Disclosure>
                                    )
                                )}

                                {/* Number Filters */}
                                {Object.keys(numberFilters || {}).map(
                                    (sectionId) => (
                                        <Disclosure
                                            key={sectionId}
                                            as="div"
                                            className="border-t border-stone-200 px-4 py-6"
                                        >
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-stone-400 hover:text-stone-500">
                                                    <span className="font-medium text-stone-800">
                                                        {
                                                            numberFilters[
                                                                sectionId
                                                            ].name
                                                        }
                                                    </span>
                                                    <span className="ml-6 flex items-center">
                                                        <Plus className="h-5 w-5 group-data-open:hidden" />
                                                        <Minus className="h-5 w-5 group-not-data-open:hidden" />
                                                    </span>
                                                </DisclosureButton>
                                            </h3>
                                            <DisclosurePanel className="pt-6">
                                                <div className="w-full flex justify-center items-center gap-6">
                                                    <input
                                                        type="number"
                                                        value={
                                                            numberFilters[
                                                                sectionId
                                                            ].startVal
                                                        }
                                                        onChange={(e) =>
                                                            onNumberFilterChange(
                                                                sectionId,
                                                                "startVal",
                                                                e.target.value
                                                            )
                                                        }
                                                        onBlur={(e) =>
                                                            onNumberFilterBlur(
                                                                sectionId,
                                                                "startVal",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full h-full border border-stone-300 placeholder:text-stone-500 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                                                    />
                                                    <p className="text-stone-500">
                                                        to
                                                    </p>
                                                    <input
                                                        type="number"
                                                        value={
                                                            numberFilters[
                                                                sectionId
                                                            ].endVal
                                                        }
                                                        onChange={(e) =>
                                                            onNumberFilterChange(
                                                                sectionId,
                                                                "endVal",
                                                                e.target.value
                                                            )
                                                        }
                                                        onBlur={(e) =>
                                                            onNumberFilterBlur(
                                                                sectionId,
                                                                "endVal",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full h-full border border-stone-300 placeholder:text-stone-500 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                                                    />
                                                </div>
                                            </DisclosurePanel>
                                        </Disclosure>
                                    )
                                )}
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl">
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                            <Menu
                                as="div"
                                className="relative inline-block text-left"
                            >
                                <MenuButton className="group inline-flex justify-center text-sm border border-stone-200 px-2 py-1 rounded-md font-medium text-stone-700 hover:text-stone-900 hover:border-red-500 cursor-pointer transition-colors">
                                    Sort
                                    <ChevronDown
                                        aria-hidden="true"
                                        className="-mr-1 ml-1 size-5 shrink-0"
                                    />
                                </MenuButton>

                                <MenuItems
                                    transition
                                    className="absolute left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.name}>
                                                <button
                                                    onClick={() =>
                                                        setSortOption(
                                                            option.value
                                                        )
                                                    }
                                                    className={classNames(
                                                        sortOption ===
                                                            option.value
                                                            ? "font-medium text-stone-900"
                                                            : "text-stone-500",
                                                        "block w-full text-left px-4 py-2 text-sm data-focus:bg-stone-100 data-focus:outline-hidden"
                                                    )}
                                                >
                                                    {option.name}
                                                </button>
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>

                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="p-2 border border-stone-200 px-2 py-1 rounded-md text-stone-700 hover:text-stone-900 hover:border-red-500 cursor-pointer transition-colors"
                            >
                                <span className="sr-only">Filters</span>
                                <Funnel aria-hidden="true" className="size-5" />
                            </button>

                            {/* Clear Filters Button - Desktop */}
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
