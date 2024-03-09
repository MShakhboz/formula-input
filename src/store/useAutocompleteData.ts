import { create } from "zustand";
import { AutocompleteItem } from "../App";

interface State {
    data: AutocompleteItem[];
    setItem: (item: AutocompleteItem) => void;
    removeItem: (index: number) => void;
    amount: number;
}

export const useAutocompleteData = create((set) => ({
    data: [],
    amount: 0,
    setItem: (item: AutocompleteItem) =>
        set((state: State) => ({
            data: [...state.data, item],
        })),
    removeItem: (index: number) =>
        set((state: State) => ({
            data: state.data
                .filter((_, ind) => ind !== index)
                .filter((_, ind) => ind !== index - 1),
        })),
})) as () => State;
