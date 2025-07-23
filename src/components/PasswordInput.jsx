// hooks
import {useState, useEffect} from 'react';

// utils
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({innerRef, id, label = 'Password', isInvalid, ...props}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = e => {
        e.preventDefault();
        setIsPasswordVisible(!isPasswordVisible);
    }

    useEffect(() => {
        props.value === '' && setIsPasswordVisible(false);
    }, [props.value]);

    return (
        <div className="flex flex-col gap-[8px]">
            <label className="font-bold text-[14px] text-gray-500 w-fit" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input className={classNames('h-[48px] w-full px-[8px] bg-white border border-gray-400 transition-all truncate pr-10', {'border-red-500': isInvalid})}
                       id={id}
                       type={isPasswordVisible ? 'text' : 'password'}
                       ref={innerRef}
                       {...props}/>
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 leading-none text-gray-500 hover:text-gray-700"
                    aria-label="Chuyển đổi hiển thị mật khẩu"
                    >
                    {isPasswordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
            </div>
        </div>
    )
}

PasswordInput.propTypes = {
    innerRef: PropTypes.func,
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    isInvalid: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
}

export default PasswordInput