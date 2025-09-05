import React from 'react';
import {
  ArrayInput,
  BooleanInput,
  Create,
  ImageField,
  ImageInput,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput
} from 'react-admin';
import { colorSelector } from '../../components/Filters/ColorFilter';
import CategoryTypeInput from './Category/CategoryTypeInput';

export const sizeSelector = ["S", "M", "L", "XL", "XXL"];

const CreateProduct = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source='name' validate={[required()]} />
        <TextInput source='slug' validate={[required()]} />
        <TextInput source='description' validate={[required()]} />
        <NumberInput source='price' validate={[required()]} />
        <TextInput source='brand' validate={[required()]} />

       {/* Refer category fields */}
            <ReferenceInput source='categoryId' reference='category'/>
            <CategoryTypeInput />

              

        {/* Thumbnail upload */}
        <ImageInput source='thumbnail' label='Thumbnail'>
          <ImageField source="src" title="title" />
        </ImageInput>

        {/* Variants */}
        <ArrayInput source='variants'>
          <SimpleFormIterator inline>
            <SelectInput
              source='color'
              choices={Object.keys(colorSelector).map(c => ({ id: c, name: c }))}
              resettable
            />
            <SelectInput
              source='size'
              choices={sizeSelector.map(s => ({ id: s, name: s }))}
            />
            <NumberInput source='stockQuantity' />
          </SimpleFormIterator>
        </ArrayInput>

        {/* Product resources */}
        <ArrayInput source='productResources'>
          <SimpleFormIterator inline>
            <TextInput source='name' validate={[required()]} />
            <ImageInput source='url' label='Product Image'>
              <ImageField source="src" title="title" />
            </ImageInput>
            <SelectInput
              source='type'
              choices={[{ id: 'image', name: 'Image' }]}
            />
            <BooleanInput source='isPrimary' />
          </SimpleFormIterator>
        </ArrayInput>

        <NumberInput source='rating' />
        <BooleanInput source='newArrival' />
      </SimpleForm>
    </Create>
  );
};

export default CreateProduct;
