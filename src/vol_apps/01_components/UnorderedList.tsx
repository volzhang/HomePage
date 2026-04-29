import {CheckIcon} from "lucide-react";

export const UnorderedList = (
    {
        value,
        options,
        handleSelect,
        menu_className,
        item_className,
        checkIcon_className

    }: {
        value: string,
        options: {
            value: string;
            label: string;
        } [],
        handleSelect: (value: string) => void,

        menu_className: string,
        item_className: string,
        checkIcon_className: string,
    }) => {
    const selectedValue = value;
    return (
        <ul className={menu_className}>
            {options.map(({label, value}) => (
                <li key={value} className={"w-full"}>
                    <button className={item_className} onClick={() => handleSelect(value)}>
                        {label}
                        {selectedValue === value && <CheckIcon className={checkIcon_className}/>}
                    </button>
                </li>
            ))}
        </ul>
    )
}

