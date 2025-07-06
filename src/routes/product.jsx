import React from 'react'
import content from '../data/content.json';
import store from '../store/store';
import { getProductBySlug } from '../api/fetchProducts';

export const loaderProductBySlug =  async({params}) => {
   try{
    store.dispatch({ type: 'SET_LOADING', payload: true });
    
    // Validate that productSlug exists
    if (!params.productSlug) {
      throw new Response("Product slug is required", { status: 400 });
    }
    
    let product;
    
    try {
      // Try to fetch from API first
      product = await getProductBySlug(params.productSlug);
    } catch (apiError) {
      console.warn("API not available, falling back to local data:", apiError);
      
      // Fallback to local data if API fails
      product = content?.products?.find(p => 
        p.slug === params.productSlug || 
        p.id?.toString() === params.productSlug ||
        p.name?.toLowerCase().replace(/\s+/g, '-') === params.productSlug.toLowerCase()
      );
      
      if (!product) {
        throw new Response("Product not found", { status: 404 });
      }
    }
    
    // Check if product exists
    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }
    
    store.dispatch({ type: 'SET_LOADING', payload: false });
    return { product };
   }catch(err){
    console.error("Error fetching product by slug:", err);
    store.dispatch({ type: 'SET_LOADING', payload: false });
    
    // If it's already a Response object (from our validation), throw it as is
    if (err instanceof Response) {
      throw err;
    }
    
    // If it's an axios error, extract the status and message
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.message || err.message || "Failed to fetch product";
      throw new Response(message, { status });
    }
    
    // For other errors, throw a generic 500 error
    throw new Response("Internal server error", { status: 500 });
   }
}

