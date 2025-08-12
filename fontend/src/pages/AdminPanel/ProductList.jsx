import React from 'react'
import { Datagrid, ImageField, List, TextField, Pagination } from 'react-admin'

const ProductPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25]} {...props} />

const ProductList = () => {
  return (
    <List pagination={<ProductPagination />} perPage={10}>
      <Datagrid>
        <TextField disabled source="id" />
        <ImageField source="thumbnail" />
        <TextField source="name" />
        <TextField source="brand" />
        <TextField source="description" />
        <TextField source="price" />
        <TextField source="slug" />
      </Datagrid>
    </List>
  )
}

export default ProductList
