import axios from "axios";
import { API_BASE_URL, API_URL } from "./constant"


export const getAllProducts = async ({ categoryId, typeIds = [], name, newArrival, page = 0, size = 12 }) => {
  typeIds = Array.isArray(typeIds) ? typeIds : (typeIds ? [typeIds] : []);
  let url = API_BASE_URL + API_URL.GET_PRODUCTS + `?page=${page}&size=${size}&`;

  if (categoryId) url += `categoryId=${categoryId}&`;
  if (typeIds && typeIds.length > 0) {
    typeIds.forEach(id => {
      url += `typeIds=${id}&`;
    });
  }
  if (name) url += `name=${encodeURIComponent(name)}&`;
   if (newArrival) url += `newArrival=${newArrival}&`;

  url = url.replace(/&$/, "");

  try {
    const result = await axios.get(url, { validateStatus: () => true });
    const contentRange = result.headers["content-range"]; 
    let totalElements = 0;
    if (contentRange) {
      totalElements = parseInt(contentRange.split("/")[1], 10) || 0;
    }
    return {
      products: result?.data || [],
      totalElements
    };
  } catch (err) {
    console.error(err);
    return { products: [], totalElements: 0 };
  }
};

export const getProductBySlug = async (slug)=>{
    const url = API_BASE_URL + API_URL.GET_PRODUCTS + `?slug=${slug}`;
    try{
        const result = await axios(url,{
            method:"GET",
        });
        return result?.data?.[0];
    }
    catch(err){
        console.error(err);
    }
}