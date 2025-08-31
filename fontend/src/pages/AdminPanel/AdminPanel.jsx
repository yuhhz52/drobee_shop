import { Admin, fetchUtils, Resource, withLifecycleCallbacks } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import ProductList from './ProductList';
import EditProduct from './EditProduct';
import CreateProduct from './CreateProduct';
import CategoryList from './Category/CategoryList';
import CategoryEdit from './Category/CategoryEdit';
import { UserList } from './User/UserList.jsx';
import { fileUploadAPI } from '../../api/fileUploadAPI.js';
import OrderList from "./Order/OrderList.jsx";

const BASE_URL = 'http://localhost:8080/api';

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Refresh token failed");

    const data = await response.json();

    //lưu lại accessToken mới
    localStorage.setItem("accessToken", data.accessToken);

    return data.accessToken;
  } catch (err) {
    console.error("Refresh token error:", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return null;
  }
};

const httpClient = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken"); 
  if (!options.headers) options.headers = new Headers();

  if (token && token !== "null" && token !== "undefined") {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    return await fetchUtils.fetchJson(url, options);
  } catch (error) {
    if (error.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        options.headers.set("Authorization", `Bearer ${newToken}`);
        return fetchUtils.fetchJson(url, options);
      }
    }
    throw error;
  }
};

// Tạo base provider
const baseProvider = simpleRestProvider(BASE_URL, httpClient);

// Ghi đè getList để dùng page & size
const customProvider = {
  ...baseProvider,
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const url = `${BASE_URL}/${resource}?page=${page - 1}&size=${perPage}&sort=${field},${order}`;

    return httpClient(url).then(({ headers, json }) => {
      const total = parseInt(headers.get('Content-Range')?.split('/')?.[1], 10);
      return {
        data: json,
        total: total || json.length,
      };
    });
  },
  delete: (resource, params) => {
    const url = `${BASE_URL}/${resource}/${params.id}`;
    return httpClient(url, { method: 'DELETE' }).then(() => ({
      data: { id: params.id },
    }));
  },
  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map(id =>
        httpClient(`${BASE_URL}/${resource}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
      )
    ).then(responses => ({
      data: responses.map((res, index) => {
        if (res && res.json && res.json.id) return res.json.id;
        return params.ids[index];
      }),
    })),
};

// Thêm lifecycle upload ảnh
const dataProvider = withLifecycleCallbacks(customProvider, [
  {
    resource: "products",
    beforeSave: async (params) => {
      const requestBody = { ...params };

      // === Thumbnail ===
      if (params?.thumbnail?.rawFile) {
        const fileName = params.thumbnail.rawFile.name.replaceAll(" ", "-");
        const formData = new FormData();
        formData.append("file", params.thumbnail.rawFile);
        formData.append("fileName", fileName);
        const thumbnailPath = await fileUploadAPI(formData);
        requestBody.thumbnail = BASE_URL.replace("/api", "") + thumbnailPath;
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
            return { ...resource, url: BASE_URL.replace("/api", "") + path };
          }
          return resource;
        })
      );

      return {
        ...requestBody,
        productResources: productResList,
      };
    },
  },
]);

const AdminPanel = () => (
  <Admin dataProvider={dataProvider} basename="/admin">
    <Resource name="products" list={ProductList} edit={EditProduct} create={CreateProduct} />
    <Resource name="category" list={CategoryList} edit={CategoryEdit} />
    <Resource name="user" list={UserList} />
    <Resource name="order" list={OrderList} />
  </Admin>
);

export default AdminPanel;
