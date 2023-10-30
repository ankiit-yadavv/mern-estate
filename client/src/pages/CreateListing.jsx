import React, { useState } from 'react';
import { getDownloadURL, getStorage} from 'firebase/storage';
import { app } from '../firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [files , setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address:'',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });
    // console.log(files);
   // console.log(formData);
    const [imageUploadError , setImageUploadError] = useState(false);
    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
          setUploading(true);
          setImageUploadError(false);
          const promises = [];
    
          for (let i = 0; i < files.length; i++) {
            promises.push(storeImage(files[i]));
          }
          Promise.all(promises)
            .then((urls) => {
              setFormData({
                ...formData,
                imageUrls: formData.imageUrls.concat(urls),
              });
              setImageUploadError(false);
              setUploading(false);
            })
            .catch((err) => {
              setImageUploadError('Image upload failed (2 mb max per image)');
              setUploading(false);
            });
        } else {
          setImageUploadError('You can only upload 6 images per listing');
          setUploading(false);
        }
      };
    
//    console.log(formData);
    const storeImage = (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getMinutes()+file.name;
            const storageRef = ref (storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes)* 100;       
                        console.log(Math.round(progress));
                    },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );

        });
    };

    const handleRemoveImage = (index) => {
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
      };
    
      const handleChange = (e) => {
        if(e.target.id === 'sale' || e.target.id === 'rent'){
            setFormData({
                ...formData,
                type: e.target.id
            })
        }
        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }

        if(e.target.type === 'number' || e.target.type === 'textarea' || e.target.type === 'text'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.value  // reason of adding bracket [] is because if we direct type e.target.id then it will take it as "name" but with bracket it goes like name 
            })
        }
      };

      const handleSubmit =  async (e) => {
        e.preventDefault();
        try {
            if(formData.imageUrls.length == 0) return setError('You must Upload atleast one image!!!')
            console.log(formData.imageUrls.length);
            if(+formData.regularPrice < +formData.discountPrice) return setError('Discount Price must be lower than regular Price!');    
            setLoading(true);
            setError(false);
            const res = await fetch(`/api/listing/create` , {
                method: 'POST',
                headers : {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });
            const data = await res.json();
            setLoading(false);
            if(data.success === false) {
                setError(data.message);
            }   

            navigate(`/listing/${data._id}`);
            
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
      };


  return (
    <main 
        className='p-3 max-w-4xl mx-auto'
    >
        <h1
          className='text-3xl font-semibold text-center my-7'  
        >
            Create a Listing
        </h1>
        <form  onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
                 <input 
                    type='text' 
                    placeholder='Name' 
                    className='border p-3 rounded-lg' 
                    id='name' 
                    maxLength='62' 
                    minLength='10' 
                    required
                    onChange={handleChange}
                    value={formData.value}
                     />   
                 <textarea 
                    type='text' 
                    placeholder='Description' 
                    className='border p-3 rounded-lg resize-none' 
                    id='description' 
                    required 
                    onChange={handleChange}
                    value={formData.description}    
                    />   
                 <input 
                    type='text' 
                    placeholder='Address' 
                    className='border p-3 rounded-lg' 
                    id='address' 
                    required
                    onChange={handleChange}
                    value={formData.address}
                     /> 
                 <div className='flex gap-5 flex-wrap'>
                    <div className='flex gap-2'>
                    <input 
                        type='checkbox' 
                        id='sale' 
                        className='w-5' 
                        onChange={handleChange}
                        checked={formData.type === 'sale'}    
                        />
                    <span>Sell</span>
                    </div>
                    <div className='flex gap-2'>
                    <input 
                    type='checkbox' 
                    id='rent' 
                    className='w-5' 
                    onChange={handleChange}
                    checked={formData.type === 'rent'}    
                    />
                    <span>Rent</span>
                    </div>
                    <div className='flex gap-2'>
                    <input 
                    type='checkbox' 
                    id='parking' 
                    className='w-5' 
                    onChange={handleChange}
                    checked={formData.parking}
                    />
                    <span>Parking spot</span>
                    </div>
                    <div className='flex gap-2'>
                    <input 
                    type='checkbox' 
                    id='furnished' 
                    className='w-5' 
                    onChange={handleChange}
                    checked={formData.furnished}    
                    />
                    <span>Furnished</span>
                    </div>
                    <div className='flex gap-2'>
                    <input 
                    type='checkbox' 
                    id='offer' 
                    className='w-5' 
                    onChange={handleChange}
                    checked={formData.offer}    
                    />
                    <span>Offer</span>
                    </div>
                </div>
                <div className='flex flex-wrap gap-6'>
                <div className='flex items-center gap-2'>
                <input
                    type='number'
                    id='bedrooms'
                    min='1'
                    max='10'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.bedrooms}

                />
                <p>Beds</p>
                </div>
                <div className='flex items-center gap-2'>
                <input
                    type='number'
                    id='bathrooms'
                    min='1'
                    max='10'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.bathrooms}

                />
                <p>Baths</p>
                </div>
                <div className='flex items-center gap-2'>
                <input
                    type='number'
                    id='regularPrice'
                    min='50'
                    max='100000'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.regularPrice}
                />
                <div className='flex flex-col items-center'>
                    <p>Regular price</p>
                    <span className='text-xs'>($ / month)</span>
                </div>
                </div>
                {formData.offer && (
                <div className='flex items-center gap-2'>
                <input
                    type='number'
                    id='discountPrice'
                    min='0'
                    max='100000'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.discountPrice}

                />
                <div className='flex flex-col items-center'>
                    <p>Discounted price</p>
                    <span className='text-xs'>($ / month)</span>
                </div>
                </div>
                )}
            </div>
            </div>
            <div className="flex flex-col flex-1 gap-6">
                <p className='font-semibold'>Images:
                <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                </p>
                <div className="flex gap-4">
                    <input 
                        onChange={(e) => setFiles(e.target.files)}
                        className='p-3 border border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple />
                    <button 
                        type='button'
                        disabled={uploading}
                        onClick={handleImageSubmit}
                        className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
                        >
                        {uploading ? (<div role="status">
                            <svg aria-hidden="true" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>Uploading
                           </div>) 
                           : 'Upload'}
                 </button>
                </div>
                <p 
                    className='text-red-700 text-center text-sm'
                >
                    {imageUploadError && imageUploadError}
                </p>
                {formData.imageUrls.length > 0 &&
                 formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url}
                  alt='listing image'
                  className='w-20 h-20 object-contain rounded-lg'
                />
                <button
                  type='button'
                  onClick={() => handleRemoveImage(index)}
                  className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                >
                  Delete
                </button>
              </div>
            ))}

            <button disabled= {loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                {loading ? (
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>Loading...
                    </div>


                ) : 'Create Listing'}

            </button>
            { error && <p className='text-red-700 text-center'>{error}</p> }
            </div>

        </form>
      
    </main>
  )
}
