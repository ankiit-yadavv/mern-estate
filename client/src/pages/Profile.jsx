import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {  
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable, } from 'firebase/storage';
import { app } from '../firebase'
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure, 
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

   //console.log(formData);
  useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
    (snapshot) => {
      const progress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
    },
    (error) => {
      setFileUploadError(true);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
        setFormData({ ...formData, avatar: downloadURL })
      );
     }
   );
  };


  const handleChange =  (e) => {
    setFormData({...formData, [e.target.id] : e.target.value });
  };

  const handleSubmit = async (e) =>{
      e.preventDefault();
      try {
        dispatch(updateUserStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type' :  'application/json',          
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false) {
          dispatch(updateUserFailure(data.message));
          return;
         }

         dispatch(updateUserSuccess(data));
         setUpdateSuccess(true);
      } catch (error) {
        dispatch(updateUserFailure(error.message));                
      }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
   // console.log('delete user');
    
  };

  const handleSignOut = async () => {

    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }

  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if( data.success === false ) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      
    } catch (error) {
       setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
       const data = await res.json();
       if(data.success === false) {
        console.log(data.message);
        return;
       } 
       setUserListings((prev) => prev.filter((listing) => listing._id != listing._id));
    } catch (error) {
      console.log(error.message);
    }

  };

   return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Profile </h1>
      <form 
        className='flex flex-col gap-4'
        onSubmit={handleSubmit}
        >
        <input onChange={(e) => setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*' /> 
        <img 
            onClick={()=> fileRef.current.click()} 
            src={ formData.avatar || currentUser.avatar } 
            alt='profile'
            className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' 
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Occured ! ( image must be less than 2 mb )
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input  
          type='text' 
          placeholder='username' 
          id='username'
          className='border p-3 rounded-lg' 
          defaultValue={currentUser.username}
          onChange={handleChange}  
          />
         <input
            type='email' 
            placeholder='email' 
            id='email'
            className='border p-3 rounded-lg' 
            defaultValue={currentUser.email}
            onChange={handleChange}  
            />
         <input 
            type='password' 
            placeholder='password' 
            id='password'
            className='border p-3 rounded-lg' />
         <button 
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95
          disabled:opacity-80'>
            {loading ? (
              <div role="status">
                  <svg aria-hidden="true" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <span className="sr-only">Loading...</span>Loading...
              </div>
            ) 
            : 'update'}
         </button>
         <Link
            className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
            to={ '/create-listing' }
         >
          Creating Listing

         </Link>   


      </form>  
      <div className='flex justify-between mt-5 '>
        <span 
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer md:font-semibold">
          Delete account
        </span>
        <span
          onClick={handleSignOut}
          className="text-red-700 cursor-pointer md:font-semibold">
          Sign out
        </span>
      </div>
      <p className='text-red-700 mt-5 text-center'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5 text-center'>
      { updateSuccess ? 'User Profile Updated successfully !' : ''}
      </p>
      
        <button 
          onClick={handleShowListings}
          className='
          text-green-700 w-full mt-3 text-xl md:font-bold'
        >
        Show Listings
        </button>   
        <p
          className='text-red-700 mt-5'
        >
          {showListingsError ? 'Error in Showing Listing' : ' '}
        </p>  

        {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>
          {userListings.map((listings) => (
            <div
              key={listings._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listings._id}`}>
                <img
                  src={listings.imageUrls[0]}
                  alt='listing cover'
                  className='h-20 w-20 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listings._id}`}
              >
                <p>{listings.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listings._id)}
                  className='text-red-700 '
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listings._id}`}>
                  <button className='text-green-700 '>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
