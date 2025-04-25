import React from 'react';
import { View } from 'react-native';
import { useGlobalContext } from '../timer/context';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@rn-primitives/select";
import arrowDown from '~/assets/icon-arrow-down.png'

const DynamicSelect = ({ options, selectedOption, handleSelect }) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger variant="outline" size="md">
        <SelectValue
          className='text-foreground text-sm native:text-lg'
          placeholder={selectedOption ? selectedOption : "Select an option"}
        />
      </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem
              key={index}
              label={option.name}
              value={option.name} // Use the name to match the handleChange function
            />
          ))}
        </SelectContent>
    </Select>
  );
};

export default DynamicSelect;