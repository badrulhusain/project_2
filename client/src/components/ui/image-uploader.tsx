'use client';
import Image from 'next/image';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';

type Upload = { url: string; publicId: string };
type Signature = { cloudName: string; apiKey: string; timestamp: number; folder: string; publicId: string; signature: string };
export function ImageUploader({ folder, value, onChange }: { folder: 'events'|'food'; value?: Upload | null; onChange: (value: Upload | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error('Choose a JPEG, PNG or WebP image under 5 MB.'); return; }
    try {
      setProgress(0);
      const signed = await api<Signature>(`/api/uploads/signature?folder=${folder}`);
      const form = new FormData();
      form.append('file',file); form.append('api_key',signed.apiKey); form.append('timestamp',String(signed.timestamp)); form.append('folder',signed.folder); form.append('public_id',signed.publicId); form.append('signature',signed.signature);
      const result = await new Promise<{secure_url:string;public_id:string}>((resolve,reject)=>{
        const request = new XMLHttpRequest();
        request.open('POST',`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
        request.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded/event.total*100)); };
        request.onload = () => { try { const json=JSON.parse(request.responseText); if(request.status>=200&&request.status<300) resolve(json); else reject(new Error(json.error?.message??'Upload failed')); } catch(error){reject(error);} };
        request.onerror = () => reject(new Error('Network error while uploading'));
        request.send(form);
      });
      onChange({url:result.secure_url,publicId:result.public_id}); toast.success('Image uploaded.');
    } catch(error) { toast.error(error instanceof Error?error.message:'Could not upload image.'); } finally { setProgress(null); if(input.current) input.current.value=''; }
  }
  return <div className="space-y-2"><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose an image" onChange={event=>upload(event.target.files?.[0])}/>{value?.url?<div className="relative h-52 overflow-hidden rounded-2xl border border-line"><Image src={value.url} alt="Uploaded preview" fill sizes="(max-width:768px) 100vw, 600px" className="object-cover"/><button type="button" onClick={()=>onChange(null)} className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-xl bg-surface text-negative shadow" aria-label="Remove image"><Trash2 size={17}/></button></div>:<button type="button" onClick={()=>input.current?.click()} disabled={progress!==null} className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-background p-5 text-center hover:border-forest"><span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-surface text-forest">{progress===null?<ImagePlus size={23}/>:<UploadCloud size={23}/>}</span><strong className="text-sm">{progress===null?'Add an image':`Uploading ${progress}%`}</strong><span className="mt-1 text-xs text-muted">JPEG, PNG or WebP · up to 5 MB</span></button>}{value?.url&&<button type="button" className="text-xs font-bold text-forest" onClick={()=>input.current?.click()}>Replace image</button>}</div>;
}
