const BASE_URL = import.meta.env.VITE_BASE_API_URL

interface UploadResponse {
  originalname: string
  filename: string
  location: string
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Gagal mengunggah gambar.')
  }

  const data = (await response.json()) as UploadResponse
  return data.location
}
