import React from 'react'
import { Datagrid, FunctionField, List, TextField, Pagination } from 'react-admin'
import { getPrimaryResourceUrl } from '@shared/utils/product-media'

const ProductPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25]} {...props} />

const ProductList = () => {
  return (
    <List pagination={<ProductPagination />} perPage={10}>
      <Datagrid>
        <TextField disabled source="id" />
        <FunctionField
          label="Image"
          render={(record) => {
            const url = getPrimaryResourceUrl(record?.productResources)
            return url ? <img src={url} alt={record?.name || ''} style={{ width: 48 }} /> : null
          }}
        />
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
