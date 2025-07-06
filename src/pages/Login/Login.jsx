import React, {  useCallback, useState } from 'react'
import GoogleSignIn from '../../components/Button/GoogleSignIn' 
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';
import { loginAPI } from '../../api/authencation.jsx';
import { saveToken } from '../../utils/jwt-helper';
const Login = () => {

    const [values,setValues] =useState({
    userName:'',
    password:''
  });

  const [errors,setErrors] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback((e) => {
     e.preventDefault();
     setErrors('');
     dispatch(setLoading(true));
     loginAPI(values)
     .then((res) => {
        if(res?.token)
          {
            saveToken(res?.token);
            navigate('/');
          }else
          {
            setErrors('Something went wrong');
          }
     }).catch(() => {
        setErrors( 'Invalid credentials');
     }).finally(() => {
        dispatch(setLoading(false));
     });  

     


    }, [values]);

  const handleOnChange = useCallback((e)=> {
    e.persist();
    setValues((values) => ({
      ...values,
      [e.target.name]: e.target.value,
    })); 
    }, []);




  return (
    <div className='px-4 w-[320px]'>
        <p className='text-3xl font-bold pb-4 pt-4'>Sign In</p>
        <GoogleSignIn />
        <p className='text-gray-500 items-center text-center w-full py-2'>OR</p>
         <div className='pt-4'>
            <form onSubmit={onSubmit}>
                <input type="email" name='userName' value={values?.userName} onChange={handleOnChange} placeholder='Email address' className='h-[48px] w-full border p-2 border-gray-400' required/>
                <input type="password" name='password'value={values?.password} onChange={handleOnChange} placeholder='Password' className='h-[48px] mt-8 w-full border p-2 border-gray-400' required autoComplete='new-password'/>
                <Link className='text-right w-full float-right underline pt-2 text-gray-500 hover:text-black'>Forgot Password?</Link>
                <button className='border w-full rounded-lg h-[48px] mb-4 bg-black text-white mt-4 hover:opacity-80'>Sign In</button>
            </form>
         </div>
        {errors && <p className='text-red-500 text-center'>{errors}</p>}
    </div>
  )
}

export default Login