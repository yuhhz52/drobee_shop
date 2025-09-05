import React from 'react';
import {
  ArrayInput,
  BooleanInput,
  Edit,
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
import { sizeSelector } from './CreateProduct';

const EditProduct = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput label="Name" source='name' />
        <TextInput label="Description" source='description' />
        <TextInput label="Price" source='price' type='number' />
        <TextInput label="Brand" source='brand' />

        <ReferenceInput source='categoryId' reference='category'>
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>

        {/* Thumbnail */}
        <ImageField source='thumbnail' />
        <ImageInput source='thumbnail' label='Select Thumbnail'>
          <ImageField source="src" title="title" />
        </ImageInput>

        {/* Variants */}
        <ArrayInput source='variants' label='Edit Variants'>
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
            <ImageField source='url' />
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
      </SimpleForm>
    </Edit>
  );
};

export default EditProduct;
