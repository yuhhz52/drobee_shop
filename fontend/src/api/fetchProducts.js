import axios from "axios";
import { API_BASE_URL, API_URL } from "./constant"


export const getAllProducts = async (categoryId, typeIds = [], name) => {
    typeIds = Array.isArray(typeIds) ? typeIds : (typeIds ? [typeIds] : []);
    let url = API_BASE_URL + API_URL.GET_PRODUCTS + `?`;
    if (categoryId) url += `categoryId=${categoryId}&`;
    if (typeIds && typeIds.length > 0) {
        typeIds.forEach(id => {
            url += `typeIds=${id}&`;
        });
    }
    
    if (name) {
        url += `name=${encodeURIComponent(name)}&`;
    }
    url = url.replace(/&$/, ''); 

    try{
        const result = await axios(url,{
            method:"GET"
        });
        return result?.data;
    }
    catch(err){
        console.error(err);
    }
}

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