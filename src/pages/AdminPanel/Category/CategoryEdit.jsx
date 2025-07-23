import React from 'react'
import { ArrayInput, Edit, SimpleForm, SimpleFormIterator, TextInput } from 'react-admin'
import { fileUploadAPI } from '../../../api/fileUploadAPI.js';

const CategoryEdit = () => {
  return (
    <Edit>
        <SimpleForm>
            <TextInput source='name' />
            <TextInput source='code' />
            <TextInput source='description' />
            <ArrayInput source='categoryTypes'>
                <SimpleFormIterator inline>
                <TextInput source='name' />
                <TextInput source='code' />
                <TextInput source='description' />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
  )
}

export default CategoryEdit