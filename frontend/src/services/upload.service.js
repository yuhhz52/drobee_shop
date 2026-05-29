import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

export const uploadService = {
  uploadFile(formData) {
    return publicClient
      .post(ENDPOINTS.fileUpload, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },
};

export const { uploadFile: fileUploadAPI } = uploadService;
