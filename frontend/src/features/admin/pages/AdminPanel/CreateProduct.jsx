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
import { colorSelector } from '@shared/components/Filters/ColorFilter';
import CategoryTypeInput from './Category/CategoryTypeInput';

const CreateProduct = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source='name' validate={[required()]} />
        <TextInput source='slug' validate={[required()]} />
        <TextInput source='sku' />
        <TextInput source='shortDescription' multiline />
        <TextInput source='description' multiline validate={[required()]} />
        <NumberInput source='price' validate={[required()]} />
        <NumberInput source='salePrice' />
        <TextInput source='brand' validate={[required()]} />
        <NumberInput source='rating' />
        <NumberInput source='totalSold' />
        <BooleanInput source='featured' />
        <BooleanInput source='active' />

       {/* Refer category fields */}
            <ReferenceInput source='categoryId' reference='category'/>
            <CategoryTypeInput />

              

        {/* Product resources */}
        <ArrayInput source='productResources'>
          <SimpleFormIterator inline>
            <TextInput source='name' validate={[required()]} />
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

        <BooleanInput source='newArrival' />
      </SimpleForm>
    </Create>
  );
};

export default CreateProduct;
