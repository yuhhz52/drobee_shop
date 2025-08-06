import React from 'react'
import { Admin, fetchUtils, Resource, withLifecycleCallbacks } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import ProductList from './ProductList';
import EditProduct from './EditProduct';
import CreateProduct from './CreateProduct';
import CategoryList from './Category/CategoryList';
import CategoryEdit from './Category/CategoryEdit';
import { fileUploadAPI } from '../../api/fileUploadAPI.js';

const httpClient = (url,options={})=>{

  const token = localStorage.getItem('authToken');
  if(!options.headers) options.headers = new Headers();
  options.headers.set('Authorization',`Bearer ${token}`);
  return fetchUtils.fetchJson(url,options);
}

const BASE_URL = 'http://localhost:8080';

const dataProvider = withLifecycleCallbacks(simpleRestProvider(BASE_URL + '/api', httpClient), [
  {
    resource: "products",
    beforeSave: async (params, dataProvider) => {
    const requestBody = { ...params };

    // === Thumbnail ===
    if (params?.thumbnail?.rawFile) {
      const fileName = params.thumbnail.rawFile.name.replaceAll(" ", "-");
      const formData = new FormData();
      formData.append("file", params.thumbnail.rawFile);
      formData.append("fileName", fileName);

      const thumbnailPath = await fileUploadAPI(formData);
      requestBody.thumbnail = BASE_URL + thumbnailPath;
    }

    // === productResources ===
    const productResList = await Promise.all(
      (params?.productResources ?? []).map(async (resource) => {
        if (resource?.url?.rawFile) {
          const fileName = resource.url.rawFile.name.replaceAll(" ", "-");
          const formData = new FormData();
          formData.append("file", resource.url.rawFile);
          formData.append("fileName", fileName);
          const path = await fileUploadAPI(formData);
          return {
            ...resource,
            url: BASE_URL + path,
          };
        }
        return resource; // Nếu không có file mới, giữ nguyên
      })
    );

    return {
      ...requestBody,
      productResources: productResList,
    };
  }

  },
]);


const AdminPanel = () => {
  
  return (
    <Admin dataProvider={dataProvider} basename='/admin'>
      <Resource name='products' list={ProductList} edit={EditProduct} create={CreateProduct}/>
      <Resource name='category' list={CategoryList} edit={CategoryEdit}/>
    </Admin>
  )
}

export default AdminPanel
