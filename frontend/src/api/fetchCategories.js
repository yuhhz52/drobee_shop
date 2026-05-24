import axios from 'axios';
import { API_BASE_URL,API_URL } from "./constant";

const extractCategoryList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export const fetchCategories = async()=> {
    const url = API_BASE_URL + API_URL.GET_CATEGORIES;

    try{
        const result = await axios(url,{
            method:'GET'
        });
        return extractCategoryList(result?.data);
    }
    catch(e){
        console.log(e);
        return [];
    }
}