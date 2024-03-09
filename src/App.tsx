import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useQuery } from "react-query";
import { useAutocompleteData } from "./store/useAutocompleteData";

export type AutocompleteItem = {
    category: string;
    id: string;
    name: string;
    value: number;
};

const url = "https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete";

const fetchAutocomplete = async (query: string | undefined) => {
    query = query && query.trim();
    const response = await fetch(`${url}?name=${query}`);
    const data = await response.json();
    return data;
};

const symbols = ["+", "-", "*", "/", "(", ")", "%", "^"];

const calculateAmount = (tags: AutocompleteItem[]): number => {
    let expression = "";
    tags.forEach((item) => {
        switch (item.name) {
            case "+":
            case "-":
            case "*":
            case "/":
            case "%":
                expression += " " + String(item.name);
                break;
            case "(":
            case ")":
                break;
            case "^":
                expression += " " + "**";
                break;
            default:
                expression += String(item.value);
        }
    });

    try {
        return Number(eval(expression));
    } catch (error) {
        console.error("Error evaluating expression:", error);
        expression = expression.slice(0, -1);
        try {
            return Number(eval(expression));
        } catch (innerError) {
            console.error("Error after removing the last symbol:", innerError);
            return 0;
        }
    }
};

function App() {
    const inputRef = useRef<HTMLInputElement>(null);
    const mainBoxRef = useRef<HTMLDivElement>(null);

    const [inputValue, setInputValue] = useState("");
    const [openDropdown, setOpenDropdown] = useState(false);

    const { data: selectedTags, setItem, removeItem } = useAutocompleteData();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const _value = e.target.value;
        e.target.style.width = _value ? `${_value.length * 9}px` : "2px";

        if (symbols.includes(_value)) {
            setOpenDropdown(false);
            setItem({
                category: "symbol",
                id: e.target.value,
                name: e.target.value,
                value: 0,
            });
        } else {
            setOpenDropdown(true);
            setInputValue(_value);
        }
    };

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleItemClick = (item: AutocompleteItem) => {
        setItem(item);
        setOpenDropdown(false);
        setInputValue("");
    };

    const handleTagRemove = (id: number) => {
        removeItem(id);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["autocomplete", inputValue],
        queryFn: () => fetchAutocomplete(inputValue),
    });

    const amount = useMemo(() => calculateAmount(selectedTags), [selectedTags]);

    useEffect(() => {
        if (mainBoxRef.current) {
            const handleClick = (e: MouseEvent) => {
                if (!mainBoxRef.current?.contains(e.target as Node)) {
                    setOpenDropdown(false);
                }
            };
            document.addEventListener("click", handleClick);
            return () => document.removeEventListener("click", handleClick);
        }
    });

    return (
        <div ref={mainBoxRef}>
            <div className="container">
                <div className="input_container" onClick={handleContainerClick}>
                    <div className="value_inputs_wrapper">
                        {selectedTags &&
                            selectedTags.map(
                                (item: AutocompleteItem, index: number) => {
                                    if (symbols.includes(item?.name)) {
                                        return (
                                            <div className="chosen_value">
                                                {item?.name}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="value_box">
                                                <div className="chosen_value">
                                                    {item.name}
                                                </div>
                                                <div
                                                    className="value_clear_icon"
                                                    role="button"
                                                    onClick={() =>
                                                        handleTagRemove(index)
                                                    }
                                                >
                                                    x
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                            )}

                        <div>
                            <input
                                ref={inputRef}
                                value={inputValue}
                                type="text"
                                className="base_input"
                                aria-autocomplete="list"
                                aria-expanded="true"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="control_input_value">
                        <div className="icon_control">x</div>
                        <span />
                        <div className="icon_control">v</div>
                    </div>
                </div>

                <div
                    className={`drop_down_container ${
                        openDropdown ? "display" : "display_none"
                    }`}
                >
                    {isLoading && <div>Loading...</div>}

                    <ul>
                        {Array.isArray(data) &&
                            data &&
                            data?.map((item: AutocompleteItem) => (
                                <li
                                    key={item?.id}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item?.name}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
            <div className="result_container">
                <div className="result_value">{!isNaN(amount) && amount}</div>
            </div>
        </div>
    );
}

export default App;
