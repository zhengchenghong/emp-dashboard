import React from 'react';
import { FormControl, FormGroup } from '@material-ui/core/';
import starWarsNames from 'starwars-names';

import MultiChipSelect from './dropdown';

class MultiSelect extends React.Component {
  allItems = starWarsNames.random(6).map((ind, s) => {
    return { name: String((s + 1) * 5), id: s };
  });

  pageCounts = localStorage.getItem('pageCounts')
    ? localStorage
        .getItem('pageCounts')
        .split(',')
        .filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
    : [];

  defaulSelectItems = this.pageCounts?.length > 0 ? this.pageCounts : [];

  state = {
    items: this.allItems,
    selectedItem: this.defaulSelectItems
  };

  handleChange = (selectedItem) => {
    if (this.state.selectedItem.includes(selectedItem)) {
      this.removeSelectedItem(selectedItem);
    } else {
      this.addSelectedItem(selectedItem);
    }
  };

  addSelectedItem(item) {
    this.pageCounts.push(parseInt(item));
    localStorage.setItem(
      'pageCounts',
      this.sort(
        this.pageCounts.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
      )
    );
    this.setState(({ selectedItem, items }) => ({
      inputValue: '',
      selectedItem: [...selectedItem, item],
      items: items.filter((i) => i.name !== item)
    }));
  }

  removeSelectedItem = (item) => {
    const filterItem = this.pageCounts.filter(
      (i) => parseInt(i) !== parseInt(item)
    );
    this.pageCounts = filterItem;
    localStorage.setItem('pageCounts', this.pageCounts);
    this.setState(({ selectedItem, items }) => ({
      inputValue: '',
      selectedItem: selectedItem.filter((i) => i !== item),
      items: [...items, { name: item, id: item }]
    }));
  };

  handleChangeInput = (inputVal) => {
    const t = inputVal.split(',');
    if (JSON.stringify(t) !== JSON.stringify(this.state.selectedItem)) {
      this.setState({ inputValue: inputVal });
    }
  };

  onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  sort = (sortArray) => {
    return sortArray.sort(function (a, b) {
      return a - b;
    });
  };

  render() {
    const { selectedItem, items } = this.state;
    return (
      <FormGroup>
        <FormControl>
          <MultiChipSelect
            onInputValueChange={this.handleChangeInput}
            inputValue={this.state.inputValue}
            availableItems={this.sort(items)}
            selectedItem={this.sort(selectedItem)}
            onChange={this.handleChange}
            onRemoveItem={this.removeSelectedItem}
          />
        </FormControl>
      </FormGroup>
    );
  }
}

export default MultiSelect;
