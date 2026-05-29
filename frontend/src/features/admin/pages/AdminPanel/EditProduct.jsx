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
import { colorSelector } from '@shared/components/Filters/ColorFilter';

const EditProduct = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput label="Name" source='name' />
        <TextInput label="Slug" source='slug' />
        <TextInput label="SKU" source='sku' />
        <TextInput label="Short description" source='shortDescription' multiline />
        <TextInput label="Description" source='description' />
        <TextInput label="Price" source='price' type='number' />
        <TextInput label="Sale price" source='salePrice' type='number' />
        <TextInput label="Brand" source='brand' />
        <NumberInput source='rating' />
        <NumberInput source='totalSold' />
        <BooleanInput source='featured' />
        <BooleanInput source='newArrival' />
        <BooleanInput source='active' />

        <ReferenceInput source='categoryId' reference='category'>
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>

        {/* Variants */}
        <ArrayInput source='variants' label='Edit Variants'>
          <SimpleFormIterator inline>
            <SelectInput
              source='color'
              choices={Object.keys(colorSelector).map(c => ({ id: c, name: c }))}
              resettable
            />
            <TextInput source='variantName' />
            <NumberInput source='stockQuantity' />
            <NumberInput source='additionalPrice' />
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
              choices={[{ id: 'IMAGE', name: 'Image' }]}
            />
            <BooleanInput source='isPrimary' />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
};

export default EditProduct;
