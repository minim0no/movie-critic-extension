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
import { X, ChevronDown, Funnel, Minus, Plus } from "lucide-react";

const sortOptions = [
    { name: "Most Popular", href: "#", current: true },
    { name: "Best Rating", href: "#", current: false },
    { name: "Newest", href: "#", current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Sidebar({
    checkboxFilters,
    numberFilters,
    setCheckboxFilters,
    setNumberFilters,
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
                                <h2 className="text-lg font-medium text-gray-900">
                                    Filters
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-hidden"
                                >
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Close menu</span>
                                    <X
                                        aria-hidden="true"
                                        className="size-6 cursor-pointer"
                                    />
                                </button>
                            </div>

                            {/* Filters */}
                            <form className="mt-4 border-t border-gray-200">
                                <h3 className="sr-only">Categories</h3>

                                {/* Checkbox Filters */}
                                {Object.keys(checkboxFilters || {}).map(
                                    (sectionId) => (
                                        <Disclosure
                                            key={sectionId}
                                            as="div"
                                            className="border-t border-gray-200 px-4 py-6"
                                        >
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                    <span className="font-medium text-gray-900">
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
                                                                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-400 bg-white checked:border-red-500 checked:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
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
                                                                    className="min-w-0 flex-1 text-gray-500"
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
                                            className="border-t border-gray-200 px-4 py-6"
                                        >
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                    <span className="font-medium text-gray-900">
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
                                                        className="w-full h-full border border-gray-500 placeholder:text-gray-500 rounded-md p-2"
                                                    />
                                                    <p>to</p>
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
                                                        className="w-full h-full border border-gray-500 placeholder:text-gray-500 rounded-md p-2"
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
                        <div className="flex items-center">
                            <Menu
                                as="div"
                                className="relative inline-block text-left"
                            >
                                <MenuButton className="group inline-flex justify-center text-sm border border-gray-200 px-2 py-1 rounded-md font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
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
                                                <a
                                                    href={option.href}
                                                    className={classNames(
                                                        option.current
                                                            ? "font-medium text-gray-900"
                                                            : "text-gray-500",
                                                        "block px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden"
                                                    )}
                                                >
                                                    {option.name}
                                                </a>
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>

                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className=" ml-2 p-2 border border-gray-200 px-2 py-1 rounded-md text-gray-700 hover:text-gray-900 cursor-pointer"
                            >
                                <span className="sr-only">Filters</span>
                                <Funnel aria-hidden="true" className="size-5" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
