import React, { useContext, useState } from 'react';
import logo from '../../assets/logo.png';
import { base_url } from '../../config/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import storeContext from '../../context/storeContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(storeContext);
  const [loader, setLoader] = useState(false);

  const [state, setState] = useState({
    email: '',
    password: '',
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const { data } = await axios.post(`${base_url}/api/login`, state);
      setLoader(false);
      localStorage.setItem('newsToken', data.token);
      toast.success(data.message);
      dispatch({
        type: 'login_success',
        payload: {
          token: data.token,
        },
      });
      navigate('/dashboard');
    } catch (error) {
      setLoader(false);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className='min-w-screen min-h-screen bg-slate-200 flex justify-center items-center'>
      <div className='w-[340px] text-slate-600 shadow-md'>
        <div className='bg-white h-full px-7 py-8 rounded-md'>
          <div className='w-full flex justify-center items-center'>
            <img className='w-[200px]' src={logo} alt='' />
          </div>
          <form onSubmit={submit} className='mt-8'>
            <div className='flex flex-col gap-y-2'>
              <label
                className='text-md font-medium text-gray-600'
                htmlFor='email'>
                Email
              </label>
              <input
                onChange={inputHandle}
                value={state.email}
                required
                type='email'
                placeholder='email'
                name='email'
                className='px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10'
                id='email'
              />
            </div>
            <div className='flex flex-col gap-y-2'>
              <label
                className='text-md font-medium text-gray-600'
                htmlFor='password'>
                Password
              </label>
              <input
                onChange={inputHandle}
                value={state.password}
                required
                type='password'
                placeholder='password'
                name='password'
                className='px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10'
                id='password'
              />
            </div>
            <div className='mt-4'>
              <button
                disabled={loader}
                className='px-3 py-[6px] w-full bg-purple-500 rounded-sm text-white hover:bg-purple-600'>
                {loader ? 'loading...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
